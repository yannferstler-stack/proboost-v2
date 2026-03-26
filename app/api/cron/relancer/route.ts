import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'
import { Resend } from 'resend'
import { getEmailContent, getSmsContent } from '../../../lib/email-templates'
import { getOrCreatePaymentUrl } from '../../../lib/payment'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

/**
 * Vérifie le CRON_SECRET avec une comparaison timing-safe pour éviter les timing attacks.
 */
function verifyCronSecret(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || !authHeader) return false
  const expected = `Bearer ${cronSecret}`
  if (authHeader.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  } catch {
    return false
  }
}

// Calcule les délais de relance à partir du profil
function getDelais(profile: any): number[] {
  return [
    profile?.sequence_j1 ?? 7,
    profile?.sequence_j2 ?? 15,
    profile?.sequence_j3 ?? 30,
    ...(profile?.sequence_j4 ? [profile.sequence_j4] : []),
    ...(profile?.sequence_j5 ? [profile.sequence_j5] : []),
  ]
}

// Calcule la prochaine date de relance après la relance N
function calcNextRelanceDate(
  dateEcheance: string,
  nombreRelancesFait: number, // après l'envoi actuel
  delais: number[],
): Date | null {
  const echeance = new Date(dateEcheance)
  echeance.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const j1 = delais[0]
  const limitePassee = new Date(today)
  limitePassee.setDate(today.getDate() - j1)

  // Première relance = echeance + j1, ou aujourd'hui si déjà dépassé
  const firstRelanceDate = echeance <= limitePassee
    ? today
    : new Date(echeance.getTime() + j1 * 86_400_000)

  // Index de la prochaine relance (0-based)
  const nextIndex = nombreRelancesFait
  if (nextIndex >= delais.length) return null

  const nextDate = new Date(firstRelanceDate)
  nextDate.setDate(nextDate.getDate() + (delais[nextIndex] - delais[0]))

  return nextDate >= today ? nextDate : null
}

export async function GET(request: NextRequest) {
  // Vérification Vercel Cron (Authorization header) — timing-safe
  const authHeader = request.headers.get('Authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Récupérer toutes les factures dont la prochaine relance est due
  const { data: factures, error } = await supabase
    .from('factures')
    .select(`
      *,
      profiles:user_id (
        company_name, company_address, company_phone, plan,
        canal_relance, sequence_j1, sequence_j2, sequence_j3, sequence_j4, sequence_j5
      )
    `)
    .eq('sequence_active', true)
    .lte('next_relance_date', new Date().toISOString())
    .neq('statut', 'payée')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!factures || factures.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Aucune relance à envoyer' })
  }

  // Traitement parallèle par lots de 20 pour éviter la saturation des APIs externes
  const BATCH_SIZE = 20

  async function processFacture(facture: any): Promise<{ id: string; status: string; numero?: number; error?: string }> {
    const profile = facture.profiles as any
    const company = profile?.company_name || 'Votre société'
    const canal = profile?.canal_relance || 'email'
    const numeroRelance = (facture.nombre_relances || 0) + 1
    const maxRelances = profile?.plan === 'starter' ? 3 : 5
    const delais = getDelais(profile)

    // Vérification côté serveur de la limite du plan
    if ((facture.nombre_relances || 0) >= maxRelances) {
      await supabase.from('factures').update({ sequence_active: false }).eq('id', facture.id)
      return { id: facture.id, status: 'skip', error: 'Limite de relances atteinte' }
    }

    // Bloquer les SMS si le plan n'est pas Pro (enforce côté serveur)
    const canSms = profile?.plan === 'pro'
    const effectiveCanal = (!canSms && (canal === 'sms' || canal === 'both')) ? 'email' : canal

    try {
      // ── Lien de paiement ──
      let paymentUrl: string | undefined
      if (facture.user_id) {
        paymentUrl = await getOrCreatePaymentUrl(
          facture.id,
          facture.montant,
          facture.client_nom,
          facture.numero_facture,
          facture.user_id,
        ) ?? undefined
      }

      // ── Envoi Email ──
      if (effectiveCanal === 'email' || effectiveCanal === 'both') {
        if (!facture.client_email) {
          return { id: facture.id, status: 'skip', error: 'Pas d\'email client' }
        }
        const { subject, html } = getEmailContent({
          clientNom: facture.client_nom,
          montant: facture.montant,
          dateEcheance: facture.date_echeance,
          numeroFacture: facture.numero_facture,
          companyName: company,
          companyAddress: profile?.company_address || '',
          companyPhone: profile?.company_phone || '',
          numeroRelance,
          paymentUrl,
        })
        await getResend().emails.send({
          from: `ManaFlow <noreply@manaflow.fr>`,
          to: facture.client_email,
          subject,
          html,
        })
      }

      // ── SMS via Twilio (Pro uniquement) ──
      if (effectiveCanal === 'sms' || effectiveCanal === 'both') {
        const smsBody = getSmsContent(facture.client_nom, facture.montant, facture.numero_facture || '', company, numeroRelance, facture.date_echeance)
        const sid = process.env.TWILIO_ACCOUNT_SID
        const twilioToken = process.env.TWILIO_AUTH_TOKEN
        const from = process.env.TWILIO_PHONE
        if (sid && twilioToken && from && facture.client_telephone) {
          try {
            const twilio = require('twilio')
            const twilioClient = twilio(sid, twilioToken)
            await twilioClient.messages.create({ body: smsBody, from, to: facture.client_telephone })
          } catch (smsErr: any) {
            // Erreur SMS — log code uniquement (sans ID facture pour RGPD)
            void smsErr // code: smsErr?.code || smsErr?.status
          }
        }
      }

      // ── Calculer la prochaine date ──
      const nextDate = calcNextRelanceDate(facture.date_echeance, numeroRelance, delais)
      const moreRelances = numeroRelance < maxRelances && nextDate !== null

      // ── Mettre à jour facture + historique en parallèle ──
      await Promise.all([
        supabase.from('factures').update({
          nombre_relances: numeroRelance,
          statut: 'relancée',
          sequence_active: moreRelances,
          next_relance_date: moreRelances ? nextDate!.toISOString() : null,
        }).eq('id', facture.id),
        supabase.from('relances').insert({
          facture_id: facture.id,
          type: effectiveCanal,
          numero_relance: numeroRelance,
          envoye_le: new Date().toISOString(),
          statut: 'envoyé',
        }),
      ])

      return { id: facture.id, status: 'ok', numero: numeroRelance }
    } catch (err) {
      // Erreur de traitement — sans ID facture pour RGPD
      await supabase.from('relances').insert({
        facture_id: facture.id,
        type: effectiveCanal,
        numero_relance: (facture.nombre_relances || 0) + 1,
        envoye_le: new Date().toISOString(),
        statut: 'erreur',
      }).then(null, () => {})
      return { id: facture.id, status: 'error', error: String((err as any)?.message || err) }
    }
  }

  // Traitement par lots
  const results: { id: string; status: string; numero?: number; error?: string }[] = []
  for (let i = 0; i < factures.length; i += BATCH_SIZE) {
    const batch = factures.slice(i, i + BATCH_SIZE)
    const settled = await Promise.allSettled(batch.map(processFacture))
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : { id: '?', status: 'error', error: String((r as any).reason) })
    }
  }

  const ok = results.filter(r => r.status === 'ok').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({ processed: results.length, ok, errors, results })
}
