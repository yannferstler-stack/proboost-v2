import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@manaflow.fr'

// ── Cooldown en mémoire : 1 alerte max toutes les 24h ──
// (se réinitialise aux cold starts serverless — acceptable pour ce cas d'usage)
let alertLastSentAt = 0
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000

export async function sendCreditAlertEmail(): Promise<void> {
  const now = Date.now()
  if (now - alertLastSentAt < ALERT_COOLDOWN_MS) return
  alertLastSentAt = now

  const dateStr = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  try {
    await getResend().emails.send({
      from: 'ManaFlow <noreply@manaflow.fr>',
      to: ADMIN_EMAIL,
      subject: '⚠️ Crédits Anthropic épuisés — Action requise',
      html: `
<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F9FAFB; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: rgba(239,68,68,0.1); border: 2px solid rgba(239,68,68,0.3); border-radius: 50%; font-size: 28px;">⚠️</div>
  </div>
  <h2 style="color: #111827; margin: 0 0 12px; text-align: center; font-size: 22px;">Crédits Anthropic épuisés</h2>
  <p style="color: #6B7280; line-height: 1.7; margin-bottom: 20px; text-align: center;">
    Le service d'analyse IA de <strong style="color: #111;">ManaFlow</strong> est actuellement indisponible.<br>
    Vos clients ne peuvent plus importer leurs factures par reconnaissance automatique.
  </p>
  <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px;">
    <p style="color: #991B1B; font-size: 14px; font-weight: 700; margin: 0 0 6px;">🔴 Service IA hors ligne</p>
    <p style="color: #DC2626; font-size: 13px; margin: 0; line-height: 1.6;">
      Détecté le ${dateStr} à ${timeStr}<br>
      Cause : solde de crédits insuffisant sur console.anthropic.com
    </p>
  </div>
  <a href="https://console.anthropic.com/settings/billing" style="display: block; text-align: center; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(168,85,247,0.35);">
    Recharger mes crédits →
  </a>
  <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
    <p style="color: #92400E; font-size: 13px; font-weight: 600; margin: 0 0 6px;">💡 Conseil pour éviter les interruptions</p>
    <p style="color: #78350F; font-size: 13px; margin: 0; line-height: 1.6;">
      Activez le <strong>rechargement automatique</strong> sur console.anthropic.com.<br>
      Paramétrez un seuil de déclenchement (ex&nbsp;: 5&nbsp;€) pour ne jamais être à court de crédits.
    </p>
  </div>
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
  <p style="color: #D1D5DB; font-size: 12px; text-align: center; margin: 0;">
    ManaFlow — Alerte automatique du système · <a href="https://manaflow.fr" style="color: #a855f7; text-decoration: none;">manaflow.fr</a>
  </p>
</div>
      `,
    })
    console.log('[ALERT CREDITS] Email envoyé à', ADMIN_EMAIL)
  } catch (err) {
    console.error('[ALERT CREDITS] Erreur envoi email:', err)
  }
}

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
