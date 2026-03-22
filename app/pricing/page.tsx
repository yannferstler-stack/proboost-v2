'use client'
import { useRouter } from 'next/navigation'

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
      'Commission 14% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
      '',
      '',
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
    commission: '12%',
    badge: '🔵',
    description: 'Pour les PME avec un volume de factures régulier',
    features: [
      '50 factures / mois',
      '5 relances par facture',
      'Email uniquement',
      'Délais personnalisables',
      'Commission 12% (min 5€)',
      'Dashboard complet',
      'Import CSV & PDF',
      'Historique des relances',
      '',
    ],
    cta: 'Choisir Premium',
    popular: false,
    popularLabel: '',
  },
  {
    nom: 'Pro',
    prix: '99,99',
    couleur: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    commission: '10%',
    badge: '🟣',
    description: 'Pour les cabinets et entreprises à fort volume',
    features: [
      "Jusqu'à 200 factures / mois",
      '5 relances par facture',
      'Email + SMS',
      'Délais personnalisables',
      'Commission 9% (min 5€)',
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

export default function PricingPage() {
  const router = useRouter()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }
        .btn-plan { transition: all 0.2s; }
        .btn-plan:hover { opacity: 0.88; transform: translateY(-1px); }
        .nav-link { transition: color 0.15s; cursor: pointer; }
        .nav-link:hover { color: #1DB954 !important; }
      `}</style>

      <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* Navbar */}
        <nav style={{ background: 'white', borderBottom: '1px solid #EAECEF', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 22, color: '#111' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <span className="nav-link" onClick={() => router.push('/')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Accueil</span>
            <span className="nav-link" style={{ fontSize: 14, color: '#1DB954', fontWeight: 700 }}>Tarifs</span>
            <button onClick={() => router.push('/login')}
              style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Se connecter
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '72px 20px 48px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'inline-block', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>💰 Tarifs transparents</span>
          </div>
          <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 48, color: '#111', marginBottom: 16, lineHeight: 1.15 }}>
            Un plan pour chaque<br/>
            <span style={{ color: '#1DB954' }}>besoin</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 18, maxWidth: 520, margin: '0 auto 12px' }}>
            Abonnement mensuel fixe + commission uniquement sur les factures recouvrées.
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Vous ne payez la commission que si on récupère votre argent.</p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '0 40px 80px', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.5s ease 0.1s both', alignItems: 'stretch' }}>
          {PLANS.map((plan) => (
            <div key={plan.nom} className="plan-card"
              style={{ background: 'white', borderRadius: 20, padding: '36px 28px', flex: '1 1 300px', maxWidth: 340, border: plan.popular ? `2px solid ${plan.couleur}` : '1px solid #EAECEF', boxShadow: plan.popular ? `0 8px 40px ${plan.couleur}22` : '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column' }}>

              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.couleur, color: 'white', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {plan.popularLabel}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{plan.badge}</span>
                  <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, color: '#111' }}>{plan.nom}</h2>
                </div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 40, color: '#111' }}>{plan.prix}€</span>
                  <span style={{ fontSize: 14, color: '#9CA3AF' }}>/mois</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 8, padding: '4px 12px' }}>
                  <span style={{ fontSize: 13, color: plan.couleur, fontWeight: 700 }}>+ {plan.commission} de commission au succès</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, marginBottom: 28, flex: 1 }}>
                {plan.features.map((f, i) => (
                  f ? (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 20, height: 20, background: plan.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: plan.couleur, fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
                    </div>
                  ) : (
                    <div key={i} style={{ height: 28 }} />
                  )
                ))}
              </div>

              <button className="btn-plan" onClick={() => router.push('/login')}
                style={{ width: '100%', background: plan.popular ? plan.couleur : 'white', color: plan.popular ? 'white' : plan.couleur, border: `2px solid ${plan.couleur}`, borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 'auto' }}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: 'white', borderTop: '1px solid #EAECEF', padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 28, color: '#111', marginBottom: 40 }}>Questions fréquentes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto', textAlign: 'left' }}>
            {[
              { q: 'Comment fonctionne la commission ?', r: 'La commission est prélevée uniquement sur les factures effectivement recouvrées. Si la facture n\'est pas payée, vous ne payez rien en plus de votre abonnement.' },
              { q: 'Puis-je changer de plan ?', r: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace client. Le changement est effectif immédiatement.' },
              { q: 'Qu\'est-ce que la commission minimum de 5€ ?', r: 'Pour les petites factures, la commission ne peut pas être inférieure à 5€. Cela garantit la viabilité du service même sur de petits montants.' },
              { q: 'Les SMS sont-ils inclus dans tous les plans ?', r: 'Les SMS sont disponibles uniquement dans le plan Pro. Les plans Starter et Premium incluent les relances par email uniquement.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#F9FAFB', borderRadius: 12, padding: '20px 22px', border: '1px solid #EAECEF' }}>
                <p style={{ fontWeight: 700, color: '#111', fontSize: 15, marginBottom: 8 }}>{faq.q}</p>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{faq.r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#0a0a0a', padding: '32px 40px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© 2025 ManaFlow — Tous droits réservés</p>
        </div>

      </div>
    </>
  )
}