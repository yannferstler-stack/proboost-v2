import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '../../lib/stripe'
import { getAuthUserId } from '../../lib/auth'

export async function GET(req: NextRequest) {
  // Auth requise — seul l'utilisateur connecté peut lire ses données de session
  const userId = await getAuthUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
