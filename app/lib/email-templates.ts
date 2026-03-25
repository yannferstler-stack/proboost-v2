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
  customMessage?: string // Texte personnalisé remplaçant le paragraphe principal
}

// Textes par défaut pour chaque niveau de relance (utilisés dans Settings comme placeholder)
export const DEFAULT_MESSAGES = [
  `Nous vous contactons concernant la facture n°{facture}, émise par {entreprise} et dont l'échéance était fixée au {echeance}.

Sauf erreur de notre part, son règlement ne semble pas avoir été pris en charge. Nous sommes certains qu'il s'agit d'un simple contretemps. Lorsque vous en aurez la possibilité, pourriez-vous me confirmer que la facture est bien gérée svp ?

Un grand merci par avance, et au plaisir d'échanger très prochainement.`,

  `Je me permets de revenir vers vous concernant la facture n°{facture}, arrivée à échéance le {echeance}, et pour laquelle nous n'avons pas encore reçu le règlement à ce jour.

N'ayant pas eu de retour à mon précédent message, je préfère m'assurer que celui-ci vous est bien parvenu et que tout est en ordre de votre côté.

Pourriez-vous, lorsque cela vous sera possible, me confirmer la date prévue de règlement ?

Je vous remercie par avance pour votre retour et reste bien entendu à votre disposition. Si le règlement a été effectué entre-temps, merci d'ignorer ce message.`,

  `Malgré mes précédents messages, la facture n°{facture}, échue le {echeance}, demeure impayée à ce jour.

Sauf erreur de ma part, nous n'avons reçu aucun retour de votre part concernant ce règlement.

Je me permets donc de vous informer qu'à défaut de réponse ou de règlement sous huitaine, nous serions contraints d'engager une procédure de recouvrement, ce que je souhaiterais naturellement éviter compte tenu de la qualité de nos relations.

Je reste bien entendu disponible pour échanger si nécessaire et trouver une solution rapide. Si le règlement a été effectué entre-temps, merci d'ignorer ce message.`,
]

function applyVariables(msg: string, params: EmailParams): string {
  const montantStr = Number(params.montant).toLocaleString('fr-FR')
  const echeanceStr = new Date(params.dateEcheance).toLocaleDateString('fr-FR')
  return msg
    .replace(/\{client\}/g, params.clientNom)
    .replace(/\{montant\}/g, montantStr)
    .replace(/\{facture\}/g, params.numeroFacture || 'N/A')
    .replace(/\{echeance\}/g, echeanceStr)
    .replace(/\{entreprise\}/g, params.companyName)
}

