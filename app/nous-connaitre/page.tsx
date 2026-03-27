'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function NousConnaitrePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 36px; font-size: 15px; box-shadow: 0 4px 24px rgba(168,85,247,0.40); display: inline-flex; align-items: center; justify-content: center; }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .profile-card { transition: all 0.2s; }
        .profile-card:hover { transform: translateY(-4px); }
        .value-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); }
        .value-card:hover { border-color: rgba(168,85,247,0.35); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.12); }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .profiles-grid { grid-template-columns: 1fr !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
          .btn-cta { width: 100%; }
          .mission-br { display: none; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image src="/logo.png" height={44} width={120} alt="ManaFlow" style={{ width: 'auto', height: 44, objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <div className="nav-links">
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14 }}>Accueil</span>
              <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14 }}>Blog</span>
              <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14 }}>Comment ça marche ?</span>
              <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>Nous connaître</span>
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
              {[{ label: 'Accueil', href: '/' }, { label: 'Blog', href: '/blog' }, { label: 'Comment ça marche ?', href: '/comment-ca-marche' }].map(item => (
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

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: isMobile ? '48px 20px 40px' : '80px 20px 64px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Notre histoire</span>
          </div>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 60px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Nés d&apos;un paradoxe,<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>construits pour vous.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.50)', maxWidth: 520, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Deux parcours, une conviction commune : les TPE méritent des outils aussi puissants que ceux des grandes entreprises.
          </p>
        </div>

        {/* PROFILES */}
        <section style={{ padding: isMobile ? '0 20px 56px' : '0 40px 80px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 20 : 28 }}>

            <div className="profile-card" style={{ background: 'rgba(168,85,247,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 24, padding: isMobile ? '28px 24px' : '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(168,85,247,0.40)' }}>
                  <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 22, color: 'white' }}>Y</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 18, color: 'white', marginBottom: 4 }}>Yann</h3>
                  <span style={{ fontSize: 11, background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>Finance · 10 ans d&apos;expérience</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, fontWeight: 300 }}>
                Yann a passé dix ans dans la finance. Il y a vu de grandes entreprises développer des modèles économiques extrêmement complexes et des entrepreneurs bâtir de véritables succès. Mais il a aussi observé un paradoxe étonnant : les impayés sont presque toujours procrastinés. La solution est souvent simple, mais personne n'a vraiment envie de s'en occuper.
              </p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  « Alors une idée est née : utiliser l'intelligence artificielle pour créer un outil simple et efficace, capable de gérer ces relances sans friction. »
                </p>
              </div>
            </div>

            <div className="profile-card" style={{ background: 'rgba(236,72,153,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(236,72,153,0.20)', borderRadius: 24, padding: isMobile ? '28px 24px' : '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #ec4899, #be185d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(236,72,153,0.40)' }}>
                  <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 22, color: 'white' }}>A</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 18, color: 'white', marginBottom: 4 }}>Anne-Sophie</h3>
                  <span style={{ fontSize: 11, background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>Marketing & Communication · 15 ans</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, fontWeight: 300 }}>
                Anne-Sophie travaille dans le marketing et la communication depuis près de quinze ans. Fille de tapissier décorateur, elle se souvient avoir aidé son père à faire ses factures sur Word lorsque les ordinateurs sont arrivés dans les foyers. Très tôt, elle a constaté l'approximation qui peut exister chez certains artisans dès qu'il s'agit d'administratif ou de relances.
              </p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  « La relation client est précieuse et ne doit jamais être abîmée, car elle est souvent la clé de la pérennité d'une entreprise. »
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '56px 20px' : '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 18 }}>Notre mission</span>
            <h2 style={{ fontFamily: 'Yeseva One', fontWeight: 700, fontSize: 'clamp(22px, 4vw, 44px)', color: 'white', lineHeight: 1.3, marginBottom: 24, letterSpacing: '-0.5px' }}>
              Contribuer, à notre échelle,<br className="mission-br"/>à faire vivre l&apos;économie française.
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontWeight: 300, maxWidth: 560, margin: '0 auto' }}>
              Aider les TPE à mieux gérer leur trésorerie pour leur permettre de se développer et de se pérenniser.
            </p>
          </div>
        </section>

        {/* VALEURS */}
        <section style={{ padding: isMobile ? '0 20px 56px' : '0 40px 80px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 20 }}>
              {[
                { icon: '⚡', titre: 'Simplicité', texte: 'Un outil pensé pour des entrepreneurs, pas pour des équipes IT. Tout est automatisé, tout est intuitif.' },
                { icon: '🤝', titre: 'Relation client préservée', texte: 'Nos relances sont conçues pour récupérer l\'argent sans jamais abîmer la relation humaine qui a pris des années à construire.' },
                { icon: '🎯', titre: 'Alignement d\'intérêts', texte: 'Nous sommes rémunérés uniquement sur les fonds récupérés. Votre succès est littéralement le nôtre.' },
              ].map((v, i) => (
                <div key={i} className="value-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 18, padding: isMobile ? '24px 20px' : '32px 28px' }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 8 }}>{v.titre}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75 }}>{v.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '48px 20px' : '60px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 0 }}>
              {[
                { value: '75%', label: 'des créances récupérées avec des relances dans les 3 premiers mois', color: '#a855f7' },
                { value: '42j', label: 'de retard moyen de paiement chez les TPE en France', color: '#ec4899' },
                { value: '100%', label: 'alignés sur votre succès — aucun frais sans résultat', color: '#c084fc' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: isMobile ? '28px 20px' : '20px 36px', borderRight: !isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <p style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 40 : 48, color: s.color, letterSpacing: '-2px', marginBottom: 8 }}>{s.value}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, maxWidth: 180, margin: '0 auto' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '56px 20px' : '80px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 }}>Rejoignez-nous</p>
          <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 26 : 36, color: 'white', letterSpacing: '-1px', marginBottom: 14 }}>
            Prêt à nous faire confiance ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Rejoignez les entrepreneurs qui ont décidé de se concentrer sur leur métier et de nous confier leurs impayés.
          </p>
          <button className="btn-cta" onClick={() => router.push('/souscrire')} style={{ width: isMobile ? '100%' : 'auto' }}>
            Commencer gratuitement — 14 jours d&apos;essai →
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image src="/logo.png" height={44} width={120} alt="ManaFlow" style={{ width: 'auto', height: 44, objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2026 ManaFlow — Tous droits réservés</p>
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
