'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase.from('factures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setFactures(data || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const stats = {
    total: factures.length,
    impayees: factures.filter(f => f.statut === 'impayée').length,
    montantTotal: factures.filter(f => f.statut === 'impayée').reduce((sum, f) => sum + Number(f.montant), 0),
    payees: factures.filter(f => f.statut === 'payée').length,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important; }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .row-hover:hover { background: #F9FAFB !important; }
        .btn-main:hover { background: #18a34a !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,185,84,0.30) !important; }
        .btn-main { transition: all 0.15s; }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(29,185,84,0.08) !important; color: #1DB954 !important; }
        .active { background: rgba(29,185,84,0.12) !important; color: #1DB954 !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* Sidebar */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 36 }}>
            <img src="/logo.jpg" alt="ProBoost" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#111', letterSpacing: '-0.5px' }}>ProBoost</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div className="sidebar-link active" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#1DB954', fontSize: 14, fontWeight: 600 }}>
              <span>📊</span> Tableau de bord
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/importer'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>📥</span> Importer
            </div>
          </nav>

          <div style={{ borderTop: '1px solid #EAECEF', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                  style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ marginLeft: 240, flex: 1, padding: '40px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, animation: 'fadeUp 0.4s ease both' }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>Tableau de bord</h1>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Bienvenue 👋 — voici l'état de vos factures</p>
            </div>
            <button className="btn-main" onClick={() => window.location.href = '/dashboard/importer'}
              style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}>
              + Importer des factures
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            {[
              { label: 'Total factures', value: stats.total, unit: '', icon: '📄', accent: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Impayées', value: stats.impayees, unit: '', icon: '⏳', accent: '#DC2626', bg: '#FEF2F2' },
              { label: 'Montant dû', value: stats.montantTotal.toLocaleString('fr-FR'), unit: '€', icon: '💸', accent: '#EA580C', bg: '#FFF7ED' },
              { label: 'Payées', value: stats.payees, unit: '', icon: '✅', accent: '#16A34A', bg: '#F0FDF4' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ background: 'white', borderRadius: 14, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</p>
                  <div style={{ width: 32, height: 32, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 30, color: s.accent, lineHeight: 1 }}>{s.value}</span>
                  {s.unit && <span style={{ fontSize: 16, color: s.accent, fontWeight: 700 }}>{s.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {factures.length === 0 && (
            <div style={{ background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: 16, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <div>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Commencez maintenant 🚀</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Importez votre premier fichier CSV et automatisez vos relances</p>
              </div>
              <button onClick={() => window.location.href = '/dashboard/importer'}
                style={{ background: 'white', color: '#1DB954', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Importer maintenant
              </button>
            </div>
          )}

          {factures.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Mes factures</h2>
                <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6F8', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>{factures.length} facture{factures.length > 1 ? 's' : ''}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Client', 'Email', 'Montant', 'Échéance', 'Statut', 'Relances'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f, i) => (
                    <tr key={f.id} className="row-hover" style={{ borderBottom: i < factures.length - 1 ? '1px solid #F3F4F6' : 'none', background: 'white' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>{f.client_nom?.[0]?.toUpperCase()}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{f.client_nom}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13 }}>{f.client_email}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111', fontSize: 15, fontFamily: 'Manrope, sans-serif' }}>{Number(f.montant).toLocaleString('fr-FR')} €</td>
                      <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13 }}>{new Date(f.date_echeance).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: f.statut === 'payée' ? '#F0FDF4' : f.statut === 'impayée' ? '#FEF2F2' : '#FFF7ED',
                          color: f.statut === 'payée' ? '#16A34A' : f.statut === 'impayée' ? '#DC2626' : '#EA580C'
                        }}>
                          {f.statut === 'payée' ? '✓ Payée' : f.statut === 'impayée' ? '⏳ Impayée' : '📨 Relancée'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: '#F3F4F6', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{f.nombre_relances}x</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}