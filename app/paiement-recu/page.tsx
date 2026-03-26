'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaiementRecuPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%)' }} />}>
      <PaiementRecuContent />
    </Suspense>
  )
}

function PaiementRecuContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // Vérification réelle auprès de Stripe — pas de fake success possible
    if (!sessionId) { setStatus('error'); return }

    fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => setStatus(data.paid ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [sessionId])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.06);opacity:1} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 480, width: '100%', animation: status !== 'loading' ? 'fadeUp 0.5s ease both' : undefined }}>

          {status === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid rgba(168,85,247,0.8)', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Vérification du paiement...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-ring 2s ease infinite' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: '36px 32px', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
                  Paiement confirmé !
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
                  Votre paiement a bien été reçu. La facture a été mise à jour automatiquement.
                </p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
                  Un email de confirmation vous a été envoyé. Vous pouvez fermer cette page.
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: '36px 32px', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
                  Une erreur est survenue
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  Nous n&apos;avons pas pu confirmer votre paiement. Veuillez contacter l&apos;émetteur de la facture.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
