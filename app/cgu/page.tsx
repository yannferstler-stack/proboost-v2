'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    titre: 'Article 1 — Objet',
    contenu: `Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation des services proposés par ManaFlow, plateforme d'automatisation des relances de factures impayées, accessible à l'adresse manaflow.fr.

En accédant à la plateforme et en utilisant les services ManaFlow, l'utilisateur accepte sans réserve les présentes CGU. Si l'utilisateur n'accepte pas ces conditions, il doit cesser d'utiliser le service.`,
  },
  {
    titre: 'Article 2 — Description du service',
    contenu: `ManaFlow est un service d'automatisation de relances de factures destiné aux professionnels (TPE, PME, indépendants, artisans). La plateforme permet :

• L'import de factures au format CSV ou PDF
• L'envoi automatique de relances par email et/ou SMS selon le plan souscrit
• Le suivi de l'état de recouvrement via un tableau de bord
• La personnalisation des délais et séquences de relance (selon le plan)

ManaFlow n'agit pas en qualité d'huissier ou de société de recouvrement judiciaire. Le service se limite à des relances amiables automatisées.`,
  },
  {
    titre: 'Article 3 — Accès et inscription',
    contenu: `L'accès aux services ManaFlow est réservé aux professionnels majeurs disposant d'un numéro SIRET valide. L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription.

Chaque compte est strictement personnel et ne peut être partagé. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Tout accès frauduleux au compte d'un tiers est strictement interdit.

ManaFlow se réserve le droit de suspendre ou de résilier tout compte en cas de violation des présentes CGU.`,
  },
  {
    titre: 'Article 4 — Abonnements et facturation',
    contenu: `L'accès aux services ManaFlow est conditionné à la souscription d'un abonnement mensuel parmi les offres disponibles :

• Plan Starter (19,99 €/mois) — 10 factures/mois, 3 relances par facture, email uniquement
• Plan Premium (49,99 €/mois) — 50 factures/mois, 5 relances par facture, délais personnalisables
• Plan Pro (149,99 €/mois) — jusqu'à 200 factures/mois, email + SMS, support prioritaire

Les abonnements sont facturés mensuellement par prélèvement automatique via Stripe. Toute période commencée est due en totalité. Les tarifs sont susceptibles d'évoluer ; l'utilisateur sera informé 30 jours à l'avance.`,
  },
  {
    titre: 'Article 5 — Commission au succès',
    contenu: `En complément de l'abonnement mensuel, ManaFlow prélève une commission sur les factures effectivement recouvrées grâce à la plateforme :

• Plan Starter : 14% du montant recouvré (minimum 5€)
• Plan Premium : 12% du montant recouvré (minimum 5€)
• Plan Pro : 10% du montant recouvré (minimum 5€)

Aucune commission n'est due si la facture n'est pas réglée. La commission est prélevée automatiquement lors de la confirmation du paiement par le débiteur, déclarée manuellement par l'utilisateur via son tableau de bord.`,
  },
  {
    titre: 'Article 6 — Obligations de l\'utilisateur',
    contenu: `L'utilisateur s'engage à :

• N'importer que des factures légitimes pour lesquelles il est créancier
• Vérifier l'exactitude des informations renseignées (montants, coordonnées)
• Utiliser le service conformément à la législation en vigueur
• Ne pas utiliser ManaFlow à des fins de harcèlement ou d'intimidation
• Respecter le RGPD concernant les données personnelles de ses débiteurs

Tout usage abusif ou frauduleux du service entraîne la résiliation immédiate du compte sans remboursement.`,
  },
  {
    titre: 'Article 7 — Responsabilité',
    contenu: `ManaFlow s'engage à mettre en œuvre tous les moyens nécessaires pour assurer la disponibilité et le bon fonctionnement de la plateforme. Toutefois, ManaFlow ne peut être tenu responsable :

• Des résultats du recouvrement (le paiement dépend du débiteur)
• Des interruptions de service dues à des causes extérieures (force majeure, défaillance des opérateurs tiers)
• Des erreurs dans les informations fournies par l'utilisateur
• Des conséquences d'une utilisation non conforme aux présentes CGU

La responsabilité de ManaFlow est limitée au montant des abonnements perçus sur les 3 derniers mois.`,
  },
  {
    titre: 'Article 8 — Résiliation',
    contenu: `L'utilisateur peut résilier son abonnement à tout moment depuis son espace client. La résiliation prend effet à la fin de la période d'abonnement en cours. Aucun remboursement ne sera effectué pour la période restante.

ManaFlow se réserve le droit de résilier unilatéralement tout compte en cas de :
• Non-paiement de l'abonnement
• Violation des présentes CGU
• Usage frauduleux du service

En cas de résiliation, les données de l'utilisateur sont conservées 12 mois puis supprimées.`,
  },
  {
    titre: 'Article 9 — Propriété intellectuelle',
    contenu: `L'ensemble des éléments de la plateforme ManaFlow (logo, interface, algorithmes, textes, code source) est la propriété exclusive de ManaFlow SAS et est protégé par le droit de la propriété intellectuelle.

Toute reproduction, modification ou exploitation non autorisée est strictement interdite. L'utilisateur conserve la propriété de ses données (factures, informations clients) qu'il importe sur la plateforme.`,
  },
  {
    titre: 'Article 10 — Droit applicable et litiges',
    contenu: `Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.

À défaut d'accord amiable dans un délai de 30 jours, les tribunaux compétents de Paris seront seuls compétents pour connaître du litige.

Pour toute réclamation : contact@manaflow.fr`,
  },
]

export default function CguPage() {
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
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

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: 'white' }}>ManaFlow</span>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Dernière mise à jour : janvier 2025</span>
          </div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Conditions Générales<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>d&apos;Utilisation</span>
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Conditions régissant l&apos;accès et l&apos;utilisation des services ManaFlow.
          </p>
        </div>

        {/* CONTENU */}
        <section style={{ padding: isMobile ? '0 20px 80px' : '0 40px 100px', maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {SECTIONS.map((s, i) => (
              <div key={i} className="section-card" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: isMobile ? '24px 20px' : '32px 36px' }}>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: isMobile ? 15 : 17, color: 'white', marginBottom: 14 }}>{s.titre}</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.contenu}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 15, color: 'white' }}>ManaFlow</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2025 ManaFlow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>CGU</span>
              <span className="nav-a" onClick={() => router.push('/confidentialite')} style={{ fontSize: 12 }}>Confidentialité</span>
              <span className="nav-a" onClick={() => router.push('/contact')} style={{ fontSize: 12 }}>Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
