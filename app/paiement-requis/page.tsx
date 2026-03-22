'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function PaiementRequisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePortal = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erreur lors de la connexion au portail de paiement.')
      }
    } catch {
      setError('Erreur réseau. Réessayez ou contactez contact@manaflow.fr')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%); min-height: 100vh; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 1; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

        {/* NAV */}
        <nav style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
          </div>
        </nav>

        {/* CONTENT */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ maxWidth: 500, width: '100%', animation: 'fadeUp 0.5s ease both' }}>

            {/* Icône alerte */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-ring 2s ease infinite' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>

            {/* Card principale */}
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: '36px 32px', textAlign: 'center' }}>

              <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
                Abonnement suspendu
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28 }}>
                Un paiement a échoué sur votre abonnement ManaFlow.<br/>
                Merci de régulariser votre situation pour retrouver l&apos;accès à votre espace.
              </p>

              {/* Bandeau info */}
              <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)', borderRadius: 12, padding: '14px 18px', marginBottom: 28, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <div>
                    <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Que s&apos;est-il passé ?</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      Stripe n&apos;a pas pu débiter votre moyen de paiement. Cela peut arriver en cas de carte expirée, de fonds insuffisants ou de plafond atteint.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton portail */}
              <button
                onClick={handlePortal}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(168,85,247,0.40)',
                  marginBottom: 12, transition: 'all 0.2s',
                }}
              >
                {loading ? 'Connexion au portail...' : 'Mettre à jour mon moyen de paiement →'}
              </button>

              {error && (
                <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 12, lineHeight: 1.5 }}>{error}</p>
              )}

              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                Vous serez redirigé vers le portail sécurisé Stripe pour mettre à jour vos informations de paiement.
              </p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href="mailto:contact@manaflow.fr"
                  style={{ fontSize: 13, color: '#c084fc', textDecoration: 'none', fontWeight: 500 }}
                >
                  Un problème ? Contactez-nous → contact@manaflow.fr
                </a>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.30)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
