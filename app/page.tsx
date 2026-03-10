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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.jpg" style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => router.push('/pricing')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Tarifs</span>
            <span className="nav-a" onClick={() => router.push('/login')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Connexion</span>
            <button className="btn-g" onClick={() => router.push('/pricing')} style={{ borderRadius: 8, padding: '8px 18px', fontSize: 13 }}>
              Démarrer →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
          {/* Pill badge */}
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #e5e7eb', borderRadius: 20, padding: '5px 14px', marginBottom: 32, background: '#fafafa' }}>
              <div style={{ width: 6, height: 6, background: '#1DB954', borderRadius: '50%' }} />
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Recouvrement automatisé · TPE & PME</span>
            </div>
          </Reveal>

          {/* Headline XXL */}
          <Reveal delay={0.05}>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(42px, 6vw, 76px)', color: '#0a0a0a', letterSpacing: '-3px', lineHeight: 1.06, marginBottom: 24, maxWidth: 820 }}>
              Vos factures impayées<br/>
              récupérées,{' '}
              <span style={{ color: '#1DB954' }}>automatiquement.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, marginBottom: 40, maxWidth: 500, fontWeight: 300 }}>
              Relances email & SMS sans effort. Vous payez une commission uniquement sur ce qu'on récupère.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
              <button className="btn-g" onClick={() => router.push('/login')} style={{ borderRadius: 10, padding: '13px 28px', fontSize: 15, boxShadow: '0 4px 16px rgba(29,185,84,0.25)' }}>
                Démarrer maintenant →
              </button>
              <button className="btn-o" onClick={() => router.push('/pricing')} style={{ borderRadius: 10, padding: '13px 22px', fontSize: 15, color: '#374151', border: '1px solid #e5e7eb' }}>
                Voir les tarifs
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div style={{ display: 'flex', gap: 28, justifyContent: 'center' }}>
              {['Dès 19,99€/mois', 'Commission au succès', 'Email + SMS'].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#1DB954', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Ligne décorative bas */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: 80, background: 'linear-gradient(to bottom, transparent, #e5e7eb)' }} />
        </section>

        {/* ── STATS ── fond légèrement grisé */}
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
                { n: '2', icon: '⚡', title: 'ProBoost relance', desc: 'Emails & SMS automatiques à J+7, J+15, J+30. Ton progressif, coordonnées de votre société.' },
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
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tarifs</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 38, color: '#0a0a0a', letterSpacing: '-1.5px', marginBottom: 10 }}>Simple et transparent.</h2>
                <p style={{ fontSize: 15, color: '#6B7280' }}>Abonnement fixe + commission uniquement sur les factures recouvrées.</p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { nom: 'Starter', prix: '19,99€', comm: '10%', desc: '10 factures · 3 relances · Email', hot: false },
                { nom: 'Premium', prix: '49,99€', comm: '8%', desc: '50 factures · 5 relances · Email', hot: false },
                { nom: 'Pro', prix: '249,99€', comm: '7%', desc: 'Illimité · 5 relances · Email + SMS', hot: true },
              ].map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="plan-card" onClick={() => router.push('/pricing')}
                    style={{ background: p.hot ? '#0a0a0a' : '#fff', borderRadius: 14, padding: '28px 22px', border: p.hot ? '1.5px solid #1DB954' : '1px solid #e5e7eb', textAlign: 'center', position: 'relative', boxShadow: p.hot ? '0 8px 28px rgba(29,185,84,0.15)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                    {p.hot && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#1DB954', color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>RECOMMANDÉ PME</div>}
                    <p style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 13, color: p.hot ? '#1DB954' : '#9CA3AF', marginBottom: 8, letterSpacing: '0.5px' }}>{p.nom.toUpperCase()}</p>
                    <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 30, color: p.hot ? '#fff' : '#0a0a0a', letterSpacing: '-1px', marginBottom: 2 }}>{p.prix}</p>
                    <p style={{ fontSize: 12, color: p.hot ? 'rgba(255,255,255,0.4)' : '#9CA3AF', marginBottom: 14 }}>/mois</p>
                    <div style={{ display: 'inline-block', background: p.hot ? 'rgba(29,185,84,0.12)' : '#f0fdf4', border: `1px solid ${p.hot ? 'rgba(29,185,84,0.3)' : '#bbf7d0'}`, borderRadius: 6, padding: '3px 10px', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: p.hot ? '#4ade80' : '#16a34a', fontWeight: 600 }}>+ {p.comm} au succès</span>
                    </div>
                    <p style={{ fontSize: 12, color: p.hot ? 'rgba(255,255,255,0.4)' : '#9CA3AF', lineHeight: 1.5 }}>{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.15}>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-g" onClick={() => router.push('/pricing')} style={{ borderRadius: 10, padding: '12px 28px', fontSize: 14 }}>
                  Voir le détail des offres →
                </button>
              </div>
            </Reveal>
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
                  Démarrer maintenant →
                </button>
                <button className="btn-o" onClick={() => router.push('/pricing')} style={{ borderRadius: 10, padding: '14px 22px', fontSize: 15, color: '#374151', border: '1px solid #e5e7eb' }}>
                  Voir les tarifs
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.jpg" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 5 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 13, color: '#111' }}>ProBoost</span>
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