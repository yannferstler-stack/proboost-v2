'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes floatB { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes orb { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.08) translate(10px,-10px); } }
        .input-field { transition: all 0.2s; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); width: 100%; border-radius: 12px; padding: 13px 16px; font-size: 14px; font-family: Inter, sans-serif; color: white; }
        .input-field::placeholder { color: rgba(255,255,255,0.35); }
        .input-field:focus { outline: none; border-color: rgba(167,139,250,0.7) !important; box-shadow: 0 0 0 4px rgba(167,139,250,0.15); background: rgba(255,255,255,0.12); }
        .btn-submit { transition: all 0.2s; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; box-shadow: 0 4px 24px rgba(168,85,247,0.45); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .btn-submit:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; box-shadow: none; }
        .card-float { animation: float 5s ease-in-out infinite; }
        .card-float-b { animation: floatB 5s ease-in-out infinite; animation-delay: 1.2s; }
        .card-float-c { animation: float 5s ease-in-out infinite; animation-delay: 2.5s; }
        .orb-anim { animation: orb 8s ease-in-out infinite; }
        .orb-anim-b { animation: orb 10s ease-in-out infinite; animation-delay: 3s; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes globaux */}
        <div className="orb-anim" style={{ position: 'fixed', top: '5%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.30) 0%, rgba(236,72,153,0.12) 45%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(2px)' }} />
        <div className="orb-anim-b" style={{ position: 'fixed', bottom: '-5%', right: '5%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, rgba(168,85,247,0.08) 50%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(2px)' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        {/* MOBILE — formulaire centré */}
        {isMobile && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', marginBottom: 40 }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif" }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
            </div>

            {/* Card formulaire */}
            <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', borderRadius: 24, padding: '36px 28px', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 24, color: 'white', letterSpacing: '-0.8px', marginBottom: 6 }}>
                  {isSignUp ? 'Créer votre compte' : 'Bon retour'}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                  {isSignUp ? 'Commencez à automatiser vos relances' : 'Connectez-vous à votre espace ManaFlow'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Adresse email</label>
                  <input type="email" placeholder="vous@entreprise.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Mot de passe</label>
                    {!isSignUp && <span style={{ fontSize: 12, color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}>Oublié ?</span>}
                  </div>
                  <input type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} className="input-field" />
                </div>

                {message && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '11px 14px' }}>
                    <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>{message}</p>
                  </div>
                )}

                <button className="btn-submit" onClick={handleAuth} disabled={loading}>
                  {loading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Chargement...</>
                  ) : (isSignUp ? 'Créer mon compte →' : 'Se connecter →')}
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                  <span onClick={() => { if (isSignUp) { setIsSignUp(false); setMessage('') } else router.push('/souscrire') }}
                    style={{ color: '#c084fc', fontWeight: 700, cursor: 'pointer' }}>
                    {isSignUp ? 'Se connecter' : 'Souscrire'}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
              <span onClick={() => router.push('/cgu')} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>CGU</span>
              <span onClick={() => router.push('/confidentialite')} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>Confidentialité</span>
              <span onClick={() => router.push('/contact')} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>Support</span>
            </div>
          </div>
        )}

        {/* DESKTOP — 2 colonnes */}
        {!isMobile && (
          <div style={{ minHeight: '100vh', display: 'flex' }}>

            {/* LEFT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px', position: 'relative', zIndex: 1 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
                <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
                <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif" }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
              </div>

              {/* Centre */}
              <div style={{ animation: 'fadeUp 0.7s ease both' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.30)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Relances automatisées</span>
                </div>

                <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 40, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
                  Vos impayés,<br/>
                  <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>enfin récupérés.</span>
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
                  Relances automatiques par email & SMS.
                </p>

                {/* Cartes flottantes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
                  <div className="card-float" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>Relance envoyée — FACT-2024-089</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Martin & Associés · 3 500 € · il y a 2 min</p>
                    </div>
                    <span style={{ fontSize: 11, background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, padding: '3px 9px', fontWeight: 700, whiteSpace: 'nowrap' }}>Envoyé</span>
                  </div>

                  <div className="card-float-b" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>Paiement reçu — FACT-2024-071</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Dupont SAS · 8 200 € récupérés</p>
                    </div>
                    <span style={{ fontSize: 11, background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 6, padding: '3px 9px', fontWeight: 700, whiteSpace: 'nowrap' }}>Récupéré</span>
                  </div>

                  <div className="card-float-c" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
                    {[
                      { value: '87%', label: 'Taux recouvrement', color: '#a855f7' },
                      { value: '48h', label: 'Premiers résultats', color: '#ec4899' },
                      { value: '5h', label: 'Économisées/sem.', color: '#a855f7' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '8px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        <p style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 20, color: s.color, marginBottom: 3 }}>{s.value}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 ManaFlow</p>
            </div>

            {/* RIGHT — formulaire */}
            <div style={{ width: 500, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '100%', animation: 'fadeUp 0.5s ease both' }}>

                <div style={{ marginBottom: 36 }}>
                  <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: '-0.8px', marginBottom: 8 }}>
                    {isSignUp ? 'Créer votre compte' : 'Bon retour'}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                    {isSignUp ? 'Commencez à automatiser vos relances' : 'Connectez-vous à votre espace ManaFlow'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Adresse email</label>
                    <input type="email" placeholder="vous@entreprise.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Mot de passe</label>
                      {!isSignUp && <span style={{ fontSize: 12, color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}>Oublié ?</span>}
                    </div>
                    <input type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} className="input-field" />
                  </div>

                  {message && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '11px 14px' }}>
                      <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>{message}</p>
                    </div>
                  )}

                  <button className="btn-submit" onClick={handleAuth} disabled={loading}>
                    {loading ? (
                      <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Chargement...</>
                    ) : (isSignUp ? 'Créer mon compte →' : 'Se connecter →')}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                    {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                    <span onClick={() => { if (isSignUp) { setIsSignUp(false); setMessage('') } else router.push('/souscrire') }}
                      style={{ color: '#c084fc', fontWeight: 700, cursor: 'pointer' }}>
                      {isSignUp ? 'Se connecter' : 'Souscrire un abonnement'}
                    </span>
                  </p>
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: 24 }}>
                  {['CGU', 'Confidentialité', 'Support'].map(l => (
                    <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
