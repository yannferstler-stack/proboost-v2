import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEmailContent, getSmsContent } from '../../lib/email-templates'
import { getAuthUserId } from '../../lib/auth'

// ── Rate limiting : 20 relances max par utilisateur par fenêtre de 10 min ──
const RELANCER_WINDOW_MS = 10 * 60 * 1000
const RELANCER_MAX = 20
const relancerRateMap = new Map<string, { count: number; resetAt: number }>()

function checkRelancerRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = relancerRateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    relancerRateMap.set(userId, { count: 1, resetAt: now + RELANCER_WINDOW_MS })
    return true
  }
  if (entry.count >= RELANCER_MAX) return false
  entry.count++
  return true
}

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

const getResend = () => new Resend(process.env.RESEND_API_KEY)
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Crée (ou réutilise) un lien de paiement Stripe Checkout pour une facture.
 * Appelle la route interne /api/paiement-facture avec le secret interne.
 */
async function getOrCreatePaymentUrl(
  factureId: string,
  montant: number,
  clientNom: string,
  numeroFacture: string,
  userId: string,
): Promise<string | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://manaflow.fr'
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : appUrl

    const response = await fetch(`${baseUrl}/api/paiement-facture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Secret interne pour appels serveur-à-serveur
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ factureId, montant, clientNom, numeroFacture, userId }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.url ?? null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  // ── Auth : vérifier le JWT et récupérer l'ID depuis le token ──
  const authenticatedId = await getAuthUserId(request)
  if (!authenticatedId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!checkRelancerRateLimit(authenticatedId)) {
    return NextResponse.json(
      { error: 'Trop de relances envoyées. Réessayez dans quelques minutes.' },
      { status: 429 }
    )
  }

  try {
    const {
      factureId, clientEmail, clientNom, clientTelephone,
      montant, dateEcheance, nombreRelances, numeroFacture,
      companyName, companyAddress, companyPhone,
      typeRelance = 'email', // 'email' | 'sms' | 'both'
    } = await request.json()

    const supabaseAdmin = getSupabaseAdmin()

    // Lire le plan depuis la DB (ne jamais faire confiance au client)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, template_relance_1, template_relance_2, template_relance_3')
      .eq('id', authenticatedId)
      .single()
    const userPlan: string = profile?.plan ?? 'starter'

    // Récupérer le template personnalisé pour ce niveau de relance
    const numeroRelanceForTemplate = (nombreRelances + 1)
    const templateKey = `template_relance_${Math.min(numeroRelanceForTemplate, 3)}` as keyof typeof profile
    const customMessage: string | undefined = profile?.[templateKey] || undefined

    // Bloquer SMS si plan non Pro
    const canSms = userPlan === 'pro'
    const sendEmail = typeRelance === 'email' || typeRelance === 'both'
    const sendSms = (typeRelance === 'sms' || typeRelance === 'both') && canSms

    if (!sendEmail && !sendSms) {
      return NextResponse.json({ error: 'Aucun canal de relance valide' }, { status: 400 })
    }

    const numeroRelance = nombreRelances + 1
    const company = companyName || 'Votre société'

    // ── LIEN DE PAIEMENT (généré une fois, avant l'envoi) ──
    let paymentUrl: string | undefined
    if (factureId) {
      paymentUrl = await getOrCreatePaymentUrl(
        factureId, montant, clientNom, numeroFacture, authenticatedId
      ) ?? undefined
    }

    // ── EMAIL ──
    if (sendEmail) {
      const { subject, html } = getEmailContent({
        clientNom, montant, dateEcheance, numeroFacture,
        companyName: company, companyAddress: companyAddress || '',
        companyPhone: companyPhone || '', numeroRelance,
        paymentUrl, customMessage,
      })
      const { error: emailError } = await getResend().emails.send({
        from: `ManaFlow <noreply@manaflow.fr>`,
        to: clientEmail,
        subject,
        html,
      })
      if (emailError) {
        console.error('ERREUR RESEND EMAIL:', emailError)
        return NextResponse.json({ error: emailError }, { status: 500 })
      }
    }

    // ── SMS via Twilio ──
    if (sendSms) {
      const smsBody = getSmsContent(clientNom, montant, numeroFacture, company, numeroRelance)
      const sid = process.env.TWILIO_ACCOUNT_SID
      const token = process.env.TWILIO_AUTH_TOKEN
      const from = process.env.TWILIO_PHONE
      if (sid && token && from && clientTelephone) {
        const twilio = require('twilio')
        const twilioClient = twilio(sid, token)
        await twilioClient.messages.create({ body: smsBody, from, to: clientTelephone })
      } else {
        console.log(`[SMS non envoyé — Twilio non configuré] → ${clientTelephone} : ${smsBody}`)
      }
    }

    // ── MISE À JOUR SUPABASE (service role + vérification ownership) ──
    const { error: dbError } = await supabaseAdmin
      .from('factures')
      .update({ nombre_relances: numeroRelance, statut: 'relancée' })
      .eq('id', factureId)
      .eq('user_id', authenticatedId)

    if (dbError) {
      console.error('ERREUR SUPABASE:', dbError)
      return NextResponse.json({ error: dbError }, { status: 500 })
    }

    const typeLog = sendEmail && sendSms ? 'email+sms' : sendSms ? 'sms' : 'email'
    await supabaseAdmin.from('relances').insert({
      facture_id: factureId,
      type: typeLog,
      numero_relance: numeroRelance,
      envoye_le: new Date().toISOString(),
      statut: 'envoyé',
    })

    return NextResponse.json({ success: true, numeroRelance, typeRelance: typeLog })
  } catch (error) {
    console.error('ERREUR RELANCER:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
