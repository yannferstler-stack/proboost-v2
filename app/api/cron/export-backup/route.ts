import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'
import { Resend } from 'resend'
import * as XLSX from 'xlsx'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@manaflow.fr'

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

function fmt(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}

function eur(amount: number | null | undefined): string {
  if (amount == null) return ''
  return `${(amount / 100).toFixed(2)} €`.replace('.', ',')
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // ── 1. Récupérer toutes les données ──
  const [
    { data: profiles },
    { data: factures },
    { data: relances },
  ] = await Promise.all([
    supabase.from('profiles').select('id, email, company_name, plan, created_at, credits'),
    supabase.from('factures').select('*').order('created_at', { ascending: false }),
    supabase.from('relances').select('*').order('sent_at', { ascending: false }),
  ])

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-')

  // ── 2. Feuille Utilisateurs ──
  const usersSheet = XLSX.utils.json_to_sheet(
    (profiles ?? []).map(p => ({
      'Email':          p.email ?? '',
      'Entreprise':     p.company_name ?? '',
      'Plan':           p.plan ?? '',
      'Crédits restants': p.credits ?? 0,
      'Inscrit le':     fmt(p.created_at),
    }))
  )

  // ── 3. Feuille Factures ──
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const facturesSheet = XLSX.utils.json_to_sheet(
    (factures ?? []).map(f => ({
      'N° facture':       f.numero_facture ?? '',
      'Client':           f.client_nom ?? '',
      'Email client':     f.client_email ?? '',
      'Montant':          f.montant != null ? `${f.montant} €` : '',
      'Échéance':         fmt(f.date_echeance),
      'Statut':           f.statut ?? '',
      'Relances envoyées': f.nombre_relances ?? 0,
      'Prochaine relance': fmt(f.next_relance_date),
      'Séquence active':  f.sequence_active ? 'Oui' : 'Non',
      'Créée le':         fmt(f.created_at),
      'Payée le':         fmt(f.paid_at),
      'Utilisateur':      profileMap[f.user_id]?.email ?? f.user_id ?? '',
    }))
  )

  // ── 4. Feuille Relances ──
  const factureMap = Object.fromEntries((factures ?? []).map(f => [f.id, f]))
  const relancesSheet = XLSX.utils.json_to_sheet(
    (relances ?? []).map(r => {
      const f = factureMap[r.facture_id] ?? {}
      return {
        'Date envoi':       fmt(r.sent_at),
        'N° relance':       r.numero_relance ?? '',
        'Canal':            r.canal ?? '',
        'Statut':           r.statut ?? '',
        'N° facture':       f.numero_facture ?? r.facture_id ?? '',
        'Client':           f.client_nom ?? '',
        'Montant facture':  f.montant != null ? `${f.montant} €` : '',
        'Utilisateur':      profileMap[f.user_id]?.email ?? '',
      }
    })
  )

  // ── 5. Feuille Paiements reçus ──
  const paiementsSheet = XLSX.utils.json_to_sheet(
    (factures ?? [])
      .filter(f => f.statut === 'payée' && f.paid_at)
      .map(f => ({
        'N° facture':     f.numero_facture ?? '',
        'Client':         f.client_nom ?? '',
        'Montant':        f.montant != null ? `${f.montant} €` : '',
        'Payé le':        fmt(f.paid_at),
        'Commission':     f.commission_amount != null ? eur(f.commission_amount) : '',
        'Utilisateur':    profileMap[f.user_id]?.email ?? '',
      }))
  )

  // ── 6. Génération du fichier Excel ──
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, usersSheet,    'Utilisateurs')
  XLSX.utils.book_append_sheet(wb, facturesSheet, 'Factures')
  XLSX.utils.book_append_sheet(wb, relancesSheet, 'Relances')
  XLSX.utils.book_append_sheet(wb, paiementsSheet,'Paiements')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const base64 = Buffer.from(buffer).toString('base64')
  const filename = `manaflow-backup-${dateStr}.xlsx`

  // ── 7. Envoi par email ──
  const resend = new Resend(process.env.RESEND_API_KEY)
  const nbUsers    = profiles?.length ?? 0
  const nbFactures = factures?.length ?? 0
  const nbRelances = relances?.length ?? 0
  const nbPayees   = factures?.filter(f => f.statut === 'payée').length ?? 0

  await resend.emails.send({
    from:    'Manaflow <noreply@manaflow.fr>',
    to:      ADMIN_EMAIL,
    subject: `📊 Backup Manaflow — ${dateStr}`,
    html: `
      <div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#111;">
        <p style="font-size:22px;font-weight:700;margin:0 0 24px;">Backup hebdomadaire Manaflow</p>
        <p style="color:#555;margin:0 0 24px;">Voici le résumé complet de la base au <strong>${dateStr}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px 14px;font-weight:600;">Utilisateurs inscrits</td>
            <td style="padding:10px 14px;text-align:right;">${nbUsers}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:600;">Factures totales</td>
            <td style="padding:10px 14px;text-align:right;">${nbFactures}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px 14px;font-weight:600;">Dont payées</td>
            <td style="padding:10px 14px;text-align:right;">${nbPayees}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:600;">Relances envoyées (total)</td>
            <td style="padding:10px 14px;text-align:right;">${nbRelances}</td>
          </tr>
        </table>
        <p style="color:#888;font-size:13px;">Le fichier Excel contient 4 onglets : Utilisateurs, Factures, Relances, Paiements.</p>
      </div>`,
    attachments: [{ filename, content: base64 }],
  })

  return NextResponse.json({
    ok: true,
    stats: { nbUsers, nbFactures, nbRelances, nbPayees },
    file: filename,
  })
}
