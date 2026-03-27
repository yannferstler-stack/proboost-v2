import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'site_access'

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }

  const { password, redirect } = await req.json()

  if (String(password ?? '') !== sitePassword) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, redirect: redirect ?? '/' })

  response.cookies.set(COOKIE_NAME, sitePassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
