import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Routes publiques → jamais bloquées
  const publicRoutes = ['/login', '/signup', '/pricing', '/', '/api']
  if (publicRoutes.some(r => pathname === r || pathname.startsWith('/api'))) {
    return response
  }

  // Créer client Supabase côté serveur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
      },
    }
  )

  // Vérifier session
  const { data: { user } } = await supabase.auth.getUser()

  // Pas connecté → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Connecté mais pas de plan → dashboard/pricing
  // (sauf si déjà sur dashboard/pricing pour éviter boucle infinie)
  if (!pathname.startsWith('/dashboard/pricing')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const planActif = profile?.plan && ['starter', 'premium', 'pro'].includes(profile.plan)

    if (!planActif && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard/pricing', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}