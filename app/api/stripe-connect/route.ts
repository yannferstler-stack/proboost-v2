import { NextRequest, NextResponse } from 'next/server'

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

export async function POST(req: NextRequest) {
  try {
    const { email, company } = await req.json()
    const stripe = getStripe()

    const account = await stripe.accounts.create({
      type: 'express',
      email,
      business_profile: { name: company },
      capabilities: { transfers: { requested: true } },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/souscrire/success?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}