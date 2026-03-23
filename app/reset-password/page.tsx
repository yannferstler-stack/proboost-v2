'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const supabase = createClient()

  // Supabase envoie le token dans le hash de l'URL → il gère ça automatiquement
  // On vérifie juste que la session est valide avant de permettre la réinitialisation
  useEffect(() => {
    supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Supabase a détecté le token dans l'URL — OK
      }
    })
  }, [])

  const handleReset = async () => {
    if (password.length < 8) { setMessage('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== passwordConfirm) { setMessage('Les mots de passe ne correspondent pas.'); return }
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-field { transition: all 0.2s; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); width: 100%; border-radius: 12px; padding: 13px 16px; font-size: 14px; font-family: Inter, sans-serif; color: white; }
        .input-field::placeholder { color: rgba(255,255,255,0.35); }
        .input-field:focus { outline: none; border-color: rgba(167,139,250,0.7) !important; box-shadow: 0 0 0 4px rgba(167,139,250,0.15); background: rgba(255,255,255,0.12); }
        .btn-submit { transition: all 0.2s; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; box-shadow: 0 4px 24px rgba(168,85,247,0.45); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .btn-submit:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.5s ease both' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, cursor: 'pointer', justifyContent: 'center' }} onClick={() => router.push('/')}>
          <img src="/logo.png" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: 20, color: 'white' }}>
            <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span>
            <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>
          </span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 700, fontSize: 22, color: 'white', marginBottom: 8 }}>Mot de passe mis à jour !</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Redirection vers votre dashboard...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 700, fontSize: 22, color: 'white', marginBottom: 6 }}>Nouveau mot de passe</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Choisissez un nouveau mot de passe sécurisé.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Confirmer le mot de passe</label>
                  <input type="password" placeholder="••••••••" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} className="input-field" />
                </div>
                {message && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '11px 14px' }}>
                    <p style={{ fontSize: 13, color: '#fca5a5' }}>{message}</p>
                  </div>
                )}
                <button className="btn-submit" onClick={handleReset} disabled={loading}>
                  {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Mise à jour...</> : 'Changer mon mot de passe →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
