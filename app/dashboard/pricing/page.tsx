'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

const PLANS = [
  {
    id: 'starter',
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
    popular: false,
  },
  {
    id: 'premium',
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
    popular: false,
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: '249,99',
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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.10) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid #EAECEF', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 22, color: '#111' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>Connecté : {user?.email}</span>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
              style={{ fontSize: 13, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '56px 24px 40px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>🎉 Bienvenue sur ManaFlow, {user?.email?.split('@')[0]} !</span>
          </div>
          <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 34, color: '#111', marginBottom: 12 }}>
            Choisissez votre plan pour commencer
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 500, margin: '0 auto 8px' }}>
            Abonnement mensuel fixe + commission uniquement sur les factures recouvrées.
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Le paiement en ligne sera disponible très prochainement.</p>
        </div>

        {/* Banner bientôt disponible */}
        <div style={{ maxWidth: 600, margin: '0 auto 32px', padding: '0 24px' }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🔧</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#EA580C', marginBottom: 2 }}>Paiement en cours de configuration</p>
              <p style={{ fontSize: 12, color: '#92400E' }}>
                Notre système de paiement Stripe sera actif très prochainement. Pour accéder dès maintenant,{' '}
                <a href="mailto:contact@manaflow.fr" style={{ color: '#EA580C', fontWeight: 700, textDecoration: 'underline' }}>contactez-nous</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '0 24px 60px', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.4s ease 0.1s both', alignItems: 'stretch' }}>
          {PLANS.map((plan) => (
            <div key={plan.id} className="plan-card" style={{
              background: 'white', borderRadius: 20, padding: '36px 28px',
              flex: '1 1 280px', maxWidth: 320,
              border: plan.popular ? `2px solid ${plan.couleur}` : '1px solid #EAECEF',
              boxShadow: plan.popular ? `0 8px 40px ${plan.couleur}22` : '0 2px 8px rgba(0,0,0,0.06)',
              position: 'relative', display: 'flex', flexDirection: 'column',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: plan.couleur, color: 'white', borderRadius: 20,
                  padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  🏆 Recommandé pour les PME
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{plan.badge}</span>
                  <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, color: '#111' }}>{plan.nom}</h2>
                </div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 38, color: '#111' }}>{plan.prix}€</span>
                  <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mois</span>
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
                <button disabled style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', cursor: 'not-allowed', border: 'none',
                  background: '#F3F4F6', color: '#9CA3AF',
                }}>
                  🔒 Bientôt disponible
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
                  Paiement sécurisé via Stripe
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 48 }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Vous souhaitez accéder maintenant ?{' '}
            <a href="mailto:contact@manaflow.fr" style={{ color: '#1DB954', fontWeight: 700, textDecoration: 'none' }}>
              Contactez-nous →
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
