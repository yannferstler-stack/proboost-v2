import { NextRequest, NextResponse } from 'next/server'

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

// Montants en centimes HT — prix plein (le coupon early bird gère le -20% sur le 1er mois)
const PLAN_CONFIG: Record<string, { amount: number, name: string, commission: string }> = {
  starter:  { amount: 1999,  name: 'ManaFlow Starter',  commission: '14%' },
  premium:  { amount: 4999,  name: 'ManaFlow Premium',  commission: '12%' },
  pro:      { amount: 14999, name: 'ManaFlow Pro',       commission: '10%' },
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    if (!PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const stripe = getStripe()
    const config = PLAN_CONFIG[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
      subscription_data: { metadata: { plan } },
      // Coupon early bird : -20% sur le 1er mois uniquement (duration: once)
      // Créer dans Stripe Dashboard > Coupons : percent_off=20, duration=once, name="Offre de lancement"
      // Puis ajouter STRIPE_COUPON_EARLY_BIRD=coupon_id dans .env.local
      ...(process.env.STRIPE_COUPON_EARLY_BIRD
        ? { discounts: [{ coupon: process.env.STRIPE_COUPON_EARLY_BIRD }] }
        : {}),
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}