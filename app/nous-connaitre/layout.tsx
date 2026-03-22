import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nous connaître — ManaFlow',
  description: 'Découvrez l\'histoire et la mission de ManaFlow : aider les TPE françaises à récupérer leurs impayés et préserver leur trésorerie.',
  openGraph: {
    title: 'Nous connaître — ManaFlow',
    description: 'Deux parcours, une conviction commune : les TPE méritent des outils aussi puissants que ceux des grandes entreprises.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
