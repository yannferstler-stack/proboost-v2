'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3c 50%, #0d0620 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px', textAlign: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 56, cursor: 'pointer', animation: 'fadeUp 0.5s ease both' }} onClick={() => router.push('/')}>
        <Image src="/logo.png" alt="ManaFlow" width={40} height={40} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontSize: 22, color: 'white' }}>
          <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span>
          <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>
        </span>
      </div>

      {/* 404 */}
      <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
        <div style={{ fontSize: 120, fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          404
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Page introuvable
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 40, maxWidth: 380, lineHeight: 1.6 }}>
          Cette page n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude, vos factures sont en sécurité.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            ← Retour
          </button>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(168,85,247,0.35)' }}>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 4s ease infinite' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 4s ease 2s infinite' }} />
    </div>
  )
}
