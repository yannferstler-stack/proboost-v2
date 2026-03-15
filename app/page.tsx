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

const PLANS = [
  {
    nom: 'Starter', prix: '19,99', couleur: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', commission: '14%',
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
    nom: 'Premium', prix: '49,99', couleur: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', commission: '12%',
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
    nom: 'Pro', prix: '149,99', couleur: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', commission: '10%',
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
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function IconBolt() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function IconEuro() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M4 14h12M19.5 6.5A7.5 7.5 0 1 0 19.5 17.5"/>
    </svg>
  )
}

export default function Home() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const steps = [
    { n: '01', Icon: IconImport, title: 'Importez', desc: "Importez vos factures en CSV ou PDF. Toutes les informations sont détectées et organisées automatiquement — vous n'avez rien à saisir." },
    { n: '02', Icon: IconBolt, title: 'ProBoost relance', desc: "Nous prenons le relais. Relances email et SMS automatiques, au bon moment, avec le bon ton — sans que vous ayez à intervenir." },
    { n: '03', Icon: IconEuro, title: 'Vous encaissez', desc: "Vous récupérez votre argent. Nous prélevons une commission uniquement sur les fonds réellement recouvrés. Zéro risque, zéro avance." },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #fff; }
        .btn-connexion {
          background: linear-gradient(135deg, #1DB954, #15a347);
          color: white; border: none; cursor: pointer;
          font-family: Inter, sans-serif; font-weight: 600;
          transition: all 0.2s; border-radius: 12px;
          padding: 10px 22px; font-size: 14px;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 12px rgba(29,185,84,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: 0.2px;
        }
        .btn-connexion:hover {
          background: linear-gradient(135deg, #22d160, #1DB954) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(29,185,84,0.45) !important;
        }
        .btn-hero-primary {
          background: linear-gradient(135deg, #1DB954, #15a347);
          color: white; border: none; cursor: pointer;
          font-family: Inter, sans-serif; font-weight: 700;
          transition: all 0.2s; border-radius: 14px;
          padding: 14px 32px; font-size: 15px;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(29,185,84,0.40);
          white-space: nowrap;
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(29,185,84,0.50) !important; }
        .btn-hero-secondary {
          background: transparent; color: #374151;
          border: 1.5px solid #e5e7eb; border-radius: 14px;
          padding: 14px 28px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: Inter, sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .btn-hero-secondary:hover { border-color: #9CA3AF; background: #F9FAFB; transform: translateY(-1px); }
        .nav-a:hover { color: #1DB954 !important; }
        .nav-a { transition: color 0.15s; cursor: pointer; }
        .stat-card { transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-4px); }
        .step-card { transition: box-shadow 0.2s, transform 0.2s; height: 100%; }
        .step-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
        .plan-card { transition: box-shadow 0.2s, transform 0.2s; height: 100%; cursor: pointer; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.10) !important; }
        .step-number { font-family: Manrope, sans-serif; font-weight: 900; font-size: 48px; color: #f0f0f0; line-height: 1; letter-spacing: -2px; transition: color 0.2s; }
        .step-card:hover .step-number { color: #e8fef0; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: stretch; }
        .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 1000px; margin: 0 auto; align-items: stretch; }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff' }}>

        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
          height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', overflow: 'visible',
          background: scrollY > 20 ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(14px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid #f0f0f0' : 'none',
          transition: 'all 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: '#111' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Comment ça marche ?</span>
            <button className="btn-connexion" onClick={() => router.push('/login')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Connexion
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(42px, 6vw, 76px)', color: '#0a0a0a', letterSpacing: '-3px', lineHeight: 1.06, marginBottom: 24, maxWidth: 820 }}>
              Concentrez-vous sur l&apos;essentiel,<br/>
              <span style={{ color: '#1DB954' }}>nous gérons vos impayés.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, marginBottom: 40, maxWidth: 500, fontWeight: 300 }}>
              Nous vous aidons à piloter votre trésorerie en toute simplicité.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
              <button className="btn-hero-primary" onClick={() => router.push('/souscrire')}>
                Souscrire un abonnement
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="btn-hero-secondary" onClick={() => router.push('/comment-ca-marche')}>
                Comment ça marche ?
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display: 'flex', gap: 28, justifyContent: 'center' }}>
              {['Dès 19,99 €/mois', 'Commission au succès', 'Email + SMS'].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#1DB954', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </Reveal>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: 80, background: 'linear-gradient(to bottom, transparent, #e5e7eb)' }} />
        </section>

        {/* STATS */}
        <section style={{ background: '#0a0a0a', padding: '80px 40px' }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 56 }}>
              La réalité des impayés en France
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, maxWidth: 960, margin: '0 auto' }}>
            {[
              { value: '42', unit: 'jours', label: 'Retard moyen de paiement des TPE', accent: '#1DB954' },
              { value: '+16', unit: '%', label: 'Augmentation des impayés pour les TPE et PME en 2024', accent: '#fff' },
              { value: '80', unit: '%', label: 'Des fonds récupérés grâce à une relance efficace', accent: '#1DB954' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="stat-card" style={{ padding: '40px 36px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 72, color: s.accent, letterSpacing: '-3px', lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 28, color: s.accent, opacity: 0.7 }}>{s.unit}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 400, lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ENCART E-INVOICING */}
        <section style={{ background: '#fff', padding: '48px 40px 0' }}>
          <Reveal>
            <div style={{ maxWidth: 960, margin: '0 auto', background: 'linear-gradient(135deg, #f0fdf4, #e8fef0)', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 48, height: 48, background: '#1DB954', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, background: '#1DB954', color: 'white', borderRadius: 6, padding: '2px 8px', fontWeight: 700, letterSpacing: '0.5px' }}>SEPTEMBRE 2026</span>
                  <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Facturation électronique obligatoire en France</span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                  La réforme e-invoicing obligera toutes les entreprises à émettre leurs factures dans un format numérique standardisé. Pour vous, TPE et PME, cela signifie que vos factures impayées seront transmissibles à ProBoost en un clic — plus de ressaisie, traitement instantané.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 3 ETAPES */}
        <section style={{ background: '#fff', padding: '100px 40px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <Reveal>
              <div style={{ marginBottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Processus</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 44, color: '#0a0a0a', letterSpacing: '-2px', textAlign: 'center' }}>3 étapes pour récupérer vos impayés.</h2>
              </div>
            </Reveal>
            <div className="steps-grid">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="step-card" style={{ border: '1px solid #f0f0f0', borderRadius: 20, padding: '36px 28px 32px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'absolute', top: 16, right: 20 }}>
                      <span className="step-number">{s.n}</span>
                    </div>
                    <div style={{ width: 52, height: 52, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
                      <s.Icon />
                    </div>
                    <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#0a0a0a', marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, flex: 1 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '80px 40px' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tarifs</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 38, color: '#0a0a0a', letterSpacing: '-1.5px', marginBottom: 20 }}>Simple et transparent.</h2>
                <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, maxWidth: 640, margin: '0 auto', fontWeight: 400 }}>
                  Vous n&apos;aurez plus à courir après le temps et l&apos;argent. Nous serons votre allié pour la gestion de vos impayés et serons rémunérés uniquement sur les fonds récupérés.
                </p>
              </div>
            </Reveal>
            <div className="plans-grid">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.nom} delay={i * 0.08}>
                  <div className="plan-card"
                    onClick={() => router.push(`/souscrire?plan=${plan.nom.toLowerCase()}`)}
                    style={{ background: 'white', borderRadius: 20, padding: '36px 28px', border: plan.popular ? `2px solid ${plan.couleur}` : '1px solid #e5e7eb', boxShadow: plan.popular ? `0 8px 40px ${plan.couleur}22` : '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.couleur, color: 'white', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {plan.popularLabel}
                      </div>
                    )}
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: '#111', marginBottom: 6 }}>{plan.nom}</h3>
                      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>{plan.description}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 40, color: '#111' }}>{plan.prix} €</span>
                        <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mois</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '5px 12px' }}>
                        <span style={{ fontSize: 13, color: plan.couleur, fontWeight: 600 }}>{plan.commission} prélevé sur chaque facture recouvrée</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, flex: 1, marginBottom: 24 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: f.ok ? plan.bg : '#F3F4F6', border: f.ok ? `1px solid ${plan.border}` : '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: f.ok ? plan.couleur : '#D1D5DB', fontWeight: 700 }}>{f.ok ? '✓' : '✗'}</span>
                          </div>
                          <span style={{ fontSize: 14, color: f.ok ? '#374151' : '#9CA3AF', fontWeight: f.bold ? 700 : 400 }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', background: plan.popular ? plan.couleur : plan.bg, border: `1.5px solid ${plan.border}`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: plan.popular ? 'white' : plan.couleur }}>Choisir {plan.nom} →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: '#0a0a0a', padding: '100px 40px' }}>
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 24 }}>Notre engagement</p>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(32px, 4vw, 48px)', color: 'white', letterSpacing: '-2px', lineHeight: 1.15, marginBottom: 24 }}>
                Vous n&apos;aurez plus à courir après<br/>
                <span style={{ color: '#1DB954' }}>le temps et l&apos;argent.</span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontWeight: 300, maxWidth: 560, margin: '0 auto 40px' }}>
                Nous serons votre allié pour la gestion de vos impayés et serons rémunérés uniquement sur les fonds récupérés.
              </p>
              <button className="btn-hero-primary" onClick={() => router.push('/souscrire')} style={{ fontSize: 16, padding: '16px 40px' }}>
                Souscrire maintenant
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 72, height: 72, objectFit: 'contain' }} />
<span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 26, color: '#111' }}>ProBoost</span>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>© 2025 ProBoost — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['CGU', 'Confidentialité', 'Contact'].map(l => (
              <span key={l} className="nav-a" style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}
