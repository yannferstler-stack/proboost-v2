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
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s` }}>
      {children}
    </div>
  )
}

const PLANS = [
  {
    nom: 'Starter',
    prix: '19,99',
    couleur: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    commission: '10%',
    badge: '🟢',
    description: 'Idéal pour les indépendants et petites structures',
    features: [
      '10 factures / mois',
      '3 relances par facture',
      'Email uniquement',
      'Délais fixes J+7, J+15, J+30',
      'Commission 10% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
    ],
    cta: 'Commencer',
    popular: false,
    popularLabel: '',
  },
  {
    nom: 'Premium',
    prix: '49,99',
    couleur: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    commission: '8%',
    badge: '🔵',
    description: 'Pour les PME avec un volume de factures régulier',
    features: [
      '50 factures / mois',
      '5 relances par facture',
      'Email uniquement',
      'Délais personnalisables',
      'Commission 8% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
      'Historique des relances',
    ],
    cta: 'Choisir Premium',
    popular: false,
    popularLabel: '',
  },
  {
    nom: 'Pro',
    prix: '249,99',
    couleur: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    commission: '7%',
    badge: '🟣',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: [
      'Factures illimitées',
      '5 relances par facture',
      'Email + SMS',
      'Délais personnalisables',
      'Commission 7% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
      'Historique des relances',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
    popular: true,
    popularLabel: '🏆 Recommandé pour les PME',
  },
]

export default function Home() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #fff; }
        .btn-g { background: #1DB954; color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; }
        .btn-g:hover { background: #17a348 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,185,84,0.3) !important; }
        .btn-o { background: transparent; cursor: pointer; font-family: Inter,sans-serif; font-weight: 500; transition: all 0.18s; }
        .btn-o:hover { background: #f4f4f5 !important; }
        .nav-a:hover { color: #1DB954 !important; }
        .nav-a { transition: color 0.15s; cursor: pointer; }
        .stat-card { transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-3px); }
        .step-card { transition: box-shadow 0.2s, transform 0.2s; }
        .step-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
        .plan-card { transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.10) !important; }
        .btn-plan { transition: all 0.2s; }
        .btn-plan:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Responsive mobile ── */
        .hero-btns { display: flex; gap: 10px; justify-content: center; margin-bottom: 48px; }
        .hero-trust { display: flex; gap: 28px; justify-content: center; }
        @media (max-width: 540px) {
          .hero-btns { flex-direction: column; align-items: center; gap: 8px; margin-bottom: 28px; }
          .hero-btns .btn-g, .hero-btns .btn-o { width: 230px; font-size: 14px !important; padding: 11px 16px !important; }
          .hero-trust { gap: 10px 18px; flex-wrap: wrap; }
          .hero-trust span { font-size: 12px !important; }
          nav .nav-desktop { display: none !important; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px',
          background: scrollY > 20 ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(14px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid #f0f0f0' : 'none',
          transition: 'all 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: '#111' }}>ManaFlow</span>
          </div>
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Comment ça marche ?</span>
            <span className="nav-a" onClick={() => router.push('/login')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Connexion</span>
            <button className="btn-g" onClick={() => router.push('/login')} style={{ borderRadius: 8, padding: '8px 18px', fontSize: 13 }}>
              Connexion →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(42px, 6vw, 76px)', color: '#0a0a0a', letterSpacing: '-3px', lineHeight: 1.06, marginBottom: 24, maxWidth: 820 }}>
              Concentrez-vous sur l'essentiel,<br/>
              <span style={{ color: '#1DB954' }}>nous gérons vos impayés.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, marginBottom: 40, maxWidth: 500, fontWeight: 300 }}>
              Relances email & SMS sans effort. Vous payez une commission uniquement sur ce qu'on récupère.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="hero-btns">
              <button className="btn-g" onClick={() => router.push('/comment-ca-marche')} style={{ borderRadius: 10, padding: '13px 28px', fontSize: 15, boxShadow: '0 4px 16px rgba(29,185,84,0.25)' }}>
                Comment ça marche ? →
              </button>
              <button className="btn-o" onClick={() => router.push('/login')} style={{ borderRadius: 10, padding: '13px 22px', fontSize: 15, color: '#374151', border: '1px solid #e5e7eb' }}>
                Connexion
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="hero-trust">
              {['Dès 19,99€/mois', 'Commission au succès', 'Email + SMS'].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#1DB954', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </Reveal>

          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: 80, background: 'linear-gradient(to bottom, transparent, #e5e7eb)' }} />
        </section>

        {/* ── STATS ── */}
        <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '64px 40px' }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 40 }}>
              La réalité des impayés en France
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, maxWidth: 900, margin: '0 auto' }}>
            {[
              { value: '42 j', label: 'Retard moyen TPE', source: 'Coface 2023', accent: '#DC2626' },
              { value: '15 Md€', label: 'Perdus par les PME/an', source: 'Banque de France', accent: '#EA580C' },
              { value: '30%', label: 'Dépassent le délai légal', source: 'Observatoire BdF 2024', accent: '#1DB954' },
              { value: '35/j', label: 'PME ferment à cause des impayés', source: 'Obs. délais paiement', accent: '#6B7280' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="stat-card" style={{ padding: '28px 24px', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 38, color: s.accent, letterSpacing: '-1.5px', marginBottom: 6 }}>{s.value}</p>
                  <p style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>{s.label}</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>Source : {s.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 3 ÉTAPES ── */}
        <section style={{ background: '#fff', padding: '80px 40px' }}>
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
            <Reveal>
              <div style={{ marginBottom: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Comment ça marche</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 40, color: '#0a0a0a', letterSpacing: '-1.5px', textAlign: 'center' }}>Opérationnel en 3 minutes.</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {[
                { n: '1', icon: '📥', title: 'Importez', desc: 'CSV ou PDF — notre IA extrait client, montant et échéance instantanément.' },
                { n: '2', icon: '⚡', title: 'ManaFlow relance', desc: 'Emails & SMS automatiques à J+7, J+15, J+30. Ton progressif, coordonnées de votre société.' },
                { n: '3', icon: '💶', title: 'Vous encaissez', desc: 'Commission uniquement sur les factures réellement recouvrées. Zéro risque.' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="step-card" style={{ border: '1px solid #f0f0f0', borderRadius: 14, padding: '32px 26px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 36, height: 36, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                      <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 13, color: '#1DB954', letterSpacing: '1px' }}>ÉTAPE {s.n}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: '#0a0a0a', marginBottom: 8 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARIFS ── */}
        <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '80px 40px' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tarifs</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 38, color: '#0a0a0a', letterSpacing: '-1.5px', marginBottom: 20 }}>Simple et transparent.</h2>
                <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, maxWidth: 640, margin: '0 auto', fontWeight: 400 }}>
                  Vous n'aurez plus à courir après le temps et l'argent. Nous serons votre allié pour la gestion de vos impayés et serons rémunérés uniquement sur les fonds récupérés. Vous pourrez ensuite préserver votre trésorerie ou investir pour développer votre activité.
                </p>
              </div>
            </Reveal>

            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {PLANS.map((plan, i) => (
                <Reveal key={plan.nom} delay={i * 0.08}>
                  <div className="plan-card"
                    style={{ background: 'white', borderRadius: 20, padding: '36px 28px', flex: '1 1 300px', width: 300, border: plan.popular ? `2px solid ${plan.couleur}` : '1px solid #e5e7eb', boxShadow: plan.popular ? `0 8px 40px ${plan.couleur}22` : '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.couleur, color: 'white', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {plan.popularLabel}
                      </div>
                    )}

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 22 }}>{plan.badge}</span>
                        <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: '#111' }}>{plan.nom}</h3>
                      </div>
                      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>{plan.description}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 40, color: '#111' }}>{plan.prix}€</span>
                        <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mois</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '4px 12px' }}>
                        <span style={{ fontSize: 13, color: plan.couleur, fontWeight: 700 }}>+ {plan.commission} de commission au succès</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, marginBottom: 28, flex: 1 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 20, height: 20, background: plan.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: plan.couleur, fontWeight: 700 }}>✓</span>
                          </div>
                          <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button className="btn-plan" onClick={() => router.push('/login')}
                      style={{ width: '100%', background: plan.popular ? plan.couleur : 'white', color: plan.popular ? 'white' : plan.couleur, border: `2px solid ${plan.couleur}`, borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 'auto' }}>
                      {plan.cta} →
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Note Stripe — visible mais pas bloquante */}
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#9CA3AF', lineHeight: 1.7 }}>
              💳 La réception des paiements clients nécessite un compte{' '}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6B7280', textDecoration: 'underline' }}>Stripe</a>{' '}
              (gratuit, création guidée en 3 min lors de l'inscription).
              Les relances emails fonctionnent sans Stripe.
            </p>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '80px 40px' }}>
          <Reveal>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 44, color: '#0a0a0a', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
                Arrêtez de relancer<br/>
                <span style={{ color: '#1DB954' }}>à la main.</span>
              </h2>
              <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
                Abonnement dès 19,99€/mois.<br/>Commission uniquement sur les factures récupérées.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn-g" onClick={() => router.push('/login')} style={{ borderRadius: 10, padding: '14px 30px', fontSize: 15, boxShadow: '0 4px 16px rgba(29,185,84,0.25)' }}>
                  Connexion →
                </button>
                <button className="btn-o" onClick={() => router.push('/comment-ca-marche')} style={{ borderRadius: 10, padding: '14px 22px', fontSize: 15, color: '#374151', border: '1px solid #e5e7eb' }}>
                  Comment ça marche ?
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 34, color: '#111' }}>ManaFlow</span>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>© 2025 ManaFlow — Tous droits réservés</p>
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
