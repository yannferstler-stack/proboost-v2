'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    titre: '1. Qui sommes-nous ?',
    contenu: `ManaFlow est une plateforme d'automatisation de relances de factures impayées, éditée par ManaFlow SAS, dont le siège social est en France.

En tant que responsable de traitement au sens du Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679), ManaFlow s'engage à traiter vos données personnelles avec la plus grande transparence et dans le respect de la vie privée.

Pour toute question relative à vos données : contact@manaflow.fr`,
  },
  {
    titre: '2. Données collectées',
    contenu: `Dans le cadre de l'utilisation de nos services, nous collectons les données suivantes :

Données d'inscription
• Nom et prénom
• Adresse email professionnelle
• Numéro SIRET
• Informations de facturation (traitées par Stripe)

Données d'utilisation de la plateforme
• Factures importées (montant, date d'échéance, coordonnées du débiteur)
• Historique des relances envoyées
• Données de connexion (adresse IP, horodatage)

Données transmises par vos débiteurs
• Les coordonnées email et téléphoniques de vos clients que vous renseignez pour les relances

ManaFlow ne collecte aucune donnée bancaire directement — les paiements sont gérés par Stripe, certifié PCI-DSS.`,
  },
  {
    titre: '3. Finalités du traitement',
    contenu: `Vos données sont traitées pour les finalités suivantes :

• Exécution du contrat : fourniture du service de relance automatisée, gestion de votre abonnement
• Facturation et recouvrement de nos prestations
• Amélioration du service : analyse des performances des séquences de relance (données anonymisées)
• Communication : envoi des notifications relatives à votre compte, actualités du service (avec votre consentement)
• Obligations légales : conservation des données comptables conformément à la loi française`,
  },
  {
    titre: '4. Base légale des traitements',
    contenu: `Selon les cas, les traitements reposent sur :

• L'exécution du contrat (CGU acceptées lors de l'inscription) : traitement des factures, envoi des relances, gestion de l'abonnement
• L'intérêt légitime de ManaFlow : amélioration du service, prévention de la fraude, sécurité
• Le consentement : envoi de communications marketing (révocable à tout moment)
• L'obligation légale : conservation des données comptables (10 ans)`,
  },
  {
    titre: '5. Durée de conservation',
    contenu: `Vos données sont conservées selon les durées suivantes :

• Données de compte actif : pendant toute la durée de l'abonnement + 12 mois après résiliation
• Factures et historique de relances : 5 ans à compter de leur création (prescription commerciale)
• Données de facturation ManaFlow : 10 ans (obligation comptable)
• Données de connexion (logs) : 12 mois

À l'expiration de ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`,
  },
  {
    titre: '6. Partage des données',
    contenu: `ManaFlow ne vend jamais vos données personnelles. Nous pouvons partager vos données uniquement avec :

• Stripe (paiements) : certifié PCI-DSS, données chiffrées
• Supabase (base de données) : hébergement en Europe, certifié ISO 27001
• Prestataires d'envoi email/SMS : dans la stricte limite des besoins du service
• Autorités légales : uniquement sur réquisition judiciaire

Tous nos sous-traitants sont liés par des contrats de traitement conformes au RGPD (DPA).`,
  },
  {
    titre: '7. Vos droits (RGPD)',
    contenu: `Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :

• Droit d'accès : obtenir une copie de vos données
• Droit de rectification : corriger des données inexactes
• Droit à l'effacement : demander la suppression de vos données (sous réserve des obligations légales)
• Droit à la portabilité : recevoir vos données dans un format structuré
• Droit d'opposition : vous opposer à certains traitements basés sur l'intérêt légitime
• Droit à la limitation : restreindre temporairement un traitement

Pour exercer vos droits : contact@manaflow.fr
Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).`,
  },
  {
    titre: '8. Sécurité des données',
    contenu: `ManaFlow met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :

• Chiffrement en transit (TLS 1.3) et au repos (AES-256)
• Accès aux données restreint aux seuls collaborateurs habilités
• Authentification sécurisée via Supabase Auth
• Audits de sécurité réguliers
• Hébergement en Europe (Union Européenne)

En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, vous en serez informé dans les 72 heures conformément à l'article 33 du RGPD.`,
  },
  {
    titre: '9. Cookies',
    contenu: `ManaFlow utilise des cookies strictement nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement préalable.

Cookies utilisés :
• Cookies de session : authentification, maintien de la connexion (durée : session)
• Stripe : gestion sécurisée des paiements

Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui peut affecter certaines fonctionnalités du service.`,
  },
  {
    titre: '10. Modifications de cette politique',
    contenu: `ManaFlow se réserve le droit de modifier la présente politique de confidentialité à tout moment. Toute modification substantielle vous sera notifiée par email et/ou via une notification dans votre tableau de bord, au moins 15 jours avant son entrée en vigueur.

La politique en vigueur est toujours accessible à l'adresse manaflow.fr/confidentialite.

Dernière mise à jour : janvier 2025`,
  },
]

export default function ConfidentialitePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .section-card { border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.2s; }
        .section-card:hover { border-color: rgba(168,85,247,0.25); }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh' }}>

        <div style={{ position: 'fixed', top: '5%', left: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
            </div>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14 }}>Accueil</span>
              <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14 }}>Comment ça marche ?</span>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '72px 20px 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.22)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: 12, color: '#f472b6', fontWeight: 600 }}>Conforme RGPD</span>
          </div>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Politique de<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Confidentialité</span>
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Comment nous collectons, utilisons et protégeons vos données personnelles.
          </p>
        </div>

        {/* CONTENU */}
        <section style={{ padding: isMobile ? '0 20px 80px' : '0 40px 100px', maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {SECTIONS.map((s, i) => (
              <div key={i} className="section-card" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: isMobile ? '24px 20px' : '32px 36px' }}>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 15 : 17, color: 'white', marginBottom: 14 }}>{s.titre}</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.contenu}</p>
              </div>
            ))}
          </div>

          {/* Contact RGPD */}
          <div style={{ marginTop: 32, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.22)', borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 36px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <p style={{ fontFamily: 'Comfortaa', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 4 }}>Une question sur vos données ?</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Contactez-nous à <span style={{ color: '#c084fc', fontWeight: 600 }}>contact@manaflow.fr</span> — réponse sous 48h.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2025 ManaFlow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/cgu')} style={{ fontSize: 12 }}>CGU</span>
              <span className="nav-a" style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>Confidentialité</span>
              <span className="nav-a" onClick={() => router.push('/contact')} style={{ fontSize: 12 }}>Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
