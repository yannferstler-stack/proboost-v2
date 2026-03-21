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

export async function POST(req: NextRequest) {
  try {
    const { email, company, userId } = await req.json()
    const stripe = getStripe()

    // Si l'utilisateur a déjà un compte Connect, on génère juste un nouveau lien d'onboarding
    if (userId) {
      const supabase = getSupabaseAdmin()
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_connect_account_id')
        .eq('id', userId)
        .single()

      if (profile?.stripe_connect_account_id) {
        // Vérifier si le compte est déjà actif (charges_enabled)
        const existingAccount = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
        if (existingAccount.charges_enabled) {
          return NextResponse.json({ already_connected: true })
        }
        // Sinon, regénérer un lien d'onboarding pour le compte existant
        const accountLink = await stripe.accountLinks.create({
          account: profile.stripe_connect_account_id,
          refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/souscrire/success?stripe=refresh`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connect=success`,
          type: 'account_onboarding',
        })
        return NextResponse.json({ url: accountLink.url })
      }
    }

    // Créer un nouveau compte Express
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      business_profile: { name: company },
      capabilities: { transfers: { requested: true } },
    })

    // ✅ Sauvegarder l'ID du compte Connect immédiatement en base
    if (userId) {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('profiles')
        .update({ stripe_connect_account_id: account.id })
        .eq('id', userId)
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/souscrire/success?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connect=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}