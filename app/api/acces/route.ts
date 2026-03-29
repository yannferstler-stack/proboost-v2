import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'site_access'
const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez dans 10 minutes.' }, { status: 429 })
    }
    entry.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }
  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }

  const { password, redirect } = await req.json()

  if (String(password ?? '').trim() !== sitePassword.trim()) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, redirect: redirect ?? '/' })

  response.cookies.set(COOKIE_NAME, sitePassword.trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
