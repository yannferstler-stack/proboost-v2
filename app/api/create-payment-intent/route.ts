import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "../../lib/stripe";
import { getAuthUserId } from "../../lib/auth";

export async function POST(req: NextRequest) {
  // Auth requise — ne pas permettre la création de PaymentIntent sans identité vérifiée
  const userId = await getAuthUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { amount, connectedAccountId, plan } = await req.json();

    const feePercent = plan === "pro" ? 10 : plan === "premium" ? 12 : 14;

    const feeAmount = Math.max(
      Math.round((amount * feePercent) / 100),
      500
    );

    // Direct Charges : le PaymentIntent est créé SUR le compte connecté
    // (stripeAccount option). Les fonds vont directement au compte connecté ;
    // ManaFlow perçoit uniquement l'application_fee_amount sans jamais détenir les fonds.
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "eur",
        application_fee_amount: feeAmount,
      },
      connectedAccountId ? { stripeAccount: connectedAccountId } : undefined
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      feeAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
