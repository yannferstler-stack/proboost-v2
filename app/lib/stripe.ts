/**
 * Singleton Stripe — source unique d'initialisation dans tout le projet.
 * Importer `getStripe` depuis ce fichier dans toutes les routes API.
 */
export function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
}
