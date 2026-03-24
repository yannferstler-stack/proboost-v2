import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { sendCreditAlertEmail } from '../../../lib/credit-alert'

export async function GET(request: NextRequest) {
  // ── Auth : Vercel Cron uniquement ──
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
    console.log('[CRON CHECK CREDITS] Crédits Anthropic OK')
    return NextResponse.json({ status: 'ok', credits: 'available' })
  } catch (error: any) {
    const raw = (error?.message || '').toLowerCase()
    const isCreditError = raw.includes('credit') || raw.includes('balance')

    if (isCreditError) {
      await sendCreditAlertEmail()
      return NextResponse.json({ status: 'alert_sent', message: 'Crédits insuffisants — email admin envoyé' })
    }

    // Autre erreur (clé invalide, modèle indispo…) — log sans alerter
    console.error('[CRON CHECK CREDITS] Erreur inattendue:', error?.message)
    return NextResponse.json({ status: 'error', error: error?.message || 'Erreur inconnue' }, { status: 500 })
  }
}
