/**
 * Singleton Stripe — source unique d'initialisation dans tout le projet.
 * Importer `getStripe` et `getFeePercent` depuis ce fichier dans toutes les routes API.
 */
export function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}

/**
 * Taux de commission ManaFlow selon le plan de l'utilisateur.
 * Source unique — ne pas dupliquer dans les routes.
 *   pro      → 10 %
 *   premium  → 12 %
 *   starter  → 14 % (défaut)
 */
export function getFeePercent(plan?: string | null): number {
  if (plan === 'pro') return 10
  if (plan === 'premium') return 12
  return 14
}
