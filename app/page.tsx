'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`, height: '100%' }}>
      {children}
    </div>
  )
}

const CAROUSEL_IMAGES = [
  '/carousel/img1.jpg',
  '/carousel/img2.jpg',
  '/carousel/img3.jpg',
  '/carousel/img4.jpg',
  '/carousel/img5.jpg',
]

const PLANS = [
  {
    nom: 'Starter', prix: '19,99', couleur: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', commission: '14%',
    description: 'Idéal pour les indépendants et petites structures',
    features: [
      { label: '10 factures / mois', ok: true, bold: false },
      { label: '3 relances par facture', ok: true, bold: false },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances email uniquement', ok: true, bold: false },
      { label: 'Délais personnalisables', ok: false, bold: false },
      { label: 'Historique des relances', ok: false, bold: false },
      { label: 'Support prioritaire', ok: false, bold: false },
    ],
    popular: false, popularLabel: '',
  },
  {
    nom: 'Premium', prix: '49,99', couleur: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', commission: '12%',
    description: 'Pour les TPE avec un volume de factures régulier',
    features: [
      { label: '50 factures / mois', ok: true, bold: true },
      { label: '5 relances par facture', ok: true, bold: true },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances email uniquement', ok: true, bold: false },
      { label: 'Délais personnalisables', ok: true, bold: true },
      { label: 'Historique des relances', ok: true, bold: true },
      { label: 'Support prioritaire', ok: false, bold: false },
    ],
    popular: false, popularLabel: '',
  },
  {
    nom: 'Pro', prix: '149,99', couleur: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', commission: '10%',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: [
      { label: "Jusqu'à 200 factures / mois", ok: true, bold: true },
      { label: '5 relances par facture', ok: true, bold: false },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances Email + SMS', ok: true, bold: true },
      { label: 'Délais personnalisables', ok: true, bold: false },
      { label: 'Historique des relances', ok: true, bold: false },
      { label: 'Support prioritaire', ok: true, bold: true },
    ],
    popular: true, popularLabel: 'Recommandé pour les PME',
  },
]

function IconImport() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
}
function IconBolt() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
}
function IconEuro() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M4 14h12M19.5 6.5A7.5 7.5 0 1 0 19.5 17.5" /></svg>
}

