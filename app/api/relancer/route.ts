import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEmailContent, getSmsContent } from '../../lib/email-templates'

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Crée (ou réutilise) un lien de paiement Stripe Checkout pour une facture.
 * Retourne null silencieusement si Stripe n'est pas configuré.
 */
async function getOrCreatePaymentUrl(
  factureId: string,
  montant: number,
  clientNom: string,
  numeroFacture: string,
  userId: string,
): Promise<string | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proboost.fr'
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : appUrl

    const response = await fetch(`${baseUrl}/api/paiement-facture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  try {
    const {
      factureId, clientEmail, clientNom, clientTelephone,
      montant, dateEcheance, nombreRelances, numeroFacture,
      companyName, companyAddress, companyPhone,
      typeRelance = 'email', // 'email' | 'sms' | 'both'
      userPlan = 'starter',
      userId,               // ID de l'utilisateur ProBoost (pour le lien de paiement)
    } = await request.json()

    // Sécurité : bloquer SMS si plan non Pro
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
    if (factureId && userId) {
      paymentUrl = await getOrCreatePaymentUrl(
        factureId, montant, clientNom, numeroFacture, userId
      ) ?? undefined
    }

    // ── EMAIL ──
    if (sendEmail) {
      const { subject, html } = getEmailContent({
        clientNom, montant, dateEcheance, numeroFacture,
        companyName: company, companyAddress: companyAddress || '',
        companyPhone: companyPhone || '', numeroRelance,
        paymentUrl,
      })
      const { error: emailError } = await resend.emails.send({
        from: `ProBoost <onboarding@resend.dev>`,
        to: clientEmail,
        subject,
        html,
      })
      if (emailError) {
        console.error('ERREUR RESEND EMAIL:', emailError)
        return NextResponse.json({ error: emailError }, { status: 500 })
      }
    }

    // ── SMS ──
    // Twilio non encore intégré — log pour l'instant, prêt pour branchement
    if (sendSms) {
      const smsBody = getSmsContent(clientNom, montant, numeroFacture, company, numeroRelance)
      console.log(`[SMS SIMULÉ] → ${clientTelephone} : ${smsBody}`)
      // TODO: intégrer Twilio ici
      // await twilioClient.messages.create({ body: smsBody, from: process.env.TWILIO_PHONE, to: clientTelephone })
    }

    // ── MISE À JOUR SUPABASE ──
    const { error: dbError } = await supabase
      .from('factures')
      .update({ nombre_relances: numeroRelance, statut: 'relancée' })
      .eq('id', factureId)

    if (dbError) {
      console.error('ERREUR SUPABASE:', dbError)
      return NextResponse.json({ error: dbError }, { status: 500 })
    }

    const typeLog = sendEmail && sendSms ? 'email+sms' : sendSms ? 'sms' : 'email'
    await supabase.from('relances').insert({
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