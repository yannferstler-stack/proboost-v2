'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

const PLANS = {
  starter: { nom: 'Starter', taux: 0.14, couleur: '#a855f7', bg: 'rgba(168,85,247,0.10)', prix: '19,99 €/mois', desc: '10 factures · 3 relances · Email' },
  premium: { nom: 'Premium', taux: 0.12, couleur: '#ec4899', bg: 'rgba(236,72,153,0.10)', prix: '49,99 €/mois', desc: '50 factures · 5 relances · Email' },
  pro:     { nom: 'Pro',     taux: 0.10, couleur: '#c084fc', bg: 'rgba(192,132,252,0.10)', prix: '149,99 €/mois', desc: "Jusqu'à 200 factures · 5 relances · Email + SMS" },
}
const COMMISSION_MIN = 5

export default function FacturationPage() {
  const [user, setUser] = useState<any>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [plan, setPlan] = useState<'starter' | 'premium' | 'pro'>('starter')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (profile?.plan) setPlan(profile.plan)
      const { data } = await supabase.from('factures').select('*').eq('user_id', user.id).eq('statut', 'payée').order('created_at', { ascending: false })
      setFactures(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const currentPlan = PLANS[plan]
  const calcCommission = (montant: number) => Math.max(montant * currentPlan.taux, COMMISSION_MIN)

  const totalRecouvre = factures.reduce((sum, f) => sum + Number(f.montant), 0)
  const totalCommission = factures.reduce((sum, f) => sum + calcCommission(Number(f.montant)), 0)
  const totalNet = totalRecouvre - totalCommission

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(168,85,247,0.08) !important; color: #a855f7 !important; }
        .row-hover:hover { background: #FAFAFA !important; }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.10) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(168,85,247,0.35)' }}>
              <span style={{ color: 'white', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16 }}>P</span>
            </div>
            <span onClick={() => window.location.href = '/'} style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#111', cursor: 'pointer' }}>ProBoost</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {[
              { label: 'Tableau de bord', href: '/dashboard', active: false },
              { label: 'Importer', href: '/dashboard/importer', active: false },
              { label: 'Facturation', href: '/dashboard/facturation', active: true },
              { label: 'Paramètres', href: '/dashboard/settings', active: false },
            ].map(item => (
              <div key={item.label} className="sidebar-link"
                onClick={() => window.location.href = item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: item.active ? '#a855f7' : '#6B7280', fontSize: 14, fontWeight: item.active ? 600 : 400, background: item.active ? 'rgba(168,85,247,0.08)' : 'transparent' }}>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ borderTop: '1px solid #EAECEF', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

        {/* CONTENU */}
        <div style={{ marginLeft: 240, flex: 1, padding: '32px 32px' }}>

          <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 4 }}>Facturation</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Récapitulatif des commissions ProBoost sur vos factures recouvrées</p>
          </div>

          {/* Bandeau plan actuel */}
          <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeUp 0.4s ease 0.05s both', boxShadow: '0 4px 24px rgba(168,85,247,0.30)' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Votre plan actuel</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>{currentPlan.nom}</span>
                <span style={{ background: 'rgba(255,255,255,0.20)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{currentPlan.prix}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                Commission : <strong style={{ color: 'white' }}>{(currentPlan.taux * 100).toFixed(0)}%</strong> au succès (minimum 5 €)
                &nbsp;·&nbsp; {currentPlan.desc}
              </p>
            </div>
            <button onClick={() => window.location.href = '/souscrire'}
              style={{ background: 'white', color: '#7c3aed', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.10)' }}>
              Changer de plan →
            </button>
          </div>

          {/* 3 stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div className="card" style={{ background: 'white', borderRadius: 14, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Total recouvré</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: '#a855f7', lineHeight: 1 }}>{totalRecouvre.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                <span style={{ fontSize: 15, color: '#a855f7', fontWeight: 700 }}>€</span>
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>{factures.length} facture{factures.length > 1 ? 's' : ''} payée{factures.length > 1 ? 's' : ''}</p>
            </div>
            <div className="card" style={{ background: 'white', borderRadius: 14, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Commission ProBoost ({(currentPlan.taux * 100).toFixed(0)}%)</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: '#ec4899', lineHeight: 1 }}>{totalCommission.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                <span style={{ fontSize: 15, color: '#ec4899', fontWeight: 700 }}>€</span>
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>Minimum 5 € par facture</p>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 14, padding: '22px 20px', boxShadow: '0 4px 20px rgba(168,85,247,0.30)', border: 'none' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Montant net perçu</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: 'white', lineHeight: 1 }}>{totalNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>€</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)' }}>Ce que vous encaissez</p>
            </div>
          </div>

          {/* Tableau ou état vide */}
          {factures.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '48px 32px', textAlign: 'center', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 8 }}>Aucune facture payée pour l'instant</h3>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Les commissions apparaîtront ici dès qu'une facture sera marquée comme payée</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#111' }}>Détail par facture</h2>
                <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6F8', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{factures.length} facture{factures.length > 1 ? 's' : ''}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Client', 'N° Facture', 'Montant TTC', `Commission (${(currentPlan.taux * 100).toFixed(0)}%)`, 'Net perçu', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f, i) => {
                    const montant = Number(f.montant)
                    const commission = calcCommission(montant)
                    const net = montant - commission
                    const isMin = commission === COMMISSION_MIN
                    return (
                      <tr key={f.id} className="row-hover" style={{ borderBottom: i < factures.length - 1 ? '1px solid #F3F4F6' : 'none', background: 'white' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7' }}>{f.client_nom?.[0]?.toUpperCase()}</span>
                            </div>
                            <span style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{f.client_nom}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13 }}>{f.numero_facture || '—'}</td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111', fontSize: 14, fontFamily: 'Manrope, sans-serif' }}>
                          {montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ background: 'rgba(236,72,153,0.10)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.20)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                              − {commission.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                            </span>
                            {isMin && <span style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>min 5 €</span>}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: 'rgba(168,85,247,0.10)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                            {net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13 }}>
                          {new Date(f.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F9FAFB', borderTop: '2px solid #EAECEF' }}>
                    <td colSpan={2} style={{ padding: '14px 20px', fontWeight: 700, color: '#111', fontSize: 13, fontFamily: 'Manrope, sans-serif' }}>TOTAL</td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: '#111', fontSize: 15, fontFamily: 'Manrope, sans-serif' }}>
                      {totalRecouvre.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: 'rgba(236,72,153,0.10)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.20)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                        − {totalCommission.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: 'rgba(168,85,247,0.10)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                        {totalNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
