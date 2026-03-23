import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * Vérifie le JWT Supabase passé en Authorization: Bearer <token>.
 * Retourne l'user.id si valide, null sinon.
 */
export async function getAuthUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user.id
}
