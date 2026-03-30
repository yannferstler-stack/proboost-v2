import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Manaflow',
  description: 'Conseils, actualités et ressources pour les TPE et PME : gestion des impayés, trésorerie, facturation électronique.',
  openGraph: {
    title: 'Blog Manaflow — Conseils pour les TPE',
    description: 'Conseils pratiques sur la gestion des impayés, la trésorerie et la facturation pour les indépendants et TPE.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
