import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

/**
 * POST /api/paiement-facture
 * Crée (ou réutilise) un lien de paiement Stripe Checkout pour une facture client.
 * Retourne { url } — à inclure dans l'email de relance.
 *
 * Body :
 *   factureId       string   — ID de la facture dans Supabase
 *   montant         number   — montant en euros (ex: 1500)
 *   clientNom       string   — nom du client (libellé sur la page Stripe)
 *   numeroFacture   string   — référence facture (libellé)
 *   userId          string   — ID de l'utilisateur ManaFlow (pour récupérer son compte Connect + plan)
 */
/**
 * Vérifie que l'appel vient d'un contexte autorisé :
 * - Appel serveur-à-serveur interne (CRON_SECRET)
 * - Ou utilisateur authentifié via JWT Supabase
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)

  // Appels internes (cron, relancer) → secret partagé
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) return true

  // Appels depuis le dashboard → JWT Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return !!user
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { factureId, montant, clientNom, numeroFacture, userId } =
      await request.json()

    if (!factureId || !montant || !userId) {
      return NextResponse.json(
        { error: 'factureId, montant et userId sont requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // ── 1. Vérifier si un lien de paiement actif existe déjà ──
    const { data: facture } = await supabase
      .from('factures')
      .select('payment_session_id, payment_url, statut')
      .eq('id', factureId)
      .single()

    // Si la facture est déjà payée, on retourne quand même l'URL existante
    if (facture?.payment_url) {
      // Vérifier que la session Stripe est encore valide (non expirée)
      if (facture.payment_session_id) {
        try {
          const stripe = getStripe()
          const existing = await stripe.checkout.sessions.retrieve(
            facture.payment_session_id
          )
          // Session ouverte = réutilisable
          if (existing.status === 'open') {
            return NextResponse.json({ url: facture.payment_url })
          }
          // Si expirée ou complétée, on en crée une nouvelle
        } catch {
          // En cas d'erreur Stripe, on recrée
        }
      } else {
        return NextResponse.json({ url: facture.payment_url })
      }
    }

    // ── 2. Récupérer les infos du profil ManaFlow (Connect + plan) ──
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, plan')
      .eq('id', userId)
      .single()

    const stripe = getStripe()
    const montantCentimes = Math.round(Number(montant) * 100)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://manaflow.fr'

    // ── 3. Construire les paramètres de la session ──
    const sessionParams: any = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: montantCentimes,
            product_data: {
              name: `Règlement facture ${numeroFacture || factureId}`,
              description: clientNom ? `Client : ${clientNom}` : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'invoice_payment',
        facture_id: factureId,
        user_id: userId,
      },
      success_url: `${appUrl}/paiement-recu?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paiement-annule`,
      // Expiration dans 24h (Stripe max = 24h pour les sessions Checkout)
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
    }

    // ── 4. Direct Charges sur le compte connecté du client ──
    // Les fonds vont directement sur le compte Stripe du client ManaFlow.
    // ManaFlow ne détient jamais les fonds (pas de risque EP/ACPR).
    // Stripe collecte et alloue : commission → ManaFlow, reste → client.
    if (profile?.stripe_connect_account_id) {
      const plan = profile.plan || 'starter'
      const feePercent = plan === 'pro' ? 10 : plan === 'premium' ? 12 : 14
      const feeAmount = Math.max(
        Math.round((montantCentimes * feePercent) / 100),
        500 // minimum 5€
      )
      // application_fee_amount : commission prélevée par ManaFlow
      // stripeAccount option   : la session est créée SUR le compte connecté
      sessionParams.payment_intent_data = {
        application_fee_amount: feeAmount,
      }
    }

    const connectAccountId = profile?.stripe_connect_account_id
    const session = await stripe.checkout.sessions.create(
      sessionParams,
      connectAccountId ? { stripeAccount: connectAccountId } : undefined
    )

    // ── 5. Sauvegarder l'URL dans Supabase ──
    await supabase
      .from('factures')
      .update({
        payment_session_id: session.id,
        payment_url: session.url,
      })
      .eq('id', factureId)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[PAIEMENT-FACTURE] Erreur:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
