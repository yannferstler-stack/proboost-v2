import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEmailContent, getSmsContent } from '../../lib/email-templates'
import { getAuthUserId } from '../../lib/auth'
import { getOrCreatePaymentUrl } from '../../lib/payment'

// ── Rate limiting : 20 relances max par utilisateur par fenêtre de 10 min ──
// Note : en serverless, ce compteur est par instance. Pour une solution robuste, utiliser Redis.
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

const getResend = () => new Resend(process.env.RESEND_API_KEY)
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      montant, dateEcheance, numeroFacture,
      companyName, companyAddress, companyPhone,
      typeRelance = 'email', // 'email' | 'sms' | 'both'
    } = await request.json()

    const supabaseAdmin = getSupabaseAdmin()

    // ── Vérifier l'état réel de la facture depuis la DB (ne jamais faire confiance au client) ──
    const { data: facture } = await supabaseAdmin
      .from('factures')
      .select('nombre_relances, statut')
      .eq('id', factureId)
      .eq('user_id', authenticatedId)
      .single()

    if (!facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }
    if (facture.statut === 'payée') {
      return NextResponse.json({ error: 'Cette facture est déjà réglée.' }, { status: 400 })
    }

    // ── Lire le plan depuis la DB (ne jamais faire confiance au client) ──
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, template_relance_1, template_relance_2, template_relance_3')
      .eq('id', authenticatedId)
      .single()
    const userPlan: string = profile?.plan ?? 'starter'

    // ── Enforce plan limits côté serveur ──
    const maxRelances = userPlan === 'starter' ? 3 : 5
    const nombreRelancesActuel = facture.nombre_relances || 0

    if (nombreRelancesActuel >= maxRelances) {
      return NextResponse.json(
        { error: `Limite de ${maxRelances} relances atteinte pour votre plan ${userPlan}.` },
        { status: 403 }
      )
    }

    // Récupérer le template personnalisé pour ce niveau de relance
    const numeroRelance = nombreRelancesActuel + 1
    const templateKey = `template_relance_${Math.min(numeroRelance, 3)}` as keyof typeof profile
    const customMessage: string | undefined = profile?.[templateKey] || undefined

    // ── Bloquer SMS si plan non Pro (enforce côté serveur) ──
    const canSms = userPlan === 'pro'
    const sendEmail = typeRelance === 'email' || typeRelance === 'both'
    const sendSms = (typeRelance === 'sms' || typeRelance === 'both') && canSms

    if (!sendEmail && !sendSms) {
      return NextResponse.json({ error: 'Aucun canal de relance valide' }, { status: 400 })
    }

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
        return NextResponse.json({ error: emailError }, { status: 500 })
      }
    }

    // ── SMS via Twilio (Pro uniquement) ──
    if (sendSms) {
      const smsBody = getSmsContent(clientNom, montant, numeroFacture, company, numeroRelance, dateEcheance)
      const sid = process.env.TWILIO_ACCOUNT_SID
      const token = process.env.TWILIO_AUTH_TOKEN
      const from = process.env.TWILIO_PHONE
      if (sid && token && from && clientTelephone) {
        const twilio = require('twilio')
        const twilioClient = twilio(sid, token)
        await twilioClient.messages.create({ body: smsBody, from, to: clientTelephone })
      }
    }

    // ── MISE À JOUR SUPABASE (service role + vérification ownership) ──
    const { error: dbError } = await supabaseAdmin
      .from('factures')
      .update({ nombre_relances: numeroRelance, statut: 'relancée' })
      .eq('id', factureId)
      .eq('user_id', authenticatedId)

    if (dbError) {
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
    console.error('ERREUR RELANCER:', (error as any)?.message || error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
