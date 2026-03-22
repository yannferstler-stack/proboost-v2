'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { DashboardSidebar } from '../../components/DashboardSidebar'

const EARLY_BIRD_DISCOUNT = 0.20
function formatPrix(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PLANS = [
  {
    id: 'starter',
    nom: 'Starter',
    prixBase: 19.99,
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
    popular: false,
  },
  {
    id: 'premium',
    nom: 'Premium',
    prixBase: 49.99,
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
    popular: false,
  },
  {
    id: 'pro',
    nom: 'Pro',
    prixBase: 149.99,
    couleur: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    commission: '7%',
    badge: '🟣',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: [
      "Jusqu'à 200 factures / mois",
      '5 relances par facture',
      'Email + SMS',
      'Délais personnalisables',
      'Commission 7% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
      'Historique des relances',
      'Support prioritaire',
    ],
    popular: true,
  },
]

export default function DashboardPricingPage() {
  const [user, setUser] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('starter')
  const [loading, setLoading] = useState(true)
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      // Fetch current plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      if (profile?.plan) setCurrentPlan(profile.plan)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleChangePlan = async () => {
    if (!confirmPlan) return
    setChanging(true)
    setResult(null)
    try {
      const res = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan: confirmPlan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de plan.')
      if (data.immediate) {
        setCurrentPlan(confirmPlan)
        setResult({ type: 'success', msg: `✅ Plan ${confirmPlan} activé immédiatement !` })
      } else {
        const date = data.effective_date ? new Date(data.effective_date).toLocaleDateString('fr-FR') : 'fin de période'
        setResult({ type: 'success', msg: `✅ Changement planifié au ${date}.` })
      }
    } catch (err: any) {
      setResult({ type: 'error', msg: err.message })
    }
    setChanging(false)
    setConfirmPlan(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.10) !important; }
        .plan-btn { transition: all 0.15s; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; }
        .plan-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .plan-btn:disabled { background: #F3F4F6 !important; color: #9CA3AF !important; cursor: default; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s ease; padding: 24px; }
        .modal-box { background: white; border-radius: 20px; padding: 36px 32px; max-width: 420px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.2); animation: fadeUp 0.2s ease; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; margin-bottom: 2px; }
        .nav-item:hover { background: rgba(0,0,0,0.04); }
      `}</style>

      {/* Confirmation Modal */}
      {confirmPlan && (
        <div className="modal-overlay" onClick={() => !changing && setConfirmPlan(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {(() => {
              const plan = PLANS.find(p => p.id === confirmPlan)!
              const isUpgrade = ['starter','premium','pro'].indexOf(confirmPlan) > ['starter','premium','pro'].indexOf(currentPlan)
              return (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{plan.badge}</div>
                    <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 20, color: '#111', marginBottom: 8 }}>
                      {isUpgrade ? 'Passer au plan' : 'Rétrograder vers'} {plan.nom} ?
                    </h2>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                      {isUpgrade
                        ? `Le changement sera effectif immédiatement avec un prorata sur votre période en cours.`
                        : `Le changement sera effectif à la fin de votre période de facturation actuelle.`}
                    </p>
                  </div>
                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>Plan actuel</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{currentPlan}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>Nouveau plan</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: plan.couleur }}>{plan.nom} — {formatPrix(plan.prixBase * (1 - EARLY_BIRD_DISCOUNT))}€/mois</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setConfirmPlan(null)} disabled={changing}
                      style={{ flex: 1, padding: '13px', borderRadius: 12, background: '#F3F4F6', color: '#6B7280', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Annuler
                    </button>
                    <button onClick={handleChangePlan} disabled={changing}
                      style={{ flex: 2, padding: '13px', borderRadius: 12, background: plan.couleur, color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: changing ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {changing ? (
                        <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Traitement...</>
                      ) : `Confirmer →`}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8', fontFamily: 'Inter, sans-serif' }}>

        <DashboardSidebar user={user} title="Plans" />

        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '56px 24px 32px', animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 32, color: '#111', marginBottom: 10 }}>
              Vos options d&apos;abonnement
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
              Abonnement mensuel fixe + commission uniquement sur les factures recouvrées.
            </p>
          </div>

          {/* Notification résultat */}
          {result && (
            <div style={{ maxWidth: 520, margin: '0 auto 24px', padding: '0 24px', animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                background: result.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${result.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: result.type === 'success' ? '#16A34A' : '#DC2626' }}>{result.msg}</p>
                <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF' }}>✕</button>
              </div>
            </div>
          )}

          {/* Plan actuel badge */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 20, padding: '6px 16px' }}>
              <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>Plan actuel : <span style={{ textTransform: 'capitalize' }}>{currentPlan}</span></span>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '0 24px 60px', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.4s ease 0.1s both', alignItems: 'stretch' }}>
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id
              return (
                <div key={plan.id} className="plan-card" style={{
                  background: 'white', borderRadius: 20, padding: '36px 28px',
                  flex: '1 1 280px', maxWidth: 320,
                  border: isCurrent ? `2px solid ${plan.couleur}` : '1px solid #EAECEF',
                  boxShadow: isCurrent ? `0 4px 20px ${plan.couleur}22` : '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                }}>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: plan.couleur, color: 'white', borderRadius: 20,
                      padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      ✓ Votre plan actuel
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{plan.badge}</span>
                      <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, color: '#111' }}>{plan.nom}</h2>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>{plan.description}</p>
                    {/* Early bird badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 6, padding: '2px 8px', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>-20% lancement</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 38, color: '#111' }}>{formatPrix(plan.prixBase * (1 - EARLY_BIRD_DISCOUNT))}€</span>
                      <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mois</span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>au lieu de {formatPrix(plan.prixBase)}€/mois</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '4px 10px' }}>
                      <span style={{ fontSize: 12, color: plan.couleur, fontWeight: 700 }}>+ {plan.commission} commission au succès</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20, marginBottom: 24, flex: 1 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 18, height: 18, background: plan.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: plan.couleur, fontWeight: 700 }}>✓</span>
                        </div>
                        <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    {isCurrent ? (
                      <button className="plan-btn" disabled
                        style={{ background: plan.bg, color: plan.couleur }}>
                        ✓ Plan actuel
                      </button>
                    ) : (
                      <button className="plan-btn" onClick={() => setConfirmPlan(plan.id)}
                        style={{ background: plan.couleur, color: 'white' }}>
                        Choisir {plan.nom} →
                      </button>
                    )}
                    <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
                      Paiement sécurisé via Stripe
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', paddingBottom: 48 }}>
            <p style={{ fontSize: 14, color: '#6B7280' }}>
              Une question sur votre abonnement ?{' '}
              <a href="mailto:contact@manaflow.fr" style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}>
                Contactez-nous →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

