'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const PLANS = [
  {
    id: 'starter',
    nom: 'Starter',
    prix: '19,99',
    prixNum: 1999,
    couleur: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.25)',
    commission: '14%',
    description: 'Idéal pour les indépendants et petites structures',
    features: ['10 factures / mois', '3 relances par facture', 'Email uniquement', 'Import CSV & PDF', 'Dashboard complet'],
  },
  {
    id: 'premium',
    nom: 'Premium',
    prix: '49,99',
    prixNum: 4999,
    couleur: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.25)',
    commission: '12%',
    description: 'Pour les TPE avec un volume de factures régulier',
    features: ['50 factures / mois', '5 relances par facture', 'Email uniquement', 'Délais personnalisables', 'Historique des relances'],
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: '149,99',
    prixNum: 14999,
    couleur: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.25)',
    commission: '10%',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: ["Jusqu'à 200 factures / mois", '5 relances par facture', 'Email + SMS', 'Délais personnalisables', 'Support prioritaire'],
    popular: true,
  },
]

function SouscrireContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planParam = searchParams.get('plan')
  const [selectedPlan, setSelectedPlan] = useState(planParam || 'starter')
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[0]

  const handleSouscrire = async () => {
    if (!cgvAccepted) { setError('Veuillez accepter les CGV / CGU pour continuer.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Erreur lors de la création de la session de paiement.')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes orb { 0%,100%{transform:scale(1)}50%{transform:scale(1.08) translate(8px,-8px)} }
        .plan-card { border: 1.5px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px 20px; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); }
        .plan-card:hover { border-color: rgba(168,85,247,0.4); background: rgba(168,85,247,0.06); }
        .btn-souscrire { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; transition: all 0.2s; box-shadow: 0 4px 24px rgba(168,85,247,0.40); }
        .btn-souscrire:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.55); }
        .btn-souscrire:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; box-shadow: none; }
        .nav-a { cursor: pointer; transition: color 0.15s; color: rgba(255,255,255,0.5); }
        .nav-a:hover { color: #c084fc !important; }
        .scroll-box::-webkit-scrollbar { width: 4px; }
        .scroll-box::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 2px; }
        .scroll-box::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '10%', left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'orb 10s ease-in-out infinite' }} />
        <div style={{ position: 'fixed', bottom: '5%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Déjà client ?</span>
            <span className="nav-a" onClick={() => router.push('/login')} style={{ fontSize: 13, color: '#c084fc', fontWeight: 600 }}>Se connecter →</span>
          </div>
        </nav>

        {/* CONTENU */}
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: isMobile ? '28px 16px 48px' : '48px 24px',
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '1fr 360px',
          gap: isMobile ? 24 : 32,
          position: 'relative',
          zIndex: 1,
        }}>

          {/* GAUCHE — Plans + CGV */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Souscription</span>
              <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 24 : 32, color: 'white', letterSpacing: '-1px', marginTop: 6, marginBottom: 6 }}>Choisissez votre plan</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Abonnement mensuel sans engagement — résiliable à tout moment.</p>
            </div>

            {/* PLANS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {PLANS.map(p => {
                const isSelected = selectedPlan === p.id
                return (
                  <div key={p.id} className="plan-card"
                    style={{ borderColor: isSelected ? p.couleur : 'rgba(255,255,255,0.08)', background: isSelected ? p.bg : 'rgba(255,255,255,0.04)', boxShadow: isSelected ? `0 0 0 1px ${p.couleur}44` : 'none' }}
                    onClick={() => setSelectedPlan(p.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? p.couleur : 'rgba(255,255,255,0.2)'}`, background: isSelected ? p.couleur : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 16, color: 'white' }}>{p.nom}</span>
                            {p.popular && <span style={{ fontSize: 11, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>Recommandé</span>}
                          </div>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>{p.description}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                          <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 20, color: 'white' }}>{p.prix} €</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>/mois</span>
                        </div>
                        <span style={{ fontSize: 11, color: p.couleur, fontWeight: 600 }}>+ {p.commission} au succès</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${p.border}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {p.features.map((f, i) => (
                          <span key={i} style={{ fontSize: 11, background: p.bg, color: p.couleur, borderRadius: 6, padding: '3px 10px', fontWeight: 600, border: `1px solid ${p.border}` }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* CGV */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px' }}>
              <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 12 }}>Acceptation des conditions</h3>
              <div className="scroll-box" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, maxHeight: 140, overflowY: 'auto' }}>
                <p style={{ fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.70)' }}>Mandat de recouvrement et conditions d'utilisation</p>
                <p style={{ marginBottom: 6 }}>En souscrivant à ManaFlow, vous mandatez ManaFlow pour effectuer, en votre nom et pour votre compte, des relances amiables auprès de vos débiteurs par email et/ou SMS.</p>
                <p style={{ marginBottom: 6 }}>Vous reconnaissez que ManaFlow agit en tant qu'intermédiaire et non en tant que mandataire judiciaire. Les relances effectuées restent dans le cadre amiable.</p>
                <p style={{ marginBottom: 6 }}>La commission de succès est prélevée uniquement sur les montants effectivement recouvrés. L'abonnement mensuel est dû indépendamment des résultats obtenus.</p>
                <p>Vous pouvez résilier à tout moment depuis votre espace client, sans frais. La résiliation prend effet à la fin de la période en cours.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }} onClick={() => setCgvAccepted(!cgvAccepted)}>
                <div style={{ width: 20, height: 20, border: `2px solid ${cgvAccepted ? '#a855f7' : 'rgba(255,255,255,0.2)'}`, borderRadius: 6, background: cgvAccepted ? '#a855f7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                  {cgvAccepted && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  J'accepte les <span style={{ color: '#c084fc', fontWeight: 600 }}>Conditions Générales de Vente</span> et le mandat de recouvrement amiable confié à ManaFlow.
                </span>
              </label>
            </div>
          </div>

          {/* DROITE — Récapitulatif */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: isMobile ? '20px' : '28px 24px', position: isMobile ? 'static' : 'sticky', top: 24 }}>
              <h3 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 18 }}>Récapitulatif</h3>

              <div style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 12, padding: '14px', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 16, color: 'white' }}>Plan {plan.nom}</span>
                  <span style={{ fontSize: 11, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>MENSUEL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 28, color: 'white' }}>{plan.prix} €</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>/mois</span>
                </div>
                <span style={{ fontSize: 12, color: plan.couleur, fontWeight: 600 }}>+ {plan.commission} prélevé sur chaque facture recouvrée</span>
              </div>

              <div style={{ marginBottom: 18 }}>
                {[
                  { label: 'Abonnement mensuel', value: `${plan.prix} €` },
                  { label: 'Total', value: `${plan.prix} €`, bold: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: 13, color: row.bold ? 'white' : 'rgba(255,255,255,0.45)', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: row.bold ? 'white' : 'rgba(255,255,255,0.45)', fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <button className="btn-souscrire" onClick={handleSouscrire} disabled={loading || !cgvAccepted}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Redirection...
                  </span>
                ) : `Souscrire au plan ${plan.nom} →`}
              </button>

              {!cgvAccepted && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 8 }}>Acceptez les CGV pour continuer</p>
              )}

              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['Paiement sécurisé par Stripe', 'Sans engagement — résiliable à tout moment', 'Accès immédiat après paiement'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#a855f7', fontWeight: 700, fontSize: 12 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SouscrirePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0620' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(168,85,247,0.3)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <SouscrireContent />
    </Suspense>
  )
}
