import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — ManaFlow',
  description: 'Contactez l\'équipe ManaFlow pour toute question sur notre service de relance automatique d\'impayés. Réponse sous 24–48h.',
  openGraph: {
    title: 'Contact — ManaFlow',
    description: 'Une question ? Notre équipe répond sous 24–48h ouvrées.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
