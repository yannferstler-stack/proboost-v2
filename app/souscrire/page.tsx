'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const PLANS = [
  {
    id: 'starter',
    nom: 'Starter',
    prix: '19,99',
    prixNum: 1999,
    couleur: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    commission: '14%',
    description: 'Idéal pour les indépendants et petites structures',
    features: ['10 factures / mois', '3 relances par facture', 'Email uniquement', 'Import CSV & PDF', 'Dashboard complet'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter',
  },
  {
    id: 'premium',
    nom: 'Premium',
    prix: '49,99',
    prixNum: 4999,
    couleur: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    commission: '12%',
    description: 'Pour les TPE avec un volume de factures régulier',
    features: ['50 factures / mois', '5 relances par facture', 'Email uniquement', 'Délais personnalisables', 'Historique des relances'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: '149,99',
    prixNum: 14999,
    couleur: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    commission: '10%',
    description: 'Pour les cabinets et entreprises à fort volume',
features: ["Jusqu'à 200 factures / mois", '5 relances par facture', 'Email + SMS', 'Délais personnalisables', 'Support prioritaire'],    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_pro',
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

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[0]

  const handleSouscrire = async () => {
    if (!cgvAccepted) { setError('Veuillez accepter les CGV / CGU pour continuer.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, priceId: plan.stripePriceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError('Erreur lors de la création de la session de paiement.')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        .plan-card { border: 2px solid #E5E7EB; border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.2s; background: white; }
        .plan-card:hover { border-color: #9CA3AF; }
        .plan-card.selected { border-color: var(--couleur); box-shadow: 0 0 0 3px var(--glow); }
        .btn-souscrire { background: linear-gradient(135deg, #1DB954, #15a347); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; transition: all 0.2s; box-shadow: 0 4px 20px rgba(29,185,84,0.35); }
        .btn-souscrire:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(29,185,84,0.45); }
        .btn-souscrire:disabled { background: #E5E7EB; color: #9CA3AF; cursor: not-allowed; box-shadow: none; }
        .checkbox-wrap { display: flex; align-items: flex-start; gap: 10; cursor: pointer; }
        .nav-a { cursor: pointer; transition: color 0.15s; }
        .nav-a:hover { color: #1DB954 !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'Inter, sans-serif' }}>

        {/* NAV */}
        <nav style={{ background: 'white', borderBottom: '1px solid #EAECEF', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Déjà client ?</span>
            <span className="nav-a" onClick={() => router.push('/login')} style={{ fontSize: 13, color: '#1DB954', fontWeight: 600 }}>Se connecter →</span>
          </div>
        </nav>

        <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>

          {/* GAUCHE */}
          <div>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Souscription</span>
              <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 32, color: '#111', letterSpacing: '-1px', marginTop: 8, marginBottom: 8 }}>Choisissez votre plan</h1>
              <p style={{ fontSize: 15, color: '#6B7280' }}>Abonnement mensuel sans engagement, résiliable à tout moment.</p>
            </div>

            {/* PLANS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {PLANS.map(p => (
                <div key={p.id} className={`plan-card${selectedPlan === p.id ? ' selected' : ''}`}
                  style={{ '--couleur': p.couleur, '--glow': p.couleur + '22' } as any}
                  onClick={() => setSelectedPlan(p.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? p.couleur : '#D1D5DB'}`, background: selectedPlan === p.id ? p.couleur : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {selectedPlan === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111' }}>{p.nom}</span>
                          {p.popular && <span style={{ fontSize: 11, background: p.couleur, color: 'white', borderRadius: 20, padding: '2px 10px', fontWeight: 700 }}>Recommandé</span>}
                        </div>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>{p.description}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 22, color: '#111' }}>{p.prix} €</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>/mois</span>
                      </div>
                      <span style={{ fontSize: 12, color: p.couleur, fontWeight: 600 }}>+ {p.commission} au succès</span>
                    </div>
                  </div>
                  {selectedPlan === p.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${p.border}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {p.features.map((f, i) => (
                        <span key={i} style={{ fontSize: 12, background: p.bg, color: p.couleur, borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CGV */}
            <div style={{ background: 'white', border: '1px solid #EAECEF', borderRadius: 14, padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 12 }}>Acceptation des conditions</h3>

              <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: '#374151', lineHeight: 1.7, maxHeight: 160, overflowY: 'auto' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Mandat de recouvrement et conditions d'utilisation</p>
                <p style={{ marginBottom: 6 }}>En souscrivant à ProBoost, vous mandatez ProBoost SAS pour effectuer, en votre nom et pour votre compte, des relances amiables auprès de vos débiteurs par email et/ou SMS.</p>
                <p style={{ marginBottom: 6 }}>Vous reconnaissez que ProBoost agit en tant qu'intermédiaire et non en tant que mandataire judiciaire. Les relances effectuées restent dans le cadre amiable.</p>
                <p style={{ marginBottom: 6 }}>La commission de succès est prélevée uniquement sur les montants effectivement recouvrés. L'abonnement mensuel est dû indépendamment des résultats obtenus.</p>
                <p>Vous pouvez résilier à tout moment depuis votre espace client, sans frais. La résiliation prend effet à la fin de la période en cours.</p>
              </div>

              <label className="checkbox-wrap" onClick={() => setCgvAccepted(!cgvAccepted)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${cgvAccepted ? '#1DB954' : '#D1D5DB'}`, borderRadius: 6, background: cgvAccepted ? '#1DB954' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                  {cgvAccepted && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  J'accepte les <span style={{ color: '#1DB954', fontWeight: 600, cursor: 'pointer' }}>Conditions Générales de Vente</span> et le mandat de recouvrement amiable confié à ProBoost. Je confirme avoir lu et compris les modalités de facturation.
                </span>
              </label>
            </div>
          </div>

          {/* DROITE — Récapitulatif */}
          <div>
            <div style={{ background: 'white', border: '1px solid #EAECEF', borderRadius: 16, padding: '28px 24px', position: 'sticky', top: 24 }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 20 }}>Récapitulatif</h3>

              <div style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: '#111' }}>Plan {plan.nom}</span>
                  <span style={{ fontSize: 11, background: plan.couleur, color: 'white', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>MENSUEL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 28, color: '#111' }}>{plan.prix} €</span>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>/mois</span>
                </div>
                <span style={{ fontSize: 12, color: plan.couleur, fontWeight: 600 }}>+ {plan.commission} prélevé sur chaque facture recouvrée</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                {[
                  { label: 'Abonnement mensuel', value: `${plan.prix} €` },
                  { label: 'Total', value: `${(plan.prixNum * 1 / 100).toFixed(2)} €`, bold: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                    <span style={{ fontSize: 13, color: row.bold ? '#111' : '#6B7280', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: row.bold ? '#111' : '#6B7280', fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</p>
                </div>
              )}

             
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Paiement sécurisé par Stripe', 'Sans engagement — résiliable à tout moment', 'Accès immédiat après paiement'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#1DB954', fontWeight: 700, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{t}</span>
                  </div>
                ))}

                <p></p>
                 <button className="btn-souscrire" onClick={handleSouscrire} disabled={loading || !cgvAccepted}>
                {loading ? 'Redirection...' : `Souscrire au plan ${plan.nom} →`}
              </button>

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
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <SouscrireContent />
    </Suspense>
  )
}
