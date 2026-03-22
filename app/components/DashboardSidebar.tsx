'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/dashboard', icon: '📊' },
  { label: 'Importer', href: '/dashboard/importer', icon: '📤' },
  { label: 'Facturation', href: '/dashboard/facturation', icon: '🧾' },
  { label: 'Paramètres', href: '/dashboard/settings', icon: '⚙️' },
  { label: 'Plans', href: '/dashboard/pricing', icon: '💎' },
]

const LOGO_FILTER = 'drop-shadow(0 0 14px rgba(236,72,153,0.6)) drop-shadow(0 0 4px rgba(168,85,247,0.4))'
const SIDEBAR_BG = 'linear-gradient(180deg, #0d0620 0%, #150a30 60%, #0f0a2e 100%)'
const SIDEBAR_BORDER = '1px solid rgba(255,255,255,0.07)'

interface Props {
  user: { email: string } | null
  title?: string
}

export function DashboardSidebar({ user, title = 'Dashboard' }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase, router])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const logoSection = (size: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => { setOpen(false); router.push('/') }}>
      <img src="/logo.png" style={{ height: size, width: 'auto', objectFit: 'contain', filter: LOGO_FILTER }} />
      <span style={{ fontSize: size === 44 ? 22 : 20, color: 'white' }}>
        <span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 700 }}>Mana</span>
        <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span>
      </span>
    </div>
  )

  const navLinks = (mobile = false) => (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      {NAV_ITEMS.map(item => (
        <div key={item.href} className="sidebar-link"
          onClick={() => navigate(item.href)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: mobile ? '12px 14px' : '10px 12px',
            color: pathname === item.href ? 'white' : 'rgba(255,255,255,0.55)',
            fontSize: mobile ? 15 : 14,
            fontWeight: pathname === item.href ? 600 : 400,
            background: pathname === item.href ? 'rgba(255,255,255,0.10)' : 'transparent',
          }}>
          <span>{item.icon}</span>
          {item.label}
        </div>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        <a href="/blog" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', borderRadius: 8 }}>📖 Blog</a>
        <a href="/contact" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', borderRadius: 8 }}>💬 Aide &amp; contact</a>
      </div>
    </nav>
  )

  const userFooter = () => user ? (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{user.email[0].toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
          <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{ width: 240, background: SIDEBAR_BG, borderRight: SIDEBAR_BORDER, flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <div style={{ padding: '0 8px', marginBottom: 36 }}>
          {logoSection(44)}
        </div>
        {navLinks()}
        {userFooter()}
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <>
          <div className="sidebar-overlay" onClick={() => setOpen(false)} />
          <div className="mobile-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              {logoSection(36)}
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>×</button>
            </div>
            {navLinks(true)}
            {userFooter()}
          </div>
        </>
      )}

      {/* Mobile Topbar */}
      <div className="mobile-topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'white', borderBottom: '1px solid #EAECEF', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 16, color: '#111' }}>{title}</span>
        <div style={{ width: 32 }} />
      </div>
    </>
  )
}
