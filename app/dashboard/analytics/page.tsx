'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase
        .from('factures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFactures(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  // --- Stats ---
  const total = factures.length
  const payees = factures.filter(f => f.statut === 'payée')
  const ouvertes = factures.filter(f => f.statut !== 'payée')

  const taux = total > 0 ? Math.round((payees.length / total) * 100) : 0
  const montantRecouvre = payees.reduce((s, f) => s + Number(f.montant), 0)
  const montantOuvert = ouvertes.reduce((s, f) => s + Number(f.montant), 0)

  // Délai moyen : jours entre date_echeance et created_at (proxy date de paiement)
  const delais = payees
    .filter(f => f.date_echeance && f.created_at)
    .map(f => Math.round(
      (new Date(f.created_at).getTime() - new Date(f.date_echeance).getTime())
      / (1000 * 60 * 60 * 24)
    ))
  const delaiMoyen = delais.length > 0
    ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length)
    : 0

  // --- Graphique 6 derniers mois ---
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      montant: 0,
    }
  })
  payees.forEach(f => {
    if (!f.created_at) return
    const d = new Date(f.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const m = months.find(m => m.key === key)
    if (m) m.montant += Number(f.montant)
  })
  const maxBar = Math.max(...months.map(m => m.montant), 1)

  // --- Top 5 clients impayés ---
  const top5 = [...ouvertes].sort((a, b) => Number(b.montant) - Number(a.montant)).slice(0, 5)

  // --- SVG arc ---
  const R = 45
  const CIRC = 2 * Math.PI * R
  const arcLen = (CIRC * taux) / 100

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
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.10) !important; }
        .row-hover:hover { background: #FAFAFA !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 8px', marginBottom: 36 }}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span onClick={() => window.location.href = '/'} style={{ fontSize: 22, color: '#111', cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700 }}>Mana</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}>flow</span>
            </span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {[
              { label: 'Tableau de bord', href: '/dashboard', active: false },
              { label: 'Analytics', href: '/dashboard/analytics', active: true },
              { label: 'Importer', href: '/dashboard/importer', active: false },
              { label: 'Facturation', href: '/dashboard/facturation', active: false },
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
        <div style={{ marginLeft: 240, flex: 1, padding: '32px 32px', minWidth: 0 }}>

          {/* HEADER */}
          <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 4 }}>Analytics</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Suivi de vos performances de recouvrement</p>
          </div>

          {total === 0 ? (
            /* État vide */
            <div style={{ background: 'white', borderRadius: 16, padding: '64px 32px', textAlign: 'center', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.05s both' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
                📈
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 20, color: '#111', marginBottom: 10 }}>Aucune donnée pour l'instant</h3>
              <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 24 }}>Importez des factures pour voir vos statistiques de recouvrement</p>
              <button onClick={() => window.location.href = '/dashboard/importer'}
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Importer des factures →
              </button>
            </div>
          ) : (
            <>
              {/* LIGNE 1 : 3 stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24, animation: 'fadeUp 0.4s ease 0.05s both' }}>

                {/* Taux de recouvrement + arc SVG */}
                <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: 16 }}>Taux de recouvrement</p>
                  <svg width="128" height="128" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r={R} fill="none" stroke="#F3F4F6" strokeWidth="10" />
                    {taux > 0 && (
                      <circle cx="50" cy="50" r={R} fill="none" stroke="url(#arcGrad)" strokeWidth="10"
                        strokeDasharray={`${arcLen} ${CIRC - arcLen}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    )}
                    <text x="50" y="47" textAnchor="middle" fontSize="20" fontWeight="800" fill="#111" fontFamily="Manrope, sans-serif">{taux}%</text>
                    <text x="50" y="61" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter, sans-serif">{payees.length} / {total} factures</text>
                  </svg>
                </div>

                {/* Délai moyen */}
                <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20 }}>Délai moyen de paiement</p>
                  {payees.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#C4C9D4', marginTop: 8 }}>Aucune facture payée</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                        <span style={{
                          fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 52,
                          color: delaiMoyen > 30 ? '#DC2626' : delaiMoyen > 14 ? '#EA580C' : '#16A34A',
                          lineHeight: 1,
                        }}>
                          {Math.abs(delaiMoyen)}
                        </span>
                        <span style={{ fontSize: 18, color: '#6B7280', fontWeight: 600 }}>j</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                        {delaiMoyen < 0 ? 'avant' : 'après'} l'échéance en moyenne
                      </p>
                      <div style={{ marginTop: 14, display: 'inline-block', background: delaiMoyen > 30 ? '#FEF2F2' : delaiMoyen > 14 ? '#FFF7ED' : '#F0FDF4', borderRadius: 8, padding: '4px 10px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: delaiMoyen > 30 ? '#DC2626' : delaiMoyen > 14 ? '#EA580C' : '#16A34A' }}>
                          {delaiMoyen > 30 ? '⚠️ Retards fréquents' : delaiMoyen > 14 ? '🟡 Retards modérés' : '✅ Paiements rapides'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Montant total récupéré */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(168,85,247,0.30)', border: 'none' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20 }}>Montant récupéré</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 38, color: 'white', lineHeight: 1 }}>
                      {montantRecouvre.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}
                    </span>
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>€</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>
                    sur {(montantRecouvre + montantOuvert).toLocaleString('fr-FR')} € au total
                  </p>
                  {montantOuvert > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
                        💡 {montantOuvert.toLocaleString('fr-FR')} € restent à recouvrer
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* LIGNE 2 : Graphique + Top 5 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'fadeUp 0.4s ease 0.10s both' }}>

                {/* Graphique mensuel */}
                <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 24 }}>Montant récupéré — 6 derniers mois</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                    {months.map(m => {
                      const barH = m.montant > 0 ? Math.max(10, Math.round((m.montant / maxBar) * 108)) : 4
                      return (
                        <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 0 }}>
                          {m.montant > 0 && (
                            <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500, marginBottom: 3, textAlign: 'center' }}>
                              {m.montant >= 1000
                                ? `${(m.montant / 1000).toFixed(1).replace('.0', '')}k€`
                                : `${Math.round(m.montant)}€`}
                            </span>
                          )}
                          <div style={{
                            width: '100%',
                            height: barH,
                            background: m.montant > 0 ? 'linear-gradient(180deg, #a855f7 0%, #ec4899 100%)' : '#F3F4F6',
                            borderRadius: '5px 5px 0 0',
                          }} />
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {months.map(m => (
                      <div key={m.key} style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'capitalize' }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 clients impayés */}
                <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top clients impayés</p>
                    {montantOuvert > 0 && (
                      <span style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                        {montantOuvert.toLocaleString('fr-FR')} €
                      </span>
                    )}
                  </div>
                  {top5.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <p style={{ fontSize: 28, marginBottom: 10 }}>🎉</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>Aucune facture impayée !</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>Toutes vos factures sont réglées</p>
                    </div>
                  ) : (
                    <div>
                      {top5.map((f, i) => (
                        <div key={f.id} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderBottom: i < top5.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div style={{
                            width: 26, height: 26, flexShrink: 0,
                            background: i === 0 ? 'rgba(220,38,38,0.10)' : i === 1 ? 'rgba(234,88,12,0.08)' : 'rgba(107,114,128,0.08)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            color: i === 0 ? '#DC2626' : i === 1 ? '#EA580C' : '#9CA3AF',
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {f.client_nom}
                            </p>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                              {f.numero_facture ? `Facture ${f.numero_facture}` : 'Sans référence'}
                              {f.date_echeance ? ` · éch. ${new Date(f.date_echeance).toLocaleDateString('fr-FR')}` : ''}
                            </p>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>
                            {Number(f.montant).toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      ))}
                      {ouvertes.length > 5 && (
                        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingTop: 12 }}>
                          + {ouvertes.length - 5} autre{ouvertes.length - 5 > 1 ? 's' : ''} client{ouvertes.length - 5 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
