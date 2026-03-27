import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SITE_PASSWORD = process.env.SITE_PASSWORD
const COOKIE_NAME = 'site_access'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Site password gate (production only) ──
  const bypassGate =
    pathname === '/acces' ||
    pathname === '/paiement-requis' ||
    pathname === '/paiement-recu' ||
    pathname === '/paiement-annule' ||
    pathname.startsWith('/souscrire') ||
    pathname.startsWith('/api/acces') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')

  if (!bypassGate && SITE_PASSWORD && process.env.NODE_ENV !== 'development') {
    const cookie = request.cookies.get(COOKIE_NAME)
    if (cookie?.value !== SITE_PASSWORD) {
      const url = request.nextUrl.clone()
      url.pathname = '/acces'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // ── 2. Supabase auth guard (fail-safe) ──
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (!pathname.startsWith('/dashboard/pricing')) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, payment_status, payment_failed_at')
          .eq('id', user.id)
          .single()

        if (!profileError) {
          const planActif = profile?.plan && ['starter', 'premium', 'pro'].includes(profile.plan)
          if (!planActif) {
            return NextResponse.redirect(new URL('/dashboard/pricing', request.url))
          }

          if (profile?.payment_status === 'past_due' && profile?.payment_failed_at) {
            const failedAt = new Date(profile.payment_failed_at)
            const joursDepuisEchec = (Date.now() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
            if (joursDepuisEchec >= 3) {
              return NextResponse.redirect(new URL('/paiement-requis', request.url))
            }
          }
        }
      }
    }

    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch { /* fail-open — ne jamais bloquer l'utilisateur */ }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png|.*\\.svg|.*\\.ico).*)'],
}
