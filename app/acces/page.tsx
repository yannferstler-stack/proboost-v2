'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function AccesContent() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/acces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, redirect }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(data.redirect)
      router.refresh()
    } else {
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafafa; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus { outline: none; }
        .pw-input:focus {
          border-color: #1DB954 !important;
          box-shadow: 0 0 0 3px rgba(29,185,84,0.08) !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: #17a348 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(29,185,84,0.35) !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        fontFamily: 'Inter, sans-serif',
        padding: 24,
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '48px 40px',
          maxWidth: 400,
          width: '100%',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          animation: 'fadeUp 0.4s ease forwards',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            <div style={{
              width: 32, height: 32,
              background: '#1DB954',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, background: 'white', borderRadius: 3 }} />
            </div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#0a0a0a' }}>
              ManaFlow
            </span>
          </div>

          {/* Icône cadenas */}
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 900, fontSize: 22,
            color: '#0a0a0a', marginBottom: 6,
            letterSpacing: '-0.5px',
          }}>
            Accès restreint
          </h1>
          <p style={{
            color: '#9CA3AF', fontSize: 14,
            marginBottom: 32, fontWeight: 300, lineHeight: 1.6,
          }}>
            Ce site est en accès privé.<br />
            Entrez le mot de passe pour continuer.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              className="pw-input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 15,
                border: error ? '1.5px solid #fed7d7' : '1.5px solid #e5e7eb',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                marginBottom: 10,
                transition: 'all 0.15s',
                background: '#fafafa',
                color: '#0a0a0a',
              }}
              autoFocus
            />

            {error && (
              <p style={{
                color: '#c53030', fontSize: 13,
                marginBottom: 12, textAlign: 'left',
              }}>
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '13px',
                background: '#1DB954',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: !password || loading ? 'not-allowed' : 'pointer',
                opacity: !password ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(29,185,84,0.25)',
                transition: 'all 0.18s',
              }}
            >
              {loading ? 'Vérification...' : 'Accéder →'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default function AccesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fafafa' }} />}>
      <AccesContent />
    </Suspense>
  )
}
