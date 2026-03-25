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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Comfortaa:wght@400;700;900&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0d0620; overflow-x: hidden; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }

        .page-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 32px 20px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,0.25) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(236,72,153,0.12) 0%, transparent 55%),
                      linear-gradient(180deg, #0d0620 0%, #0f0a2e 50%, #0a0a1e 100%);
        }

        /* Orbs décoratifs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-delay: 2s;
        }
        .orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          top: 40%; left: 10%;
          animation-delay: 4s;
        }

        /* Grille de points décorative */
        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
        }

        /* Contenu principal */
        .content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 520px;
          width: 100%;
          animation: fadeUp 0.6s ease forwards;
        }

        /* Logo */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .logo-name {
          font-family: 'Comfortaa', sans-serif;
          font-weight: 900;
          font-size: 26px;
          color: white;
          letter-spacing: -0.5px;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.3);
          font-size: 13px;
          font-weight: 500;
          color: #c084fc;
          margin-bottom: 24px;
          animation: fadeUp 0.6s ease 0.1s both;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 6px #a855f7;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Titre */
        .main-title {
          font-family: 'Yeseva One', serif;
          font-size: clamp(36px, 7vw, 52px);
          line-height: 1.1;
          color: white;
          margin-bottom: 16px;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .title-gradient {
          background: linear-gradient(135deg, #a855f7, #ec4899, #f97316);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 4s linear infinite;
        }

        /* Sous-titre */
        .subtitle {
          font-size: 16px;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin-bottom: 48px;
          max-width: 380px;
          animation: fadeUp 0.6s ease 0.3s both;
        }

        /* Icônes features */
        .features {
          display: flex;
          gap: 20px;
          margin-bottom: 48px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s ease 0.35s both;
        }
        .feature-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 100px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }
        .feature-chip span.icon { font-size: 14px; }

        /* Card formulaire */
        .card {
          width: 100%;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
          animation: fadeUp 0.6s ease 0.4s both;
        }

        .card-label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        input:focus { outline: none; }
        .pw-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 15px;
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          margin-bottom: 12px;
          transition: all 0.2s;
          background: rgba(255,255,255,0.06);
          color: white;
        }
        .pw-input::placeholder { color: rgba(255,255,255,0.25); }
        .pw-input:focus {
          border-color: rgba(168,85,247,0.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,0.12) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .pw-input.error { border-color: rgba(248,113,113,0.5) !important; }

        .error-msg {
          color: #f87171;
          font-size: 13px;
          margin-bottom: 12px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(168,85,247,0.35);
          transition: all 0.2s;
          letter-spacing: 0.2px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(168,85,247,0.5) !important;
          filter: brightness(1.1);
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Footer */
        .footer-note {
          margin-top: 32px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          animation: fadeUp 0.6s ease 0.5s both;
        }
      `}</style>

      <div className="page-wrap">
        {/* Arrière-plan décoratif */}
        <div className="dot-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="content">

          {/* Logo */}
          <div className="logo-wrap">
            <Image src="/logo.png" alt="Manaflow" width={36} height={36} style={{ borderRadius: 8 }} />
            <span className="logo-name">
              <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span>
              <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>
            </span>
          </div>

          {/* Badge */}
          <div className="badge">
            <span className="badge-dot" />
            Bientôt disponible
          </div>

          {/* Titre */}
          <h1 className="main-title">
            On peaufine les<br />
            <span className="title-gradient">derniers détails ✨</span>
          </h1>

          {/* Sous-titre */}
          <p className="subtitle">
            Manaflow arrive très prochainement.<br />
            En attendant, les équipes sont à pied d'œuvre pour vous offrir la meilleure expérience possible.
          </p>

          {/* Feature chips */}
          <div className="features">
            <div className="feature-chip"><span className="icon">🚀</span> Relances automatiques</div>
            <div className="feature-chip"><span className="icon">📄</span> Analyse de factures IA</div>
            <div className="feature-chip"><span className="icon">💳</span> Paiement en ligne</div>
          </div>

          {/* Card accès */}
          <div className="card">
            <p className="card-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Accès anticipé
            </p>

            <form onSubmit={handleSubmit}>
              <input
                className={`pw-input${error ? ' error' : ''}`}
                type="password"
                placeholder="Mot de passe d'accès"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoFocus
              />

              {error && (
                <p className="error-msg">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!password || loading}
                className="submit-btn"
              >
                {loading ? 'Vérification en cours…' : 'Accéder au site →'}
              </button>
            </form>
          </div>

          <p className="footer-note">© 2025 ManaFlow · Tous droits réservés</p>
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
