'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CommentCaMarchePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const faqs = [
    {
      q: 'Je connais bien mes clients — est-ce que ManaFlow va abîmer la relation ?',
      r: 'Non. Nos relances sont pensées pour rester dans le registre amiable et professionnel. Le ton est adapté, jamais agressif. L\'objectif est de récupérer l\'argent sans jamais compromettre la relation humaine que vous avez construite avec vos clients.',
    },
    {
      q: 'Je suis artisan ou indépendant — est-ce que c\'est fait pour moi ?',
      r: 'Absolument. ManaFlow a été conçu pour les TPE, artisans, et indépendants. Vous importez vos factures en quelques clics (CSV ou PDF), et on s\'occupe du reste. Pas besoin de compétences techniques.',
    },
    {
      q: 'Comment fonctionne la commission ?',
      r: 'La commission est prélevée uniquement sur les factures effectivement recouvrées. Si rien n\'est récupéré, vous ne payez rien en plus de votre abonnement mensuel. Notre intérêt est donc directement aligné avec le vôtre.',
    },
    {
      q: 'Que se passe-t-il si une facture date de plusieurs mois ?',
      r: 'Plus une facture est ancienne, plus elle est difficile à récupérer — mais pas impossible. ManaFlow calcule automatiquement la première relance en fonction de la date d\'échéance, même si celle-ci est déjà dépassée.',
    },
    {
      q: 'Quels formats de fichiers puis-je importer ?',
      r: 'ManaFlow accepte les fichiers CSV et les PDF. Pour les PDF, notre IA extrait automatiquement les informations : nom du client, montant, date d\'échéance. Vous n\'avez rien à ressaisir.',
    },
    {
      q: 'La facturation électronique va-t-elle changer quelque chose pour moi ?',
      r: 'Oui. À partir de septembre 2026, toutes les entreprises françaises devront émettre et recevoir des factures électroniques dans un format structuré. Bien gérer ses factures dès maintenant, c\'est anticiper cette obligation et avoir de meilleures habitudes de trésorerie.',
    },
    {
      q: 'Puis-je personnaliser la séquence de relances ?',
      r: 'Oui, à partir du plan Premium. Vous choisissez les délais entre chaque relance (J+7, J+15, J+30…) et le canal utilisé. Le plan Pro ajoute les relances par SMS en plus de l\'email.',
    },
    {
      q: 'Mes données sont-elles sécurisées ?',
      r: 'Toutes vos données sont chiffrées et hébergées en Europe. Nous ne partageons jamais vos informations avec des tiers. Vous restez propriétaire de vos données à tout moment.',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .faq-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; }
        .faq-card:hover { border-color: rgba(168,85,247,0.35) !important; box-shadow: 0 4px 24px rgba(168,85,247,0.12) !important; }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 36px; font-size: 15px; box-shadow: 0 4px 24px rgba(168,85,247,0.40); display: inline-flex; align-items: center; justify-content: center; }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
          .btn-cta { width: 100%; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
            </div>
            <div className="nav-links">
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14, fontWeight: 500 }}>Accueil</span>
              <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14, fontWeight: 500 }}>Blog</span>
              <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>Comment ça marche ?</span>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '8px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[{ label: 'Accueil', href: '/' }, { label: 'Blog', href: '/blog' }, { label: 'Nous connaître', href: '/nous-connaitre' }].map(item => (
                <button key={item.label} onClick={() => { router.push(item.href); setMenuOpen(false) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.80)', fontSize: 15, fontWeight: 500, padding: '12px 8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', borderRadius: 8 }}>
                  {item.label}
                </button>
              ))}
              <button className="btn-connexion" onClick={() => { router.push('/login'); setMenuOpen(false) }} style={{ marginTop: 8, justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
          )}
        </nav>

        {/* HEADER — sans badge "Guide complet" */}
        <div style={{ textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '72px 20px 48px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 60px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Tout savoir sur<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ManaFlow</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.50)', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Une vidéo et vos questions — tout ce qu&apos;il faut pour se lancer.
          </p>
        </div>

        {/* VIDÉO */}
        <section style={{ padding: isMobile ? '0 20px 56px' : '0 40px 80px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>01 — Vidéo explicative</span>
            <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 22 : 28, color: 'white', letterSpacing: '-0.5px', marginTop: 8 }}>Voyez ManaFlow en action</h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 20, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 24px rgba(168,85,247,0.45)' }}>
              <span style={{ fontSize: 22, marginLeft: 4 }}>▶</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: 13 }}>Vidéo de présentation — à venir</p>
          </div>
        </section>

        {/* Q&A — questions retravaillées */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '56px 20px' : '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>02 — Questions & Réponses</span>
              <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 22 : 28, color: 'white', letterSpacing: '-0.5px', marginTop: 8 }}>Vos questions, nos réponses</h2>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {faqs.map((faq, i) => (
                <div key={i} className="faq-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: isMobile ? '18px 20px' : '22px 26px' }}>
                  <p style={{ fontFamily: 'Comfortaa', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 8 }}>{faq.q}</p>
                  <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.7 }}>{faq.r}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '56px 20px' : '80px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 }}>Prêt à démarrer ?</p>
          <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 28 : 36, color: 'white', letterSpacing: '-1px', marginBottom: 14, lineHeight: 1.2 }}>
            Récupérez vos impayés<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dès aujourd&apos;hui.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, marginBottom: 28 }}>Commission uniquement sur les factures recouvrées.</p>
          <button className="btn-cta" onClick={() => router.push('/souscrire')} style={{ width: isMobile ? '100%' : 'auto' }}>
            Souscrire un abonnement →
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2025 ManaFlow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/cgu')} style={{ fontSize: 12, cursor: 'pointer' }}>CGU</span>
              <span className="nav-a" onClick={() => router.push('/confidentialite')} style={{ fontSize: 12, cursor: 'pointer' }}>Confidentialité</span>
              <span className="nav-a" onClick={() => router.push('/contact')} style={{ fontSize: 12, cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
