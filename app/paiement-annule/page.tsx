'use client'

export default function PaiementAnnulePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 480, width: '100%', animation: 'fadeUp 0.5s ease both' }}>

          {/* Icône */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ width: 80, height: 80, background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, padding: '36px 32px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: 26, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
              Paiement annulé
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
              Vous avez annulé le paiement. Aucun montant n&apos;a été débité.
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Vous pouvez effectuer le paiement à tout moment via le lien reçu par email.
              Vous pouvez fermer cette page.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
