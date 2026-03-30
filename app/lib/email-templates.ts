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

/** Échappe les caractères HTML spéciaux pour prévenir les injections XSS. */
function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

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

/** Même chose qu'applyVariables mais avec valeurs HTML-escapées pour usage dans des templates HTML. */
function applyVariablesHtml(msg: string, params: EmailParams): string {
  const montantStr = Number(params.montant).toLocaleString('fr-FR') // sûr : chiffre
  const echeanceStr = new Date(params.dateEcheance).toLocaleDateString('fr-FR') // sûr : date
  return msg
    .replace(/\{client\}/g, escapeHtml(params.clientNom))
    .replace(/\{montant\}/g, montantStr)
    .replace(/\{facture\}/g, escapeHtml(params.numeroFacture || 'N/A'))
    .replace(/\{echeance\}/g, echeanceStr)
    .replace(/\{entreprise\}/g, escapeHtml(params.companyName))
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

  // Versions HTML-safe des données utilisateur (peuvent contenir des caractères spéciaux)
  const safeClientNom = escapeHtml(clientNom)
  const safeCompanyName = escapeHtml(companyName)
  const safeCompanyAddress = escapeHtml(companyAddress)
  const safeCompanyPhone = escapeHtml(companyPhone)
  const safeRefFacture = escapeHtml(refFacture)
  const safePaymentUrl = paymentUrl ? escapeHtml(paymentUrl) : undefined

  // Convertit le texte personnalisé en paragraphes HTML sécurisés (anti-XSS)
  const buildCustomBody = (text: string) => {
    // 1. Échapper les entités HTML du template brut (empêche l'injection HTML)
    const safeTemplate = escapeHtml(text)
    // 2. Remplacer les variables {xxx} avec des valeurs HTML-escapées
    const resolved = applyVariablesHtml(safeTemplate, params)
    // 3. Convertir les sauts de ligne en balises HTML
    return resolved
      .split(/\n\n+/)
      .map(p => `<p style="color:#6B7280;line-height:1.7;margin-bottom:12px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('')
  }

  const footer = `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E5E7EB;">
      <p style="margin:0;font-weight:700;color:#111;font-size:14px;">${safeCompanyName}</p>
      ${safeCompanyAddress ? `<p style="margin:4px 0 0;color:#6B7280;font-size:13px;">${safeCompanyAddress}</p>` : ''}
      ${safeCompanyPhone ? `<p style="margin:4px 0 0;color:#6B7280;font-size:13px;">Tél : ${safeCompanyPhone}</p>` : ''}
    </div>
    <div style="margin-top:28px;margin-left:-20px;margin-right:-20px;margin-bottom:-40px;background:linear-gradient(135deg,#0d0620 0%,#1a0a3e 100%);padding:18px 32px;text-align:center;border-radius:0 0 12px 12px;">
      <a href="https://manaflow.fr" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;">
        <img src="https://manaflow.fr/logo.png" alt="" height="20" style="height:20px;width:auto;display:inline-block;vertical-align:middle;opacity:0.9;" />
        <span style="font-size:12px;color:rgba(255,255,255,0.45);vertical-align:middle;font-family:Inter,sans-serif;letter-spacing:0.01em;">Relance automatisée par&#160;<span style="color:#c084fc;font-weight:700;">Manaflow</span></span>
      </a>
    </div>`

  const paymentLink = safePaymentUrl ? `
    <div style="margin:28px 0 24px;">
      <a href="${safePaymentUrl}" style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;text-decoration:none;border-radius:8px;padding:10px 22px;font-size:14px;font-weight:600;letter-spacing:0.01em;">Régler la facture →</a>
      <p style="margin:8px 0 0;font-size:12px;word-break:break-all;color:#9CA3AF;">
        <a href="${safePaymentUrl}" style="color:#9CA3AF;text-decoration:none;">${safePaymentUrl}</a>
        <span> · lien sécurisé</span>
      </p>
    </div>` : ''

  const invoiceBlock = `
    <p style="margin:24px 0 4px;color:#6B7280;font-size:13px;">Facture concernée :</p>
    <p style="margin:0 0 4px;font-size:14px;color:#111;"><strong>n°${safeRefFacture}</strong> · <strong>${montantStr} €</strong> · échéance ${echeanceStr}</p>`

  const subjects = [
    `Facture ${refFacture} — petit rappel`,
    `Facture ${refFacture} — 2ème rappel`,
    `Facture ${refFacture} — dernier rappel avant dossier`,
  ]

  const bodies = [
    // ── Relance 1 : ton très doux ──
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a;font-size:15px;line-height:1.8;">
      <p style="font-weight:700;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 32px;">${safeCompanyName}</p>
      <p style="margin:0 0 16px;">Bonjour,</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="margin:0 0 16px;">Sauf erreur de notre part, la facture <strong>n°${safeRefFacture}</strong> d'un montant de <strong>${montantStr} €</strong>, dont l'échéance était le ${echeanceStr}, ne semble pas encore avoir été réglée.</p>
        <p style="margin:0 0 16px;">Il s'agit probablement d'un simple oubli — n'hésitez pas à nous le faire savoir si vous avez la moindre question sur cette facture.</p>
        <p style="margin:0 0 24px;">Merci d'avance pour votre retour.</p>
      `}
      ${paymentLink}
      <p style="margin:0 0 32px;color:#6B7280;font-size:14px;">Bien cordialement,</p>
      ${footer}</div>`,

    // ── Relance 2 : ton neutre ──
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a;font-size:15px;line-height:1.8;">
      <p style="font-weight:700;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 32px;">${safeCompanyName}</p>
      <p style="margin:0 0 16px;">Bonjour ${safeClientNom},</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="margin:0 0 16px;">Je reviens vers vous concernant la facture <strong>n°${safeRefFacture}</strong> (${montantStr} €), dont le règlement n'a pas encore été reçu à ce jour.</p>
        <p style="margin:0 0 16px;">Pourriez-vous me confirmer quand vous prévoyez de la régler, ou me faire signe si quelque chose bloque de votre côté ?</p>
        <p style="margin:0 0 24px;">Si le paiement a déjà été effectué, merci d'ignorer ce message.</p>
      `}
      ${paymentLink}
      <p style="margin:0 0 32px;color:#6B7280;font-size:14px;">Bien cordialement,</p>
      ${footer}</div>`,

    // ── Relance 3 : ton ferme mais sobre ──
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a;font-size:15px;line-height:1.8;">
      <p style="font-weight:700;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 32px;">${safeCompanyName}</p>
      <p style="margin:0 0 16px;">Bonjour ${safeClientNom},</p>
      ${customMessage ? buildCustomBody(customMessage) : `
        <p style="margin:0 0 16px;">Malgré mes deux précédents messages, la facture <strong>n°${safeRefFacture}</strong> (${montantStr} €) n'a toujours pas été réglée.</p>
        <p style="margin:0 0 16px;">Je vous contacte une dernière fois. Si je n'ai pas de nouvelles sous 8 jours, je serai contraint de transmettre ce dossier pour suite à donner.</p>
        <p style="margin:0 0 24px;">Je reste bien entendu disponible si vous souhaitez en discuter.</p>
      `}
      ${paymentLink}
      <p style="margin:0 0 32px;color:#6B7280;font-size:14px;">Cordialement,</p>
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
  paymentUrl?: string,
): string {
  const ref = numeroFacture || 'N/A'
  const echeanceStr = dateEcheance
    ? new Date(dateEcheance).toLocaleDateString('fr-FR')
    : ''
  const datePart = echeanceStr ? ` arrivée à échéance le ${echeanceStr}` : ''
  const payPart = paymentUrl ? ` Payer en ligne : ${paymentUrl}` : ''
  const footer = ' — Manaflow'

  const messages = [
    `Bonjour, facture n°${ref}${datePart} toujours en attente. Merci de confirmer sa prise en charge. ${companyName}${payPart}${footer}`,
    `Bonjour ${clientNom}, 2e relance facture n°${ref}. Règlement toujours attendu. Merci de confirmer la date prévue. ${companyName}${payPart}${footer}`,
    `Bonjour ${clientNom}, facture n°${ref} — 3ème rappel. Solde toujours en attente. Merci de régulariser ou de nous contacter. ${companyName}${payPart}${footer}`,
  ]
  return messages[Math.min(numeroRelance - 1, 2)]
}
