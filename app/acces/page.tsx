'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

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
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Yeseva+One&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.05); }
        }

        .wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 32px 20px;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,0.2) 0%, transparent 60%),
                      linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%);
        }

        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 400px;
          width: 100%;
          animation: fadeUp 0.5s ease forwards;
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.3);
          font-size: 13px;
          font-weight: 500;
          color: #c084fc;
          margin-bottom: 16px;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 6px #a855f7;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .tagline {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .card {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 28px 24px;
        }

        .card-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pw-input {
          width: 100%;
          padding: 13px 16px;
          font-size: 15px;
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.05);
          color: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pw-input::placeholder { color: rgba(255,255,255,0.2); }
        .pw-input:focus {
          border-color: rgba(168,85,247,0.6);
          box-shadow: 0 0 0 3px rgba(168,85,247,0.1);
        }
        .pw-input.error { border-color: rgba(248,113,113,0.5); }

        .error-msg {
          color: #f87171;
          font-size: 13px;
          margin-bottom: 10px;
          text-align: left;
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 18px rgba(168,85,247,0.3);
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>

      <div className="wrap">
        <div className="content">

          {/* Logo */}
          <div className="logo-row">
            <Image src="/logo.png" alt="Manaflow" width={40} height={40} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 26, color: 'white', lineHeight: 1 }}>
              <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span>
              <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>
            </span>
          </div>

          {/* Badge bientôt dispo */}
          <div className="badge">
            <span className="badge-dot" />
            Bientôt disponible
          </div>

          {/* Message d'attente */}
          <p className="tagline">
            Le site est en cours de finalisation.<br />
            Entrez le mot de passe pour accéder à l&apos;aperçu.
          </p>

          {/* Formulaire */}
          <div className="card">
            <p className="card-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Accès anticipé
            </p>

            <form onSubmit={handleSubmit}>
              <input
                className={`pw-input${error ? ' error' : ''}`}
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoFocus
              />
              {error && <p className="error-msg">⚠ {error}</p>}
              <button
                type="submit"
                disabled={!password || loading}
                className="submit-btn"
              >
                {loading ? 'Vérification…' : 'Accéder →'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}

export default function AccesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d0620' }} />}>
      <AccesContent />
    </Suspense>
  )
}
