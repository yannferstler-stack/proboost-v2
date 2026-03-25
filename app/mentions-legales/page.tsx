'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    titre: '1 — Éditeur du site',
    contenu: `Le site manaflow.fr est édité par :

ManaFlow (entreprise individuelle / SAS en cours d'immatriculation)
Siège social : France
Email : contact@manaflow.fr
Directeur de la publication : Yann Ferstler

ManaFlow est une plateforme d'automatisation des relances de factures impayées à destination des professionnels (TPE, PME, indépendants).`,
  },
  {
    titre: '2 — Hébergement',
    contenu: `Le site manaflow.fr est hébergé par :

Vercel Inc.
440 N Barranca Ave #4133
Covina, CA 91723 — États-Unis
Site : vercel.com

Les bases de données sont hébergées par Supabase Inc. (infrastructure AWS eu-west-1, Irlande), conformément au RGPD.`,
  },
  {
    titre: '3 — Propriété intellectuelle',
    contenu: `L'ensemble des éléments constituant le site manaflow.fr (textes, graphismes, logo, icônes, images, code source, architecture) sont la propriété exclusive de ManaFlow et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.

Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces éléments est interdite sans l'autorisation écrite préalable de ManaFlow.

Le non-respect de cette interdiction constitue une contrefaçon pouvant engager la responsabilité civile et pénale de son auteur.`,
  },
  {
    titre: '4 — Données personnelles',
    contenu: `ManaFlow collecte et traite des données personnelles dans le cadre de la fourniture de ses services de relance de factures. Ces traitements sont effectués conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi Informatique et Libertés modifiée.

Responsable du traitement : ManaFlow — contact@manaflow.fr

Données collectées : nom, email professionnel, numéro SIRET, données de facturation, informations relatives à vos débiteurs (dans le cadre du mandat de relance).

Pour exercer vos droits (accès, rectification, suppression, portabilité, opposition), contactez-nous à : contact@manaflow.fr

Pour plus d'informations, consultez notre Politique de Confidentialité.`,
  },
  {
    titre: '5 — Cookies',
    contenu: `Le site manaflow.fr utilise des cookies techniques strictement nécessaires au fonctionnement du service (session, authentification, préférences).

Aucun cookie publicitaire ou de traçage tiers n'est déposé sans votre consentement explicite.

Vous pouvez configurer votre navigateur pour refuser les cookies. Certaines fonctionnalités du service pourraient alors ne plus être disponibles.`,
  },
  {
    titre: '6 — Limitation de responsabilité',
    contenu: `ManaFlow s'efforce de fournir des informations aussi précises que possible sur son site. Toutefois, ManaFlow ne pourra être tenu responsable des omissions, inexactitudes ou carences dans la mise à jour des informations.

ManaFlow ne saurait être tenu responsable de tout dommage direct ou indirect résultant de l'utilisation du site manaflow.fr, notamment de toute perte de données, indisponibilité temporaire du service, ou accès non autorisé à vos données malgré les mesures de sécurité mises en place.

ManaFlow ne saurait être tenu responsable de l'indisponibilité temporaire du site, que ce soit pour des raisons de maintenance, de panne technique ou de force majeure.`,
  },
  {
    titre: '7 — Liens hypertextes',
    contenu: `Le site manaflow.fr peut contenir des liens vers d'autres sites internet. ManaFlow n'exerce aucun contrôle sur ces sites tiers et décline toute responsabilité quant à leur contenu, leurs pratiques en matière de confidentialité ou leur disponibilité.

La création de liens hypertextes vers manaflow.fr est autorisée sous réserve que ces liens n'induisent pas en erreur sur la nature, les qualités ou les services proposés par ManaFlow, et qu'ils ne portent pas atteinte à son image.`,
  },
  {
    titre: '8 — Droit applicable et juridiction compétente',
    contenu: `Les présentes mentions légales sont régies par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut d'accord amiable, les tribunaux compétents de Paris seront seuls compétents.

Pour toute question ou réclamation : contact@manaflow.fr`,
  },
]

export default function MentionsLegalesPage() {
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

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
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
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Dernière mise à jour : mars 2026</span>
          </div>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Mentions<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Légales</span>
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Informations légales relatives à l&apos;éditeur et à l&apos;hébergement du site manaflow.fr.
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
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2026 ManaFlow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/cgu')} style={{ fontSize: 12 }}>CGU</span>
              <span className="nav-a" onClick={() => router.push('/confidentialite')} style={{ fontSize: 12 }}>Confidentialité</span>
              <span className="nav-a" style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>Mentions légales</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
