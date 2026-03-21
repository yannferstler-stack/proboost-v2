import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = process.env.SITE_PASSWORD ?? 'manaflow2024'
const COOKIE_NAME = 'site_access'

export async function POST(req: NextRequest) {
  const { password, redirect } = await req.json()

  if (password !== SITE_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, redirect: redirect ?? '/' })

  response.cookies.set(COOKIE_NAME, SITE_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })

  return response
}