import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

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

  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // ── Paiement Stripe confirmé ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const sessionId = session.id

    // ── Cas 1 : paiement d'une facture client ──
    if (session.metadata?.type === 'invoice_payment') {
      const factureId = session.metadata.facture_id
      const userId    = session.metadata.user_id

      if (factureId) {
        await supabase
          .from('factures')
          .update({
            statut: 'payée',
            sequence_active: false,
            next_relance_date: null,
          })
          .eq('id', factureId)

        // Enregistrer dans l'historique des relances
        await supabase.from('relances').insert({
          facture_id: factureId,
          type: 'paiement',
          numero_relance: null,
          envoye_le: new Date().toISOString(),
          statut: 'payé',
        }).then(null, () => {})

        // Notifier l'utilisateur ManaFlow par email (optionnel)
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
            await resend.emails.send({
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
                  <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
                    La facture a été automatiquement marquée comme <strong style="color:#16A34A;">payée</strong>
                    dans votre dashboard.
                  </p>
                  <p style="color:#6B7280;line-height:1.7;">
                    Cordialement,<br/>L'équipe ManaFlow
                  </p>
                </div>
              `,
            }).then(null, () => {}) // Ne pas bloquer sur l'email de notification
          }
        }
      }

      return NextResponse.json({ received: true })
    }

    // ── Cas 2 : souscription d'un abonnement ManaFlow ──
    const subscriptionId = session.subscription
    const customerId = session.customer

    let currentPeriodEnd: string | null = null
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()
    }

    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_end: currentPeriodEnd,
        payment_status: 'active',
        payment_failed_at: null,
      })
      .eq('stripe_session_id', sessionId)
  }

  // ── Renouvellement réussi ──
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    const customerId = invoice.customer
    const subscriptionId = invoice.subscription

    let currentPeriodEnd: string | null = null
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('pending_plan, pending_plan_effective_date')
      .eq('stripe_customer_id', customerId)
      .single()

    const updates: Record<string, any> = {
      payment_status: 'active',
      payment_failed_at: null,
    }
    if (currentPeriodEnd) updates.current_period_end = currentPeriodEnd

    // Appliquer le downgrade planifié si la date est passée
    if (profile?.pending_plan && profile?.pending_plan_effective_date) {
      const effectiveDate = new Date(profile.pending_plan_effective_date)
      if (new Date() >= effectiveDate) {
        updates.plan = profile.pending_plan
        updates.pending_plan = null
        updates.pending_plan_effective_date = null
      }
    }

    await supabase.from('profiles').update(updates).eq('stripe_customer_id', customerId)
  }

  // ── Échec de paiement ──
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const customerId = invoice.customer

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, payment_failed_at')
      .eq('stripe_customer_id', customerId)
      .single()

    const updates: Record<string, any> = { payment_status: 'past_due' }
    const now = new Date()

    // Stocker la date d'échec seulement si c'est le premier (évite d'écraser pour le délai J+3)
    if (!profile?.payment_failed_at) {
      updates.payment_failed_at = now.toISOString()

      // Envoyer l'email de rappel
      if (profile?.email) {
        const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        const deadlineStr = deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://manaflow.fr'

        await resend.emails.send({
          from: 'ManaFlow <noreply@manaflow.fr>',
          to: profile.email,
          subject: '⚠️ Action requise : régularisez votre abonnement ManaFlow',
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
              <p style="font-weight:800;font-size:20px;margin:0 0 32px;">ManaFlow</p>
              <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;color:#DC2626;font-weight:700;font-size:15px;">⚠️ Échec de paiement de votre abonnement</p>
              </div>
              <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">Bonjour,</p>
              <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">
                Nous n'avons pas pu encaisser le paiement de votre abonnement ManaFlow.<br/>
                Votre accès restera actif jusqu'au <strong style="color:#DC2626;">${deadlineStr}</strong>,
                après quoi votre compte sera temporairement suspendu.
              </p>
              <p style="color:#6B7280;line-height:1.7;margin-bottom:28px;">
                Merci de mettre à jour votre moyen de paiement pour éviter toute interruption.
              </p>
              <a href="${appUrl}/paiement-requis"
                style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;text-decoration:none;border-radius:10px;padding:13px 28px;font-weight:700;font-size:14px;">
                Régulariser mon abonnement →
              </a>
              <p style="margin-top:40px;font-size:12px;color:#9CA3AF;">
                Des questions ? Écrivez-nous à <a href="mailto:contact@manaflow.fr" style="color:#a855f7;">contact@manaflow.fr</a>
              </p>
            </div>
          `,
        })
      }
    }

    await supabase.from('profiles').update(updates).eq('stripe_customer_id', customerId)
  }

  // ── Compte Connect activé (onboarding terminé) ──
  // Stripe envoie cet événement quand un compte Express peut recevoir des paiements
  if (event.type === 'account.updated') {
    const account = event.data.object
    if (account.charges_enabled && account.id) {
      // Mettre à jour le statut Connect dans le profil correspondant
      await supabase
        .from('profiles')
        .update({ stripe_connect_account_id: account.id })
        .eq('stripe_connect_account_id', account.id)
        // (déjà stocké lors de la création, mais ça confirme que l'onboarding est complet)
    }
  }

  // ── Abonnement annulé ──
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customerId = subscription.customer

    await supabase
      .from('profiles')
      .update({
        plan: null,
        payment_status: 'canceled',
        stripe_subscription_id: null,
        pending_plan: null,
        pending_plan_effective_date: null,
      })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
