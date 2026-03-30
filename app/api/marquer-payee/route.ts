import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getAuthUserId } from '../../lib/auth'
import { getFeePercent } from '../../lib/stripe'

const getResend = () => new Resend(process.env.RESEND_API_KEY)
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ── Auth : vérifier le JWT et récupérer l'ID depuis le token ──
  const authenticatedId = await getAuthUserId(request)
  if (!authenticatedId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { factureId } = await request.json()
    if (!factureId) {
      return NextResponse.json({ error: 'factureId manquant' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Vérifier que la facture appartient bien à l'utilisateur authentifié
    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .select('id, client_nom, montant, numero_facture, statut, user_id')
      .eq('id', factureId)
      .eq('user_id', authenticatedId)
      .single()

    if (factureError || !facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }
    if (facture.statut === 'payée') {
      return NextResponse.json({ message: 'Déjà marquée comme payée' })
    }

    // 2. Marquer la facture comme payée et stopper la séquence
    const { error: updateError } = await supabase
      .from('factures')
      .update({
        statut: 'payée',
        sequence_active: false,
        next_relance_date: null,
      })
      .eq('id', factureId)

    if (updateError) throw updateError

    // 3. Logger dans la table relances
    await supabase.from('relances').insert({
      facture_id: factureId,
      type: 'email',
      canal: 'manuel',
      numero_relance: null,
      envoye_le: new Date().toISOString(),
      statut: 'payé',
    }).then(null, () => {})

    // 4. Notifier l'utilisateur par email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, company_name, plan')
      .eq('id', authenticatedId)
      .single()

    if (profile?.email) {
      const montant = Number(facture.montant)
      const montantStr = montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
      const tauxPct = getFeePercent(profile?.plan)
      const commission = Math.max(montant * (tauxPct / 100), 5)
      const net = montant - commission
      const commissionStr = commission.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
      const netStr = net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
      await getResend().emails.send({
        from: 'Manaflow <noreply@manaflow.fr>',
        to: profile.email,
        subject: `✅ Facture payée — ${facture.numero_facture || factureId}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
            <p style="font-weight:800;font-size:20px;margin:0 0 32px;">Manaflow</p>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#16A34A;font-weight:700;font-size:15px;">✅ Facture marquée comme payée</p>
            </div>
            <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">
              Vous avez marqué la facture
              <strong style="color:#111;">${facture.numero_facture || factureId}</strong>
              de <strong style="color:#111;">${facture.client_nom}</strong>
              comme payée.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr style="border-bottom:1px solid #E5E7EB;">
                <td style="padding:10px 0;color:#6B7280;font-size:14px;">Montant recouvré</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;color:#111;font-size:14px;">${montantStr} €</td>
              </tr>
              <tr style="border-bottom:1px solid #E5E7EB;">
                <td style="padding:10px 0;color:#6B7280;font-size:14px;">Commission Manaflow (${tauxPct}% tout compris)</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;color:#EC4899;font-size:14px;">−${commissionStr} €</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-weight:700;color:#111;font-size:15px;">Net perçu</td>
                <td style="padding:12px 0;text-align:right;font-weight:800;color:#16A34A;font-size:16px;">${netStr} €</td>
              </tr>
            </table>
            <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin-bottom:24px;">
              Retrouvez le détail de toutes vos commissions dans la section <strong>Facturation</strong> de votre dashboard.
            </p>
            <p style="color:#6B7280;line-height:1.7;">
              Cordialement,<br/>L'équipe Manaflow
            </p>
          </div>
        `,
      }).then(null, () => {})
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
