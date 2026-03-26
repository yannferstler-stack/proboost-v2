import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'node:crypto'

const SITE_PASSWORD = process.env.SITE_PASSWORD
if (!SITE_PASSWORD) throw new Error('[proxy] SITE_PASSWORD env var is required')
const COOKIE_NAME = 'site_access'

/** Doit correspondre exactement à createAccessToken dans api/acces/route.ts */
function createAccessToken(password: string): string {
  // Utilise CRON_SECRET si dispo (préféré), sinon SITE_PASSWORD (garanti défini ci-dessus)
  const secret = process.env.CRON_SECRET ?? SITE_PASSWORD!
  return createHmac('sha256', secret).update(password).digest('hex')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Protection mot de passe site entier ──
  // Ces routes ne nécessitent pas de mot de passe
  if (pathname === '/acces' || pathname === '/paiement-requis' ||
      pathname === '/paiement-recu' || pathname === '/paiement-annule' ||
      pathname.startsWith('/souscrire') ||  // pages de souscription (post-paiement Stripe)
      pathname.startsWith('/api/acces') || pathname.startsWith('/api/webhooks') ||
      pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Pas de mot de passe en développement local
  if (process.env.NODE_ENV !== 'development') {
    const cookie = request.cookies.get(COOKIE_NAME)
    const expectedToken = createAccessToken(SITE_PASSWORD!)
    if (cookie?.value !== expectedToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/acces'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // ── 2. Auth Supabase (dashboard uniquement) ──
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!pathname.startsWith('/dashboard/pricing')) {
    // Requête unique : plan + statut paiement (colonnes créées via migration 001_schema.sql)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, payment_status, payment_failed_at')
      .eq('id', user.id)
      .single()

    // Si erreur DB (ex: profil manquant), ne pas bloquer
    if (!profileError) {
      // Vérification plan actif
      const planActif = profile?.plan && ['starter', 'premium', 'pro'].includes(profile.plan)
      if (!planActif) {
        return NextResponse.redirect(new URL('/dashboard/pricing', request.url))
      }

      // ── Blocage si paiement en retard depuis plus de 3 jours ──
      if (profile?.payment_status === 'past_due' && profile?.payment_failed_at) {
        const failedAt = new Date(profile.payment_failed_at)
        const joursDepuisEchec = (Date.now() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (joursDepuisEchec >= 3) {
          return NextResponse.redirect(new URL('/paiement-requis', request.url))
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png|.*\\.svg|.*\\.ico).*)'],
}
