import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUserId } from '../../lib/auth'
import { getStripe } from '../../lib/stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // ── Auth : vérifier le JWT et récupérer l'ID depuis le token (jamais depuis le body) ──
  const authenticatedId = await getAuthUserId(req)
  if (!authenticatedId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { email, company } = await req.json()
    const stripe = getStripe()
    const supabase = getSupabaseAdmin()

    // Si l'utilisateur a déjà un compte Connect, on génère juste un nouveau lien d'onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', authenticatedId)
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

    // Créer un nouveau compte Express
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      business_profile: { name: company },
      capabilities: { transfers: { requested: true } },
    })

    // Sauvegarder l'ID du compte Connect en base
    await supabase
      .from('profiles')
      .update({ stripe_connect_account_id: account.id })
      .eq('id', authenticatedId)

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/souscrire/success?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connect=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur Stripe Connect' }, { status: 500 })
  }
}
