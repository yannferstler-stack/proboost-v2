import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const PLAN_ORDER: Record<string, number> = { starter: 1, premium: 2, pro: 3 }

function getPriceId(plan: string): string | null {
  const ids: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    premium: process.env.STRIPE_PRICE_PREMIUM,
    pro: process.env.STRIPE_PRICE_PRO,
  }
  return ids[plan] ?? null
}

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { newPlan } = await req.json()
  if (!PLAN_ORDER[newPlan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, stripe_subscription_id, current_period_end')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: 'Abonnement Stripe introuvable. Contactez le support.' }, { status: 400 })
  }

  const currentPlan = profile.plan || 'starter'
  if (currentPlan === newPlan) {
    return NextResponse.json({ error: 'Vous êtes déjà sur ce plan.' }, { status: 400 })
  }

  const isUpgrade = PLAN_ORDER[newPlan] > PLAN_ORDER[currentPlan]

  if (isUpgrade) {
    // Upgrade : application immédiate avec prorata
    const newPriceId = getPriceId(newPlan)
    if (!newPriceId) {
      return NextResponse.json({
        error: 'Système de paiement en configuration. Contactez contact@proboost.fr',
      }, { status: 503 })
    }

    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
    const itemId = subscription.items.data[0].id

    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
    })

    await supabaseAdmin
      .from('profiles')
      .update({ plan: newPlan, pending_plan: null, pending_plan_effective_date: null })
      .eq('id', user.id)

    return NextResponse.json({ immediate: true, newPlan })
  } else {
    // Downgrade : planifié pour la fin de la période en cours
    const effectiveDate = profile.current_period_end
      ? new Date(profile.current_period_end)
      : new Date()

    await supabaseAdmin
      .from('profiles')
      .update({
        pending_plan: newPlan,
        pending_plan_effective_date: effectiveDate.toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({
      immediate: false,
      newPlan,
      effective_date: effectiveDate.toISOString(),
    })
  }
}
