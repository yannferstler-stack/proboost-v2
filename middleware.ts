import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware Next.js (Edge Runtime) — Protection des routes /dashboard
 *
 * 1. Rafraîchit le cookie de session Supabase (@supabase/ssr requis)
 * 2. Redirige vers /login si l'utilisateur n'est pas authentifié
 * 3. Redirige vers /paiement-requis si le compte est suspendu
 *    (past_due + délai de grâce de 3 jours expiré)
 *
 * Fail-safe : en cas d'erreur Supabase, la requête passe (fail-open).
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Valide le token côté serveur (plus sûr que getSession qui lit seulement le cookie)
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // ── Protection /dashboard ──
    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Vérification du statut de paiement
      const { data: profile } = await supabase
        .from('profiles')
        .select('payment_status, payment_failed_at')
        .eq('id', user.id)
        .single()

      if (profile?.payment_status === 'past_due' && profile.payment_failed_at) {
        const gracePeriodEnd = new Date(
          new Date(profile.payment_failed_at).getTime() + 3 * 24 * 60 * 60 * 1000
        )
        if (Date.now() > gracePeriodEnd.getTime()) {
          return NextResponse.redirect(new URL('/paiement-requis', request.url))
        }
      }
    }

    // Rediriger les utilisateurs déjà connectés hors de /login
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    // Fail-open : en cas d'erreur Supabase, on laisse passer la requête
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Pages HTML uniquement — exclure assets statiques, API routes, etc.
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
