import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Guard build-time : env vars absentes pendant le pré-rendu statique.
  // Les pages dashboard sont force-dynamic, donc null n'est jamais retourné au runtime.
  if (!url || !key) return null as any
  return createBrowserClient(url, key)
}