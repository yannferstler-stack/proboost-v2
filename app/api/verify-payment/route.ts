import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '../../lib/stripe'

/**
 * GET /api/verify-payment?session_id=cs_xxx
 * Vérifie auprès de Stripe si une session de paiement a bien abouti.
 * Retourne uniquement { paid: boolean } — aucune donnée sensible exposée.
 * Route publique : les clients (non-connectés) y accèdent depuis /paiement-recu.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  // Format de base attendu par Stripe (cs_live_xxx ou cs_test_xxx)
  if (!sessionId || !/^cs_(live|test)_/.test(sessionId)) {
    return NextResponse.json({ paid: false })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [],
    })
    return NextResponse.json({ paid: session.payment_status === 'paid' })
  } catch {
    // Session invalide ou Stripe injoignable
    return NextResponse.json({ paid: false })
  }
}
