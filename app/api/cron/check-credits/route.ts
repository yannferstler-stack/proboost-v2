import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { sendCreditAlertEmail } from '../../../lib/credit-alert'

/**
 * Vérifie le CRON_SECRET avec une comparaison timing-safe pour éviter les timing attacks.
 */
function verifyCronSecret(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || !authHeader) return false
  const expected = `Bearer ${cronSecret}`
  if (authHeader.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  // ── Auth : Vercel Cron uniquement (timing-safe) ──
  const authHeader = request.headers.get('Authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    // Test minimal : 1 token, modèle haiku — coût < 0,000001 € par jour
    await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: '1' }],
    })
    return NextResponse.json({ status: 'ok', credits: 'available' })
  } catch (error: any) {
    const raw = (error?.message || '').toLowerCase()
    const isCreditError = raw.includes('credit') || raw.includes('balance')

    if (isCreditError) {
      await sendCreditAlertEmail()
      return NextResponse.json({ status: 'alert_sent', message: 'Crédits insuffisants — email admin envoyé' })
    }

    // Autre erreur (clé invalide, modèle indispo…) — réponse générique sans détails sensibles
    return NextResponse.json({ status: 'error', error: 'Erreur inattendue' }, { status: 500 })
  }
}
