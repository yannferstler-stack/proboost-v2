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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-main { transition: all 0.2s; }
        .btn-main:hover { background: #18a34a !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,185,84,0.30) !important; }
        input:focus { outline: none; border-color: #1DB954 !important; box-shadow: 0 0 0 3px rgba(29,185,84,0.12); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F0FDF4 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.jpg" alt="ProBoost" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 12 }} />
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', letterSpacing: '-0.5px' }}>ProBoost</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Automatisez vos relances de factures</p>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #F0F0F0' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 24 }}>
              {isSignUp ? 'Créer un compte' : 'Bon retour 👋'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="vous@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mot de passe</label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }} />
              </div>

              {message && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: 13, color: '#DC2626' }}>{message}</p>
                </div>
              )}

              <button className="btn-main" onClick={handleAuth} disabled={loading}
                style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte →' : 'Se connecter →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
                {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                <span onClick={() => setIsSignUp(!isSignUp)}
                  style={{ color: '#1DB954', fontWeight: 600, cursor: 'pointer' }}>
                  {isSignUp ? 'Se connecter' : "S'inscrire gratuitement"}
                </span>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#D1D5DB' }}>
            ← <span onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', color: '#9CA3AF' }}>Retour à l'accueil</span>
          </p>
        </div>
      </div>
    </>
  )
}