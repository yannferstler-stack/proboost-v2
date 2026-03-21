import { NextRequest, NextResponse } from 'next/server'

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 })

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const subscription = session.subscription as any
    const currentPeriodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

    return NextResponse.json({
      customer_id: session.customer ?? null,
      subscription_id: subscription?.id ?? null,
      current_period_end: currentPeriodEnd,
    })
  } catch (err: any) {
    console.error('session-data error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