export function getEmailContent(params: EmailParams): { subject: string; html: string } {
  const {
    clientNom, montant, dateEcheance, numeroFacture,
    companyName, companyAddress, companyPhone, numeroRelance,
    paymentUrl, customMessage,
  } = params

  const montantStr = Number(montant).toLocaleString('fr-FR')
  const echeanceStr = new Date(dateEcheance).toLocaleDateString('fr-FR')
  const refFacture = numeroFacture || 'N/A'

  // Convertit le texte personnalisé (avec sauts de ligne) en paragraphes HTML
  const buildCustomBody = (text: string) => {
    const resolved = applyVariables(text, params)
    return resolved
      .split(/\n\n+/)
      .map(p => `<p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('')
  }

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
    `Dernière relance avant mise en recouvrement – facture n°${refFacture}`,
  ]

  const bodies = [
    // ── Relance 1 : ton très doux, "simple contretemps" ──
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <h2 style="font-size:22px;margin-bottom:20px;">Suivi de facture</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour,</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Nous vous contactons concernant la facture <strong style="color:#111;">n°${refFacture}</strong>, émise par <strong style="color:#111;">${companyName}</strong> et dont l'échéance était fixée au <strong style="color:#111;">${echeanceStr}</strong>.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Sauf erreur de notre part, son règlement ne semble pas avoir été pris en charge. Nous sommes certains qu'il s'agit d'un simple contretemps. Lorsque vous en aurez la possibilité, pourriez-vous nous confirmer que la facture est bien gérée ?</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Un grand merci par avance, et au plaisir d'échanger très prochainement.</p>
      `}
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant à régler</p>
        <p style="margin:4px 0 0;font-weight:800;color:#16A34A;font-size:22px;">${montantStr} €</p>
      </div>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Bien à vous,</p>
      ${footer}</div>`,

    // ── Relance 2 : ton neutre, demande date de règlement ──
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;color:#EA580C;font-weight:600;font-size:14px;">⚠️ Deuxième relance — Facture n°${refFacture} toujours en attente</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:20px;">Deuxième relance</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour ${clientNom},</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Je me permets de revenir vers vous concernant la facture <strong style="color:#111;">n°${refFacture}</strong>, arrivée à échéance le <strong style="color:#111;">${echeanceStr}</strong>, et pour laquelle nous n'avons pas encore reçu le règlement à ce jour.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">N'ayant pas eu de retour à mon précédent message, je préfère m'assurer que celui-ci vous est bien parvenu et que tout est en ordre de votre côté.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Pourriez-vous, lorsque cela vous sera possible, me confirmer la date prévue de règlement ? Je reste bien entendu à votre disposition. Si le règlement a été effectué entre-temps, merci d'ignorer ce message.</p>
      `}
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant en attente</p>
        <p style="margin:4px 0 0;font-weight:800;color:#DC2626;font-size:22px;">${montantStr} €</p>
      </div>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Bien à vous,</p>
      ${footer}</div>`,

    // ── Relance 3 : ferme, dernière relance avant recouvrement ──
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
      <p style="font-weight:800;font-size:20px;margin:0 0 32px;">${companyName}</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;color:#DC2626;font-weight:600;font-size:14px;">🚨 Dernière relance — Facture n°${refFacture} — Action requise</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:20px;">Dernière relance avant mise en recouvrement</h2>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Bonjour ${clientNom},</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Malgré mes précédents messages, la facture <strong style="color:#111;">n°${refFacture}</strong>, échue le <strong style="color:#111;">${echeanceStr}</strong>, demeure impayée à ce jour.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Sauf erreur de ma part, nous n'avons reçu aucun retour de votre part concernant ce règlement.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">Je me permets donc de vous informer qu'à défaut de réponse ou de règlement sous huitaine, nous serions contraints d'engager une procédure de recouvrement, ce que je souhaiterais naturellement éviter compte tenu de la qualité de nos relations.</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">Je reste bien entendu disponible pour échanger si nécessaire et trouver une solution rapide. Si le règlement a été effectué entre-temps, merci d'ignorer ce message.</p>
      `}
      <div style="background:#FEF2F2;border:2px solid #DC2626;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#6B7280;font-size:13px;">Référence facture</p>
        <p style="margin:4px 0 8px;font-weight:700;color:#111;">${refFacture}</p>
        <p style="margin:0;color:#6B7280;font-size:13px;">Montant à régler sous huitaine</p>
        <p style="margin:4px 0 0;font-weight:800;color:#DC2626;font-size:24px;">${montantStr} €</p>
      </div>
      ${paymentButton}
      <p style="color:#6B7280;line-height:1.7;">Dans l'attente de votre retour,<br/>Bien à vous,</p>
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
  dateEcheance?: string,
): string {
  const ref = numeroFacture || 'N/A'
  const echeanceStr = dateEcheance
    ? new Date(dateEcheance).toLocaleDateString('fr-FR')
    : ''
  const datePart = echeanceStr ? ` arrivée à échéance le ${echeanceStr}` : ''

  const messages = [
    `Bonjour, message rapide concernant la facture n°${ref}${datePart}. Sauf oubli, nous n'avons pas encore reçu le règlement. Pouvez-vous me confirmer sa prise en compte ? Merci d'avance. ${companyName}`,
    `Bonjour ${clientNom}, je me permets de revenir vers vous pour la facture n°${ref}${datePart}, toujours en attente de règlement à ce jour. Pouvez-vous me confirmer la date prévue de paiement ? Merci d'avance. ${companyName}`,
    `Bonjour ${clientNom}, malgré mes relances précédentes, la facture n°${ref} reste impayée. Sans retour sous quelques jours, je serai contraint d'engager une procédure de recouvrement. Je préfère bien sûr éviter cela. Merci de votre retour rapide. ${companyName}`,
  ]
  return messages[Math.min(numeroRelance - 1, 2)]
}
