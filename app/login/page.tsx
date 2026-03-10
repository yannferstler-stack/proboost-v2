'use client'
import { useState } from 'react'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Email ou mot de passe incorrect')
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-field { transition: all 0.2s; border: 1.5px solid #E5E7EB; }
        .input-field:focus { outline: none; border-color: #1DB954 !important; box-shadow: 0 0 0 4px rgba(29,185,84,0.10); }
        .btn-submit { transition: all 0.2s; }
        .btn-submit:hover { background: #18a34a !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(29,185,84,0.40) !important; }
        .btn-submit:active { transform: translateY(0); }
        .stat-card { animation: fadeUp 0.6s ease both; }
        .feature-item { animation: slideIn 0.5s ease both; }
        .orb { animation: pulse 4s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', background: '#FAFAFA' }}>

        {/* LEFT PANEL */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f3460 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>

          <div className="orb" style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(29,185,84,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div className="orb" style={{ position: 'absolute', bottom: 100, left: -60, width: 250, height: 250, background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, transparent 70%)', borderRadius: '50%', animationDelay: '2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20 }}>P</span>
            </div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>ProBoost</span>
          </div>

          {/* Centre */}
          <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
                <div style={{ width: 6, height: 6, background: '#1DB954', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: '#1DB954', fontWeight: 600 }}>Automatisation intelligente</span>
              </div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 42, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
                Récupérez votre<br />
                <span style={{ color: '#1DB954' }}>argent</span> sans effort.
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400 }}>
                ProBoost relance automatiquement vos clients en retard par email et SMS. Vous vous concentrez sur votre business.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
              {[
                { value: '87%', label: 'Taux de recouvrement', delay: '0s' },
                { value: '48h', label: 'Premiers résultats', delay: '0.1s' },
                { value: '5h', label: 'Économisées/semaine', delay: '0.2s' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: s.delay, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#1DB954', marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '⚡', text: 'Relances automatiques par email & SMS', delay: '0s' },
                { icon: '🤖', text: 'Import de factures PDF par IA', delay: '0.1s' },
                { icon: '📊', text: 'Tableau de bord en temps réel', delay: '0.2s' },
              ].map((f, i) => (
                <div key={i} className="feature-item" style={{ animationDelay: f.delay, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{f.icon}</div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 ProBoost — Tous droits réservés</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 520, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', boxShadow: '-20px 0 60px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '100%', animation: 'fadeUp 0.6s ease both' }}>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 28, color: '#0a0a0a', letterSpacing: '-0.8px', marginBottom: 8 }}>
                {isSignUp ? 'Créer votre compte' : 'Bon retour 👋'}
              </h2>
              <p style={{ fontSize: 15, color: '#9CA3AF' }}>
                {isSignUp ? 'Commencez à automatiser vos relances' : 'Connectez-vous à votre espace ProBoost'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
                  <input
                    type="email"
                    placeholder="vous@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', borderRadius: 12, padding: '14px 14px 14px 42px', fontSize: 14, fontFamily: 'Inter, sans-serif', background: '#FAFAFA', color: '#111' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Mot de passe</label>
                  {!isSignUp && <span style={{ fontSize: 12, color: '#1DB954', cursor: 'pointer', fontWeight: 600 }}>Mot de passe oublié ?</span>}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="input-field"
                    style={{ width: '100%', borderRadius: 12, padding: '14px 14px 14px 42px', fontSize: 14, fontFamily: 'Inter, sans-serif', background: '#FAFAFA', color: '#111' }}
                  />
                </div>
              </div>

              {message && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span>
                  <p style={{ fontSize: 13, color: '#DC2626' }}>{message}</p>
                </div>
              )}

              <button className="btn-submit" onClick={handleAuth} disabled={loading}
                style={{ background: loading ? '#9CA3AF' : '#1DB954', color: 'white', border: 'none', borderRadius: 12, padding: '16px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(29,185,84,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Chargement...
                  </>
                ) : (
                  isSignUp ? 'Créer mon compte →' : 'Se connecter →'
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>ou</span>
                <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
              </div>

              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
                {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                <span onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
                  style={{ color: '#1DB954', fontWeight: 700, cursor: 'pointer' }}>
                  {isSignUp ? 'Se connecter' : "S'inscrire gratuitement"}
                </span>
              </p>
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'center', gap: 24 }}>
              {['CGU', 'Confidentialité', 'Support'].map(l => (
                <span key={l} style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}