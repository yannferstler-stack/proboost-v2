/**
 * Crée (ou réutilise) un lien de paiement Stripe Checkout pour une facture.
 * Appelle la route interne /api/paiement-facture avec le secret interne.
 *
 * Source unique partagée entre /api/relancer et /api/cron/relancer.
 */
export async function getOrCreatePaymentUrl(
  factureId: string,
  montant: number,
  clientNom: string,
  numeroFacture: string,
  userId: string,
): Promise<string | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://manaflow.fr'
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : appUrl

    const response = await fetch(`${baseUrl}/api/paiement-facture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ factureId, montant, clientNom, numeroFacture, userId }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.url ?? null
  } catch {
    return null
  }
}
