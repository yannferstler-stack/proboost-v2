export type EmailParams = {
  clientNom: string
  montant: number
  dateEcheance: string
  numeroFacture: string
  companyName: string
  companyAddress: string
  companyPhone: string
  numeroRelance: number
  paymentUrl?: string   // Lien Stripe Checkout pour payer directement depuis l'email
}

export function getEmailContent(params: EmailParams): { subject: string; html: string } {
  const {
    clientNom, montant, dateEcheance, numeroFacture,
    companyName, companyAddress, companyPhone, numeroRelance,
    paymentUrl,
  } = params

  const montantStr = Number(montant).toLocaleString('fr-FR')
  const echeanceStr = new Date(dateEcheance).toLocaleDateString('fr-FR')
  const refFacture = numeroFacture || 'N/A'

  const footer = `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E5E7EB;">
      <p style="margin:0;font-weight:700;color:#111;font-size:14px;">${companyName}</p>
      ${companyAddress ? `<p style="margin:4px 0 0;color:#6B7280;font-size:13px;">${companyAddress}</p>` : ''}
      ${companyPhone ? `<p style="margin:4px 0 0;color:#6B7280;font-size:13px;">Tél : ${companyPhone}</p>` : ''}
    </div>`

  const paymentButton = paymentUrl ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${paymentUrl}"
        style="display:inline-block;background:linear-gradient(135deg,#16A34A,#15803D);color:white;text-decoration:none;border-radius:10px;padding:14px 32px;font-weight:700;font-size:16px;letter-spacing:0.01em;">
        Payer maintenant →
      </a>
      <p style="margin:10px 0 0;color:#9CA3AF;font-size:12px;">Paiement sécurisé par Stripe</p>
    </div>` : ''

  const subjects = [
    `Rappel de paiement — Facture ${refFacture} — ${montantStr} €`,
    `2ème relance — Facture ${refFacture} impayée — ${montantStr} €`,
    `URGENT — Mise en demeure — Facture ${refFacture} — ${montantStr} €`,
  ]

  const bodies = [
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <h2 style="font-size:22px;margin-bottom:20px;">Rappel de paiement</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour ${clientNom},</p>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Nous vous contactons concernant la facture <strong style="color:#111;">${refFacture}</strong> d'un montant de <strong style="color:#111;">${montantStr} €</strong> dont l'échéance était le <strong style="color:#111;">${echeanceStr}</strong>.</p>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Sauf erreur de notre part, ce règlement ne nous est pas encore parvenu. Pourriez-vous effectuer ce paiement dans les meilleurs délais ?</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant à régler</p>
        <p style="margin:4px 0 0;font-weight:800;color:#16A34A;font-size:22px;">${montantStr} €</p>
      </div>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Cordialement,</p>
      ${footer}</div>`,

    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;color:#EA580C;font-weight:600;font-size:14px;">⚠️ 2ème relance — Facture ${refFacture} toujours impayée</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:20px;">Deuxième rappel de paiement</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour ${clientNom},</p>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Malgré notre premier rappel, la facture <strong style="color:#111;">${refFacture}</strong> d'un montant de <strong style="color:#111;">${montantStr} €</strong> échue le <strong style="color:#111;">${echeanceStr}</strong> reste impayée.</p>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Nous vous demandons de régulariser cette situation dans un délai de <strong style="color:#111;">7 jours</strong>.</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant à régler sous 7 jours</p>
        <p style="margin:4px 0 0;font-weight:800;color:#DC2626;font-size:22px;">${montantStr} €</p>
      </div>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Sans réponse de votre part, nous serons contraints d'engager une procédure de recouvrement.</p>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Cordialement,</p>
      ${footer}</div>`,

    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;color:#DC2626;font-weight:600;font-size:14px;">🚨 MISE EN DEMEURE — Facture ${refFacture} — Action requise immédiatement</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:20px;">Mise en demeure de payer</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour ${clientNom},</p>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Par la présente, nous vous mettons en demeure de régler sous <strong style="color:#DC2626;">48 heures</strong> la somme de <strong style="color:#DC2626;">${montantStr} €</strong> correspondant à la facture <strong style="color:#111;">${refFacture}</strong> échue le ${echeanceStr}.</p>
      <div style="background:#FEF2F2;border:2px solid #DC2626;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant à régler IMMÉDIATEMENT</p>
        <p style="margin:4px 0 0;font-weight:800;color:#DC2626;font-size:24px;">${montantStr} €</p>
      </div>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Sans règlement sous 48h, nous transmettrons ce dossier à notre service contentieux.</p>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Cordialement,</p>
      ${footer}</div>`,
  ]

  const index = Math.min(numeroRelance - 1, 2)
  return { subject: subjects[index], html: bodies[index] }
}

export function getSmsContent(
  clientNom: string,
  montant: number,
  numeroFacture: string,
  companyName: string,
  numeroRelance: number,
): string {
  const montantStr = Number(montant).toLocaleString('fr-FR')
  const ref = numeroFacture || 'N/A'
  const messages = [
    `Bonjour ${clientNom}, rappel de paiement : facture ${ref} de ${montantStr}€ est échue. Merci de régulariser. — ${companyName}`,
    `Bonjour ${clientNom}, 2ème relance : facture ${ref} (${montantStr}€) toujours impayée. Régularisez sous 7j pour éviter des poursuites. — ${companyName}`,
    `URGENT — ${clientNom}, mise en demeure : facture ${ref} (${montantStr}€) à régler sous 48h ou transmission au contentieux. — ${companyName}`,
  ]
  return messages[Math.min(numeroRelance - 1, 2)]
}
