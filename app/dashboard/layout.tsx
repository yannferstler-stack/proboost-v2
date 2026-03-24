// Force toutes les pages /dashboard à être rendues dynamiquement (jamais pré-rendues statiquement).
// Nécessaire car elles utilisent l'authentification Supabase au runtime.
import { ErrorBoundary } from '../components/ErrorBoundary'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
