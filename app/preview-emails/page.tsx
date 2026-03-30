import { getEmailContent } from '../lib/email-templates'

const DEMO = {
  clientNom: 'Martin Leclerc',
  montant: 1250,
  dateEcheance: '2026-02-15',
  numeroFacture: 'FAC-2026-042',
  companyName: 'Atelier Dupont',
  companyAddress: '12 rue des Artisans, 75011 Paris',
  companyPhone: '06 12 34 56 78',
  paymentUrl: 'https://manaflow.fr/payer/demo',
}

export default function PreviewEmails() {
  const emails = [1, 2, 3].map(n => getEmailContent({ ...DEMO, numeroRelance: n }))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f3f4f6', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>Preview — Emails de relance</h1>
        <p style={{ color: '#6B7280', marginBottom: 40, fontSize: 14 }}>
          Données fictives · Entreprise : {DEMO.companyName} · Client : {DEMO.clientNom} · Facture : {DEMO.numeroFacture} · {DEMO.montant} €
        </p>

        {/* SMS preview */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', marginBottom: 32, border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 20 }}>📱 SMS envoyés (plan Pro)</h2>
          {[1, 2, 3].map(n => {
            const payPart = ` Payer en ligne : ${DEMO.paymentUrl}`
            const footer = ' — Manaflow'
            const echeance = new Date(DEMO.dateEcheance).toLocaleDateString('fr-FR')
            const texts = [
              `Bonjour, facture n°${DEMO.numeroFacture} arrivée à échéance le ${echeance} toujours en attente. Merci de confirmer sa prise en charge. ${DEMO.companyName}${payPart}${footer}`,
              `Bonjour ${DEMO.clientNom}, 2e relance facture n°${DEMO.numeroFacture}. Règlement toujours attendu. Merci de confirmer la date prévue. ${DEMO.companyName}${payPart}${footer}`,
              `Bonjour ${DEMO.clientNom}, facture n°${DEMO.numeroFacture} impayée malgré nos relances. Sans réponse sous 8j, procédure de recouvrement engagée. ${DEMO.companyName}${payPart}${footer}`,
            ]
            return (
              <div key={n} style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Relance {n}
                </span>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 16px', marginTop: 6, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                  {texts[n - 1]}
                </div>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{texts[n - 1].length} caractères</p>
              </div>
            )
          })}
        </div>

        {/* Email previews */}
        {emails.map((email, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ background: i === 2 ? '#FEF2F2' : i === 1 ? '#FFF7ED' : '#F0FDF4', color: i === 2 ? '#DC2626' : i === 1 ? '#EA580C' : '#16A34A', border: `1px solid ${i === 2 ? '#FECACA' : i === 1 ? '#FED7AA' : '#BBF7D0'}`, borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                Relance {i + 1}
              </span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Objet : {email.subject}</span>
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 20px', fontSize: 12, color: '#6B7280' }}>
                <span style={{ marginRight: 24 }}><strong>De :</strong> {DEMO.companyName} via Manaflow &lt;relances@manaflow.fr&gt;</span>
                <span style={{ marginRight: 24 }}><strong>À :</strong> martin.leclerc@example.com</span>
                <span><strong>Répondre à :</strong> contact@atelierdupont.fr</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: email.html }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
