import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const SITE_PASSWORD = process.env.SITE_PASSWORD
if (!SITE_PASSWORD) throw new Error('[acces] SITE_PASSWORD env var is required')
export const COOKIE_NAME = 'site_access'

/**
 * Crée un token HMAC-SHA256 du mot de passe.
 * On stocke ce hash dans le cookie (jamais le mot de passe en clair).
 */
export function createAccessToken(password: string): string {
  // SITE_PASSWORD est garanti défini (throw au démarrage si absent)
  const secret = process.env.CRON_SECRET ?? process.env.SITE_PASSWORD!
  return createHmac('sha256', secret).update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  const { password, redirect } = await req.json()

  const expected = SITE_PASSWORD!
  const provided = String(password ?? '')

  // Comparaison timing-safe pour éviter les timing attacks
  const isValid =
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected))

  if (!isValid) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, redirect: redirect ?? '/' })

  // Stocke un HMAC du mot de passe — jamais le mot de passe en clair
  response.cookies.set(COOKIE_NAME, createAccessToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })

  return response
}
