import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getAuthUserId } from '../../lib/auth'

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
      .select('email, company_name')
      .eq('id', authenticatedId)
      .single()

    if (profile?.email) {
      const montantStr = Number(facture.montant).toLocaleString('fr-FR')
      await getResend().emails.send({
        from: 'ManaFlow <noreply@manaflow.fr>',
        to: profile.email,
        subject: `✅ Facture payée — ${facture.numero_facture || factureId}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
            <p style="font-weight:800;font-size:20px;margin:0 0 32px;">ManaFlow</p>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#16A34A;font-weight:700;font-size:15px;">✅ Facture marquée comme payée</p>
            </div>
            <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">
              Vous avez manuellement marqué la facture
              <strong style="color:#111;">${facture.numero_facture || factureId}</strong>
              de <strong style="color:#111;">${facture.client_nom}</strong>
              comme payée — montant de <strong style="color:#16A34A;">${montantStr} €</strong>.
            </p>
            <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
              La séquence de relances a été arrêtée et la facture est maintenant
              <strong style="color:#16A34A;">soldée</strong> dans votre dashboard.
            </p>
            <p style="color:#6B7280;line-height:1.7;">
              Cordialement,<br/>L'équipe ManaFlow
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
