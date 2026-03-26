import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getStripe } from '../../lib/stripe'

/**
 * POST /api/webhooks/stripe-connect
 *
 * Webhook dédié aux événements provenant des comptes connectés (Direct Charges).
 * À enregistrer dans le Stripe Dashboard :
 *   Developers → Webhooks → Add endpoint → "Listen to events on Connected accounts"
 *   URL : https://manaflow.fr/api/webhooks/stripe-connect
 *   Secret : STRIPE_CONNECT_WEBHOOK_SECRET
 *
 * Événements à écouter :
 *   - checkout.session.completed  (paiement d'une facture par le débiteur)
 */

const getResend = () => new Resend(process.env.RESEND_API_KEY)

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  // Le header stripe-account identifie quel compte connecté a émis l'événement
  const connectedAccountId = req.headers.get('stripe-account')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: any
  try {
    // Utilise le secret spécifique aux webhooks Connect
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // ── Paiement d'une facture confirmé sur un compte connecté ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.metadata?.type !== 'invoice_payment') {
      return NextResponse.json({ received: true })
    }

    const factureId = session.metadata.facture_id
    const userId    = session.metadata.user_id

    if (!factureId) {
      return NextResponse.json({ received: true })
    }

    const supabase = getSupabaseAdmin()

    // Marquer la facture comme payée et stopper les relances
    await supabase
      .from('factures')
      .update({
        statut: 'payée',
        sequence_active: false,
        next_relance_date: null,
      })
      .eq('id', factureId)

    // Enregistrer dans l'historique
    await supabase.from('relances').insert({
      facture_id: factureId,
      type: 'paiement',
      numero_relance: null,
      envoye_le: new Date().toISOString(),
      statut: 'payé',
    }).then(null, () => {})

    // Notifier l'abonné ManaFlow par email
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, company_name')
        .eq('id', userId)
        .single()

      const { data: facture } = await supabase
        .from('factures')
        .select('client_nom, montant, numero_facture')
        .eq('id', factureId)
        .single()

      if (profile?.email && facture) {
        const montantStr = Number(facture.montant).toLocaleString('fr-FR')
        // Calcul commission pour l'email (informatif)
        const { data: profileFull } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', userId)
          .single()
        const plan = profileFull?.plan || 'starter'
        const feePercent = plan === 'pro' ? 10 : plan === 'premium' ? 12 : 14
        const commission = Math.max(
          Math.round(Number(facture.montant) * feePercent) / 100,
          5
        )
        const netPercu = Number(facture.montant) - commission

        await getResend().emails.send({
          from: 'ManaFlow <noreply@manaflow.fr>',
          to: profile.email,
          subject: `✅ Paiement reçu — Facture ${facture.numero_facture || factureId}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
              <p style="font-weight:800;font-size:20px;margin:0 0 32px;">ManaFlow</p>
              <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;color:#16A34A;font-weight:700;font-size:15px;">✅ Paiement reçu avec succès</p>
              </div>
              <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">
                Le client <strong style="color:#111;">${facture.client_nom}</strong> vient de régler la facture
                <strong style="color:#111;">${facture.numero_facture || factureId}</strong>
                d'un montant de <strong style="color:#16A34A;">${montantStr} €</strong>.
              </p>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#6B7280;font-size:14px;">Montant facture</td>
                  <td style="padding:8px 0;text-align:right;font-weight:600;color:#111;">${montantStr} €</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6B7280;font-size:14px;">Commission ManaFlow (${feePercent}%)</td>
                  <td style="padding:8px 0;text-align:right;font-weight:600;color:#DC2626;">− ${commission.toLocaleString('fr-FR')} €</td>
                </tr>
                <tr style="border-top:1px solid #E5E7EB;">
                  <td style="padding:10px 0;color:#111;font-weight:700;font-size:15px;">Net viré sur votre compte</td>
                  <td style="padding:10px 0;text-align:right;font-weight:800;color:#16A34A;font-size:15px;">${netPercu.toLocaleString('fr-FR')} €</td>
                </tr>
              </table>
              <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
                La facture a été automatiquement marquée comme <strong style="color:#16A34A;">payée</strong>
                dans votre dashboard. Le virement arrivera sous 2–5 jours ouvrés.
              </p>
              <p style="color:#6B7280;line-height:1.7;">Cordialement,<br/>L'équipe ManaFlow</p>
            </div>
          `,
        }).then(null, () => {})
      }
    }
  }

  return NextResponse.json({ received: true })
}