export default function Home() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % CAROUSEL_IMAGES.length)
        setTransitioning(false)
      }, 800)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    { n: '01', Icon: IconImport, title: 'Importez', desc: "Importez vos factures en CSV ou PDF. Toutes les informations sont détectées et organisées automatiquement — vous n'avez rien à saisir." },
    { n: '02', Icon: IconBolt, title: 'ManaFlow relance', desc: "Nous prenons le relais. Relances email et SMS automatiques, au bon moment, avec le bon ton — sans que vous ayez à intervenir." },
    { n: '03', Icon: IconEuro, title: 'Vous encaissez', desc: "Vous récupérez votre argent. Nous prélevons une commission uniquement sur les fonds réellement recouvrés. Zéro risque, zéro avance." },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0d0620; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .btn-primary { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter, sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 32px; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 24px rgba(168,85,247,0.45); white-space: nowrap; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .btn-secondary { background: rgba(255,255,255,0.12); color: white; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 14px; padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: Inter, sans-serif; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap; backdrop-filter: blur(8px); }
        .btn-secondary:hover { border-color: rgba(168,85,247,0.6); background: rgba(168,85,247,0.15); transform: translateY(-1px); }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter, sans-serif; font-weight: 600; transition: all 0.2s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.7); }
        .nav-a:hover { color: #c084fc !important; }
        .step-card { transition: box-shadow 0.2s, transform 0.2s; height: 100%; }
        .step-card:hover { box-shadow: 0 8px 32px rgba(168,85,247,0.15) !important; transform: translateY(-2px); }
        .plan-card { transition: box-shadow 0.2s, transform 0.2s; height: 100%; cursor: pointer; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(168,85,247,0.20) !important; }
        .invoicing-card { transition: all 0.2s; cursor: pointer; }
        .invoicing-card:hover { border-color: rgba(168,85,247,0.40) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.15); }
        .step-number { font-family: Manrope, sans-serif; font-weight: 900; font-size: 48px; color: rgba(255,255,255,0.05); line-height: 1; letter-spacing: -2px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: stretch; }
        .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 1000px; margin: 0 auto; align-items: stretch; }
        .carousel-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.8s ease-in-out; }
        .slide-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s; padding: 0; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; flex-direction: column; gap: 5px; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
          .invoicing-lire { display: none !important; }
        }
        @media (max-width: 480px) {
          .btn-primary { padding: 11px 20px !important; font-size: 13px !important; width: auto; }
          .btn-secondary { padding: 10px 16px !important; font-size: 13px !important; width: auto; }
          .hero-buttons { flex-direction: column !important; align-items: center; width: auto; gap: 8px !important; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: '#0d0620' }}>

        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
          background: scrollY > 20 || menuOpen ? 'rgba(13,6,32,0.95)' : 'transparent',
          backdropFilter: scrollY > 20 || menuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.3s',
        }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}>Mana</span><span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700 }}>flow</span></span>
            </div>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14, fontWeight: 500 }}>Blog</span>
              <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14, fontWeight: 500 }}>Comment ça marche ?</span>
              <span className="nav-a" onClick={() => router.push('/nous-connaitre')} style={{ fontSize: 14, fontWeight: 500 }}>Nous connaître</span>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Connexion
              </button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              }
            </button>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '8px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Blog', href: '/blog' },
                { label: 'Comment ça marche ?', href: '/comment-ca-marche' },
                { label: 'Nous connaître', href: '/nous-connaitre' },
              ].map(item => (
                <button key={item.label} onClick={() => { router.push(item.href); setMenuOpen(false) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.80)', fontSize: 15, fontWeight: 500, padding: '12px 8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', borderRadius: 8 }}>
                  {item.label}
                </button>
              ))}
              <button className="btn-connexion" onClick={() => { router.push('/login'); setMenuOpen(false) }} style={{ marginTop: 8, justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Connexion
              </button>
            </div>
          )}
        </nav>

        {/* HERO CAROUSEL */}
        <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {CAROUSEL_IMAGES.map((img, i) => (
            <img key={i} src={img} alt="" className="carousel-img"
              style={{ opacity: i === currentSlide ? (transitioning ? 0 : 1) : 0 }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,6,32,0.60)', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,6,32,0.3) 0%, transparent 40%, rgba(13,6,32,0.6) 100%)', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: isMobile ? '80px 20px 60px' : '0 24px', maxWidth: 900, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ marginBottom: 20, textShadow: '0 2px 24px rgba(0,0,0,0.6)', lineHeight: 1.1 }}>
              <span style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 400, fontSize: 'clamp(26px, 5vw, 58px)', color: 'white', letterSpacing: '-0.5px' }}>
                Concentrez-vous sur l&apos;essentiel,
              </span>
              <span style={{ display: 'block', fontFamily: 'Playfair Display', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(26px, 5vw, 58px)', color: 'white', letterSpacing: '-0.5px' }}>
                nous gérons vos impayés.
              </span>
            </h1>
            <p style={{ fontSize: isMobile ? 15 : 18, color: 'rgba(255,255,255,0.75)', marginBottom: 36, fontWeight: 300, textShadow: '0 1px 8px rgba(0,0,0,0.5)', maxWidth: 520 }}>
              Nous vous aidons à piloter votre trésorerie en toute simplicité.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', padding: isMobile ? '0 4px' : 0 }}>
              <button className="btn-primary" onClick={() => router.push('/souscrire')}>
                Souscrire un abonnement
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
              <button className="btn-secondary" onClick={() => router.push('/comment-ca-marche')}>
                Comment ça marche ?
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: 8 }}>
            {CAROUSEL_IMAGES.map((_, i) => (
              <button key={i} className="slide-dot" onClick={() => setCurrentSlide(i)}
                style={{ background: i === currentSlide ? '#a855f7' : 'rgba(255,255,255,0.35)', width: i === currentSlide ? 24 : 8, borderRadius: i === currentSlide ? 4 : '50%' }} />
            ))}
          </div>
        </section>

        {/* STATS */}
        <section style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '48px 20px' : '80px 40px' }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 48 }}>
              La réalité des impayés en France
            </p>
          </Reveal>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 0, maxWidth: 960, margin: '0 auto' }}>
            {[
              { value: '42', unit: 'jours', label: 'Retard moyen de paiement des TPE', color: '#a855f7' },
              { value: '+16', unit: '%', label: 'Augmentation des impayés pour les TPE et PME en 2024', color: '#ec4899' },
              { value: '80', unit: '%', label: 'Des fonds récupérés grâce à une relance efficace', color: '#c084fc' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ padding: isMobile ? '32px 20px' : '40px 36px', borderRight: !isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: isMobile ? 56 : 72, color: s.color, letterSpacing: '-3px', lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: isMobile ? 22 : 28, color: s.color, opacity: 0.7 }}>{s.unit}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ENCART E-INVOICING */}
        <section style={{ padding: isMobile ? '32px 20px 0' : '48px 40px 0' }}>
          <Reveal>
            <div className="invoicing-card" onClick={() => router.push('/blog')}
              style={{ maxWidth: 960, margin: '0 auto', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 20, padding: isMobile ? '20px' : '28px 36px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>SEPTEMBRE 2026</span>
                  <span style={{ fontSize: 13, color: '#c084fc', fontWeight: 600 }}>Facturation électronique obligatoire</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                  La réforme e-invoicing va changer la façon dont toutes les entreprises émettent et reçoivent leurs factures. TPE, PME : anticipez dès maintenant.
                </p>
                {isMobile && <p style={{ fontSize: 13, color: '#a855f7', fontWeight: 600, marginTop: 10 }}>Lire l&apos;article →</p>}
              </div>
              {!isMobile && (
                <div className="invoicing-lire" style={{ flexShrink: 0, color: '#a855f7', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Lire l&apos;article →
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* 3 ETAPES */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <Reveal>
              <div style={{ marginBottom: isMobile ? 40 : 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: isMobile ? 28 : 44, color: 'white', letterSpacing: '-1px', textAlign: 'center' }}>3 étapes pour récupérer vos impayés.</h2>
              </div>
            </Reveal>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
              {steps.map((s, i) => (
                <Reveal key={i} delay={isMobile ? 0 : i * 0.1}>
                  <div className="step-card" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'absolute', top: 16, right: 20 }}>
                      <span className="step-number">{s.n}</span>
                    </div>
                    <div style={{ width: 52, height: 52, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
                      <s.Icon />
                    </div>
                    <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, flex: 1 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tarifs</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: isMobile ? 28 : 38, color: 'white', letterSpacing: '-1px', marginBottom: 16 }}>Simple et transparent.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
                  Vous n&apos;aurez plus à courir après le temps et l&apos;argent. Nous serons votre allié pour la gestion de vos impayés.
                </p>
              </div>
            </Reveal>
            <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
              {PLANS.map((plan, i) => (
                <Reveal key={plan.nom} delay={isMobile ? 0 : i * 0.08}>
                  <div className="plan-card"
                    onClick={() => router.push(`/souscrire?plan=${plan.nom.toLowerCase()}`)}
                    style={{ background: plan.popular ? 'rgba(168,85,247,0.10)' : 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '32px 24px', border: plan.popular ? '1.5px solid rgba(168,85,247,0.40)' : '1px solid rgba(255,255,255,0.08)', boxShadow: plan.popular ? '0 8px 40px rgba(168,85,247,0.20)' : 'none', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {plan.popularLabel}
                      </div>
                    )}
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 6 }}>{plan.nom}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>{plan.description}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 36, color: 'white' }}>{plan.prix} €</span>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>/mois</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '5px 12px' }}>
                        <span style={{ fontSize: 12, color: plan.couleur, fontWeight: 600 }}>{plan.commission} prélevé sur chaque facture recouvrée</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, flex: 1, marginBottom: 20 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.ok ? plan.bg : 'rgba(255,255,255,0.04)', border: f.ok ? `1px solid ${plan.border}` : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: f.ok ? plan.couleur : 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{f.ok ? '✓' : '✗'}</span>
                          </div>
                          <span style={{ fontSize: 13, color: f.ok ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', fontWeight: f.bold ? 700 : 400 }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', background: plan.popular ? 'linear-gradient(135deg, #a855f7, #ec4899)' : plan.bg, border: plan.popular ? 'none' : `1.5px solid ${plan.border}`, borderRadius: 12, padding: '12px', textAlign: 'center', boxShadow: plan.popular ? '0 4px 20px rgba(168,85,247,0.35)' : 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: plan.popular ? 'white' : plan.couleur }}>Choisir {plan.nom} →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 20 }}>Notre engagement</p>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 48px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 20 }}>
                Vous n&apos;aurez plus à courir après{!isMobile && <br />}
                {' '}<span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>le temps et l&apos;argent.</span>
              </h2>
              <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontWeight: 300, maxWidth: 480, margin: '0 auto 32px' }}>
                Nous serons votre allié pour la gestion de vos impayés et serons rémunérés uniquement sur les fonds récupérés.
              </p>
              <button className="btn-primary" onClick={() => router.push('/souscrire')} style={{ fontSize: 15, padding: '14px 32px' }}>
                Souscrire maintenant
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px' }}>
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}>Mana</span><span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700 }}>flow</span></span>
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
