import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comment ça marche ? — Manaflow',
  description: 'Découvrez comment Manaflow automatise vos relances de factures impayées en 3 étapes simples : importez, Manaflow relance, vous encaissez.',
  openGraph: {
    title: 'Comment ça marche ? — Manaflow',
    description: 'Automatisez vos relances d\'impayés en 3 étapes. Aucun risque, commission uniquement au succès.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
