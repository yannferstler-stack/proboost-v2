'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

function formatPrix(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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
    nom: 'Starter', prixBase: 19.99, couleur: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', commission: '14%',
    description: 'Idéal pour les indépendants et petites structures',
    features: [
      { label: '10 factures / mois', ok: true, bold: false },
      { label: '3 relances par facture', ok: true, bold: false },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances email uniquement', ok: true, bold: false },
      { label: 'Historique des relances', ok: true, bold: false },
      { label: 'Délais personnalisables', ok: true, bold: false },
    ],
    popular: false, popularLabel: '',
  },
  {
    nom: 'Premium', prixBase: 49.99, couleur: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', commission: '12%',
    description: 'Pour les TPE avec un volume de factures régulier',
    features: [
      { label: '50 factures / mois', ok: true, bold: true },
      { label: '5 relances par facture', ok: true, bold: true },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances email uniquement', ok: true, bold: false },
      { label: 'Délais personnalisables', ok: true, bold: true },
      { label: 'Historique des relances', ok: true, bold: true },
    ],
    popular: false, popularLabel: '',
  },
  {
    nom: 'Pro', prixBase: 149.99, couleur: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', commission: '10%',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: [
      { label: "Jusqu'à 200 factures / mois", ok: true, bold: true },
      { label: '5 relances par facture', ok: true, bold: false },
      { label: 'Import CSV & PDF', ok: true, bold: false },
      { label: 'Dashboard complet', ok: true, bold: false },
      { label: 'Relances Email + SMS', ok: true, bold: true },
      { label: 'Délais personnalisables', ok: true, bold: false },
      { label: 'Historique des relances', ok: true, bold: false },
    ],
    popular: true, popularLabel: 'Notre choix préféré ✦',
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
  const [montantImpaye, setMontantImpaye] = useState(5000)
  const [inputStr, setInputStr] = useState('5 000')
  const [planManuel, setPlanManuel] = useState<string | null>(null)

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
    { n: '02', Icon: IconBolt, title: 'Manaflow relance', desc: "Nous prenons le relais. Les relances sont envoyées au nom de votre entreprise — au bon moment, avec le bon ton. Vos clients répondent directement à votre adresse email." },
    { n: '03', Icon: IconEuro, title: 'Vous encaissez', desc: "Vous récupérez votre argent. Nous prélevons une commission uniquement sur les fonds réellement recouvrés. Zéro risque, zéro avance." },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
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
        .plan-card { transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s; height: 100%; cursor: pointer; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 64px rgba(168,85,247,0.50) !important; border-color: rgba(168,85,247,0.45) !important; }
        .invoicing-card { transition: all 0.2s; cursor: pointer; }
        .invoicing-card:hover { border-color: rgba(168,85,247,0.40) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.15); }
        .step-number { font-family: Comfortaa, sans-serif; font-weight: 900; font-size: 52px; color: rgba(255,255,255,0.90); line-height: 1; letter-spacing: -2px; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: stretch; }
        .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 1000px; margin: 0 auto; align-items: stretch; }
        .carousel-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.8s ease-in-out; }
        .slide-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s; padding: 0; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; flex-direction: column; gap: 5px; }
          .mobile-only { display: flex !important; }
          .nav-brand-text { display: none !important; }
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
              <Image src="/logo.png" height={44} width={120} alt="Manaflow" style={{ width: 'auto', height: 44, objectFit: 'contain' }} />
              <span className="nav-brand-text" style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <a href="/blog" className="nav-a" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Blog</a>
              <a href="/comment-ca-marche" className="nav-a" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Comment ça marche ?</a>
              <a href="/nous-connaitre" className="nav-a" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Nous connaître</a>
              <a href="/#tarifs" className="nav-a" onClick={e => { e.preventDefault(); document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Tarifs</a>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Connexion
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-connexion mobile-only" onClick={() => router.push('/login')} style={{ fontSize: 13, padding: '8px 16px' }}>
                Connexion
              </button>
              <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                {menuOpen
                  ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                }
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '8px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Blog', href: '/blog' },
                { label: 'Comment ça marche ?', href: '/comment-ca-marche' },
                { label: 'Nous connaître', href: '/nous-connaitre' },
                { label: 'Tarifs', href: '/#tarifs' },
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
              <span style={{ display: 'block', fontFamily: 'Comfortaa', fontWeight: 400, fontSize: 'clamp(26px, 5vw, 58px)', color: 'white', letterSpacing: '-0.5px' }}>
                Concentrez-vous sur l&apos;essentiel,
              </span>
              <span style={{ display: 'block', fontFamily: 'Yeseva One', fontWeight: 700, fontSize: 'clamp(26px, 5vw, 58px)', color: 'white', letterSpacing: '-0.5px' }}>
                nous gérons vos impayés.
              </span>
            </h1>
            <p style={{ fontSize: isMobile ? 15 : 18, color: 'rgba(255,255,255,0.75)', marginBottom: 36, fontWeight: 300, textShadow: '0 1px 8px rgba(0,0,0,0.5)', maxWidth: 520 }}>
              Nous vous aidons à piloter votre trésorerie en toute simplicité.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', padding: isMobile ? '0 4px' : 0 }}>
              <button className="btn-primary" onClick={() => router.push('/souscrire')}>
                Essayer gratuitement — 14 jours
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
              { value: '+16', unit: '%', label: 'Augmentation des impayés pour les TPE et PME en 2025', color: '#ec4899' },
              { value: '75', unit: '%', label: 'Des créances récupérées grâce à une relance dans les 3 premiers mois', color: '#c084fc' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ padding: isMobile ? '32px 20px' : '40px 36px', borderRight: !isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 56 : 72, color: s.color, letterSpacing: '-3px', lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontFamily: 'Comfortaa', fontWeight: 700, fontSize: isMobile ? 22 : 28, color: s.color, opacity: 0.7 }}>{s.unit}</span>
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
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 28 : 44, color: 'white', letterSpacing: '-1px', textAlign: 'center' }}>3 étapes pour récupérer vos impayés.</h2>
              </div>
            </Reveal>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
              {steps.map((s, i) => (
                <Reveal key={i} delay={isMobile ? 0 : i * 0.1}>
                  <div className="step-card" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <span className="step-number" style={{ display: 'block', marginBottom: 20 }}>{s.n}</span>
                    <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, flex: 1 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section id="tarifs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Tarifs</span>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(29,185,84,0.15)', border: '1.5px solid rgba(29,185,84,0.4)', borderRadius: 16, padding: '12px 28px', boxShadow: '0 4px 20px rgba(29,185,84,0.20)' }}>
                    <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 30, color: '#4ade80', lineHeight: 1, letterSpacing: '-1px' }}>14 jours gratuits</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>0 € débité pendant 14 jours</span>
                  </div>
                </div>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 28 : 38, color: 'white', letterSpacing: '-1px', marginBottom: 8 }}>Simple et transparent.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
                  Abonnement mensuel fixe + commission uniquement sur les factures recouvrées.
                </p>
              </div>
            </Reveal>
            <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
              {PLANS.map((plan, i) => (
                <Reveal key={plan.nom} delay={isMobile ? 0 : i * 0.08}>
                  <div className="plan-card"
                    onClick={() => router.push(`/souscrire?plan=${plan.nom.toLowerCase()}`)}
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '32px 24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 20, minHeight: 220 }}>
                      <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 6 }}>{plan.nom}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5, minHeight: 40 }}>{plan.description}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 36, color: 'white' }}>0 €</span>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>/ 14 jours</span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>puis {formatPrix(plan.prixBase)}€/mois</span>
                      </div>
                      <div style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                          <span style={{ fontSize: 13, color: plan.couleur, fontWeight: 700, letterSpacing: '-0.3px', flexShrink: 0 }}>{plan.commission}</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 400, whiteSpace: 'nowrap' }}>au succès</span>
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', fontWeight: 400, display: 'block', marginTop: 4 }}>tout compris — frais bancaires inclus · min. 5 €</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, flex: 1, marginBottom: 20 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.ok ? plan.bg : 'rgba(255,255,255,0.04)', border: f.ok ? `1px solid ${plan.border}` : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: f.ok ? plan.couleur : 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{f.ok ? '✓' : '✗'}</span>
                          </div>
                          <span style={{ fontSize: 13, color: f.ok ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', background: plan.bg, border: `1.5px solid ${plan.border}`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: plan.couleur }}>Commencer gratuitement →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SIMULATEUR ROI */}
        {(() => {
          const montant = Math.max(0, Math.min(1000000, montantImpaye))
          const planAuto = montant <= 5000 ? PLANS[0] : montant <= 25000 ? PLANS[1] : PLANS[2]
          const planActif = planManuel ? PLANS.find(p => p.nom === planManuel) || planAuto : planAuto
          const tauxCommission = parseFloat(planActif.commission) / 100
          const gainBrut = montant * 0.75
          const commission = gainBrut * tauxCommission
          const gainNet = gainBrut - commission - planActif.prixBase
          const roi = planActif.prixBase > 0 ? Math.round(gainNet / planActif.prixBase) : 0
          return (
            <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ maxWidth: 680, margin: '0 auto' }}>
                <Reveal>
                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'block', marginBottom: 10 }}>Simulateur</span>
                    <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 22 : 28, color: 'white', letterSpacing: '-0.5px', marginBottom: 6 }}>Combien allez-vous récupérer ?</h2>
                  </div>
                </Reveal>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: isMobile ? '20px 16px' : '28px 32px', backdropFilter: 'blur(12px)' }}>
                  {/* INPUT */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                      <div style={{ position: 'relative' as const, flex: 1, minWidth: 160 }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Ex : 5 000"
                          value={inputStr}
                          onChange={e => {
                            const raw = e.target.value.replace(/\s/g, '')
                            setInputStr(e.target.value)
                            const num = parseInt(raw, 10)
                            if (!isNaN(num)) setMontantImpaye(Math.min(1000000, num))
                            else if (raw === '' || raw === '0') setMontantImpaye(0)
                          }}
                          onBlur={() => {
                            const clamped = Math.max(0, Math.min(1000000, montantImpaye))
                            setMontantImpaye(clamped)
                            setInputStr(clamped > 0 ? clamped.toLocaleString('fr-FR') : '')
                          }}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(168,85,247,0.35)', borderRadius: 10, padding: '10px 40px 10px 14px', fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Comfortaa, sans-serif', outline: 'none' }}
                        />
                        <span style={{ position: 'absolute' as const, right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>€</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', whiteSpace: 'nowrap' as const }}>d&apos;impayés</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1000000}
                      step={500}
                      value={montantImpaye}
                      onChange={e => {
                        const v = Number(e.target.value)
                        setMontantImpaye(v)
                        setInputStr(v > 0 ? v.toLocaleString('fr-FR') : '')
                      }}
                      style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
                    />
                  </div>

                  {/* PLAN SELECTOR */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                        Plan {planManuel ? '· sélection manuelle' : '· sélection automatique'}
                      </p>
                      {planManuel && (
                        <button onClick={() => setPlanManuel(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', padding: 0 }}>
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {PLANS.map(p => {
                        const isAuto = !planManuel && p.nom === planAuto.nom
                        const isSelected = planManuel === p.nom || isAuto
                        return (
                          <button key={p.nom} onClick={() => setPlanManuel(planManuel === p.nom ? null : p.nom)}
                            style={{ flex: 1, background: isSelected ? p.bg : 'transparent', border: `1.5px solid ${isSelected ? p.border : 'rgba(255,255,255,0.10)'}`, borderRadius: 8, padding: '7px 4px', cursor: 'pointer', transition: 'all 0.15s' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? p.couleur : 'rgba(255,255,255,0.50)', display: 'block' }}>{p.nom}</span>
                            <span style={{ fontSize: 9, color: isAuto ? 'rgba(255,255,255,0.40)' : 'transparent', display: 'block' }}>auto</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* RÉSULTATS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: `Net perçu après commission (${planActif.commission})`, value: `${(gainBrut - commission).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, color: 'rgba(255,255,255,0.85)' },
                      { label: `Abonnement ${planActif.nom}`, value: `−${formatPrix(planActif.prixBase)} €/mois`, color: 'rgba(255,255,255,0.45)' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>{item.label}</p>
                        <p style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 15, color: item.color, letterSpacing: '-0.3px' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* GAIN NET */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(29,185,84,0.12), rgba(74,222,128,0.07))', border: '1.5px solid rgba(29,185,84,0.30)', borderRadius: 12, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Gain net estimé</p>
                      <p style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 24 : 30, color: gainNet >= 0 ? '#4ade80' : '#fca5a5', letterSpacing: '-0.5px' }}>
                        {gainNet >= 0 ? '+' : ''}{gainNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                      </p>
                    </div>
                    {roi > 0 && (
                      <div style={{ textAlign: 'right' as const }}>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>ROI</p>
                        <p style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 22 : 28, color: '#4ade80', letterSpacing: '-0.5px' }}>{roi}x</p>
                      </div>
                    )}
                  </div>

                  <button className="btn-primary" onClick={() => router.push(`/souscrire?plan=${planActif.nom.toLowerCase()}`)} style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px' }}>
                    Essayer gratuitement — plan {planActif.nom} →
                  </button>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', textAlign: 'center' as const, marginTop: 8 }}>
                    Simulation sur taux de recouvrement moyen de 75 %. Commission tout compris (frais bancaires inclus), minimum 5 €/facture. Résultats indicatifs.
                  </p>
                </div>
              </div>
            </section>
          )
        })()}

        {/* FAQ */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}>
                <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, display: 'block', marginBottom: 12 }}>FAQ</span>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 26 : 36, color: 'white', letterSpacing: '-1px' }}>Questions fréquentes</h2>
              </div>
            </Reveal>
            {[
              {
                q: 'Les relances partent-elles en mon nom ?',
                a: "Vos relances sont envoyées au nom de votre entreprise — vos clients voient votre raison sociale comme expéditeur. Les réponses arrivent directement dans votre boîte email. Un discret « via Manaflow » apparaît dans le champ expéditeur pour assurer la délivrabilité technique.",
              },
              {
                q: 'Quand est prélevée la commission ?',
                a: "La commission n'est prélevée que lorsqu'une facture est effectivement réglée via Manaflow. Si votre client ne paie pas, vous ne payez rien de plus que votre abonnement mensuel. Zéro risque.",
              },
              {
                q: 'Pourquoi y a-t-il un minimum de 5 € de commission ?',
                a: "Le minimum de 5 € par facture recouvrée est appliqué pour éviter de traiter des factures de très faible montant dont le coût de traitement serait supérieur au bénéfice. Il s'applique uniquement lorsque la commission calculée serait inférieure à 5 €.",
              },
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui. Aucun engagement, aucune pénalité. Vous pouvez annuler votre abonnement depuis votre dashboard à n'importe quel moment. L'accès reste actif jusqu'à la fin de la période en cours.",
              },
              {
                q: "Que se passe-t-il si une facture n'est pas recouvrée ?",
                a: "Vous ne payez que votre abonnement mensuel. Aucune commission n'est due sur les factures non recouvrées. Manaflow a donc tout intérêt à vous aider à récupérer vos impayés.",
              },
              {
                q: "Quels formats de factures acceptez-vous ?",
                a: "Vous pouvez importer vos factures en CSV ou en PDF. Notre système détecte automatiquement les informations clés (montant, échéance, email client) — sans saisie manuelle de votre part.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={0}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 0' }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 8, lineHeight: 1.5 }}>{item.q}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75 }}>{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 20 }}>Notre engagement</p>
              <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 48px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 16 }}>
                Vous n&apos;aurez plus à courir{' '}
                <span style={{ whiteSpace: 'nowrap' }}>après <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>le temps</span></span>
                {' '}et <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>l&apos;argent.</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.50)', marginBottom: 32 }}>
                Nous serons votre allié pour la gestion de vos impayés.
              </p>
              <button className="btn-primary" onClick={() => router.push('/souscrire')} style={{ fontSize: 15, padding: '14px 32px' }}>
                Commencer gratuitement — 14 jours d&apos;essai →
              </button>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>0 € pendant 14 jours · Annulable avant la fin de l&apos;essai</p>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px' }}>
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Image src="/logo.png" height={44} width={120} alt="Manaflow" style={{ width: 'auto', height: 44, objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2026 Manaflow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/mentions-legales')} style={{ fontSize: 12, cursor: 'pointer' }}>Mentions légales</span>
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
