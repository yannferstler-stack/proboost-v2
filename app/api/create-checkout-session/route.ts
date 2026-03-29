import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '../../lib/stripe'

// Rate limiting in-memory par IP : 5 sessions max / 10 min
const RL_MAX = 5
const RL_WINDOW_MS = 10 * 60 * 1000
const rlMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rlMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS })
    return true
  }
  if (entry.count >= RL_MAX) return false
  entry.count++
  return true
}

// Montants en centimes HT — prix plein
const PLAN_CONFIG: Record<string, { amount: number, name: string, commission: string }> = {
  starter:  { amount: 1999,  name: 'ManaFlow Starter',  commission: '14%' },
  premium:  { amount: 4999,  name: 'ManaFlow Premium',  commission: '12%' },
  pro:      { amount: 14999, name: 'ManaFlow Pro',       commission: '10%' },
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 })
  }

  try {
    const { plan, cgv_accepted } = await req.json()

    if (!cgv_accepted) {
      return NextResponse.json({ error: 'Vous devez accepter les CGV pour continuer.' }, { status: 400 })
    }

    if (!PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const stripe = getStripe()
    const config = PLAN_CONFIG[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'if_required',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: config.name,
              description: `Recouvrement automatisé — commission de succès ${config.commission} sur les fonds recouvrés`,
            },
            unit_amount: config.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/souscrire/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/souscrire?plan=${plan}`,
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
        trial_period_days: 14,
      },
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}