import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'
import { Resend } from 'resend'

/**
 * GET /api/cron/warn-payment
 * Envoie un email d'avertissement aux utilisateurs dont le paiement est en échec
 * depuis 48–72h (soit J-1 avant la suspension d'accès à J+3 du premier échec).
 *
 * Planifié toutes les 12h dans vercel.json pour ne rater aucune fenêtre.
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

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const getResend = () => new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()

  // Fenêtre 48–73h après le premier échec de paiement (grace period = 3 jours)
  // Ce cron s'exécute toutes les 12h pour couvrir la fenêtre sans doublons
  const windowStart = new Date(now.getTime() - 73 * 60 * 60 * 1000).toISOString()
  const windowEnd   = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('payment_status', 'past_due')
    .gte('payment_failed_at', windowStart)
    .lte('payment_failed_at', windowEnd)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!profiles?.length) {
    return NextResponse.json({ status: 'ok', warned: 0 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://manaflow.fr'
  const resend = getResend()
  let sent = 0

  for (const profile of profiles) {
    if (!profile.email) continue
    try {
      const prenom = (profile.full_name || 'Utilisateur').split(' ')[0]
      await resend.emails.send({
        from: 'ManaFlow <noreply@manaflow.fr>',
        to: profile.email,
        subject: '⚠️ Votre accès ManaFlow sera suspendu demain — action requise',
        html: buildWarningHtml(prenom, appUrl),
      })
      sent++
    } catch {
      // Erreur d'envoi individuelle — on continue pour les autres
    }
  }

  return NextResponse.json({ status: 'ok', warned: sent, total: profiles.length })
}

function buildWarningHtml(prenom: string, appUrl: string): string {
  return `
<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
  <p style="font-weight:800;font-size:20px;margin:0 0 32px;">ManaFlow</p>

  <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
    <p style="margin:0;color:#DC2626;font-weight:700;font-size:14px;">⚠️ Accès suspendu dans moins de 24 heures</p>
  </div>

  <h2 style="font-size:20px;margin:0 0 16px;color:#111;">Bonjour ${prenom},</h2>

  <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">
    Votre abonnement ManaFlow a rencontré un problème de paiement il y a 2 jours.
    Sans régularisation, votre accès au dashboard et à l'envoi automatique de relances
    sera <strong style="color:#DC2626;">suspendu dans moins de 24 heures</strong>.
  </p>

  <p style="color:#6B7280;line-height:1.7;margin-bottom:28px;">
    Pour éviter toute interruption de service, mettez à jour votre moyen de paiement dès maintenant.
  </p>

  <div style="text-align:center;margin:28px 0;">
    <a href="${appUrl}/dashboard/settings#facturation"
       style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;text-decoration:none;border-radius:10px;padding:14px 32px;font-weight:700;font-size:16px;letter-spacing:0.01em;">
      Mettre à jour mon moyen de paiement →
    </a>
  </div>

  <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
    <p style="color:#92400E;font-size:13px;font-weight:600;margin:0 0 6px;">💡 En cas de difficulté</p>
    <p style="color:#78350F;font-size:13px;margin:0;line-height:1.6;">
      Si vous rencontrez un problème, contactez-nous à
      <a href="mailto:contact@manaflow.fr" style="color:#a855f7;">contact@manaflow.fr</a>
      et nous trouverons une solution ensemble.
    </p>
  </div>

  <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;">
  <p style="color:#D1D5DB;font-size:12px;text-align:center;margin:0;">
    ManaFlow — <a href="${appUrl}" style="color:#a855f7;text-decoration:none;">manaflow.fr</a>
  </p>
</div>
  `
}
