'use client'
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0620 0%, #1a0a3d 50%, #0d1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.png" alt="ManaFlow" width={48} height={48} style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: 28, color: 'white', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span>
            <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>
          </span>
        </div>
      </div>
    </>
  )
}
