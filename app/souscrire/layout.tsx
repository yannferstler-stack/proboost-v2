import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Souscrire — Manaflow',
  description: 'Choisissez votre plan Manaflow et démarrez 14 jours gratuits. Starter 19,99€, Premium 49,99€, Pro 149,99€/mois. Commission uniquement au succès.',
  openGraph: {
    title: 'Souscrire à Manaflow — 14 jours gratuits',
    description: '3 plans adaptés à votre volume de factures. Aucun engagement, résiliable à tout moment.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
