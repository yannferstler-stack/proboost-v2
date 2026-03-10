'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canaux, setCanaux] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data } = await supabase.from('factures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setFactures(data || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const isPro = profile?.plan === 'pro'
  const isPremiumOrPro = profile?.plan === 'premium' || profile?.plan === 'pro'

  const getLimiteRelances = () => {
    if (profile?.plan === 'starter') return 3
    return 5
  }

  const getCanalForFacture = (factureId: string) => {
    return canaux[factureId] || profile?.canal_relance || 'email'
  }

  const stats = {
    total: factures.length,
    impayees: factures.filter(f => f.statut === 'impayée').length,
    montantTotal: factures.filter(f => f.statut === 'impayée').reduce((sum, f) => sum + Number(f.montant), 0),
    payees: factures.filter(f => f.statut === 'payée').length,
    montantRecupere: factures.filter(f => f.statut === 'payée').reduce((sum, f) => sum + Number(f.montant), 0),
  }

  const getStatutBadge = (statut: string) => {
    const config: any = {
      impayée: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Impayée' },
      relancée: { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'En cours' },
      payée: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'Payée' },
    }
    return config[statut] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', label: statut }
  }

  const getDelais = () => [
    profile?.sequence_j1 || 7,
    profile?.sequence_j2 || 15,
    profile?.sequence_j3 || 30,
    ...(profile?.sequence_j4 ? [profile.sequence_j4] : []),
    ...(profile?.sequence_j5 ? [profile.sequence_j5] : []),
  ]

  const getFirstRelanceDate = (facture: any): Date => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const echeance = new Date(facture.date_echeance)
    echeance.setHours(0, 0, 0, 0)
    const delais = getDelais()
    const j1 = delais[0] // 7 par défaut

    // Si échéance dépassée depuis plus de J1 jours → aujourd'hui
    const limitePassee = new Date(today)
    limitePassee.setDate(limitePassee.getDate() - j1)

    if (echeance <= limitePassee) {
      return today // envoi immédiat
    } else {
      // Échéance récente ou future → échéance + J1
      const d = new Date(echeance)
      d.setDate(d.getDate() + j1)
      return d
    }
  }

  const getNextRelanceDate = (facture: any) => {
    if (!facture.sequence_active) return null
    const delais = getDelais()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nbRelances = facture.nombre_relances || 0

    if (nbRelances === 0) {
      // Pas encore de relance envoyée → calcul depuis échéance
      return { date: getFirstRelanceDate(facture), index: 0 }
    }

    // Relances suivantes : depuis la date de première relance + délais restants
    const firstDate = getFirstRelanceDate(facture)
    for (let i = nbRelances; i < delais.length; i++) {
      // Chaque relance suivante = firstDate + (delais[i] - delais[0]) jours
      const date = new Date(firstDate)
      date.setDate(date.getDate() + (delais[i] - delais[0]))
      if (date >= today) return { date, index: i }
    }

    return null
  }

  const handleActiverSequence = async (facture: any) => {
    const limite = getLimiteRelances()
    if ((facture.nombre_relances || 0) >= limite) return

    const now = new Date().toISOString()
    const nextDate = getFirstRelanceDate(facture)

    const { error } = await supabase.from('factures').update({
      sequence_active: true,
      sequence_started_at: now,
      next_relance_date: nextDate.toISOString(),
    }).eq('id', facture.id)

    if (!error) {
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, sequence_active: true, sequence_started_at: now, next_relance_date: nextDate.toISOString() }
          : f
      ))
    }
  }

  const handleStopperSequence = async (facture: any) => {
    const { error } = await supabase.from('factures').update({
      sequence_active: false,
      next_relance_date: null,
    }).eq('id', facture.id)

    if (!error) {
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, sequence_active: false, next_relance_date: null }
          : f
      ))
    }
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important; }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .row-hover:hover { background: #F9FAFB !important; }
        .btn-main:hover { background: #18a34a !important; transform: translateY(-1px); }
        .btn-main { transition: all 0.15s; }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(29,185,84,0.08) !important; color: #1DB954 !important; }
        .canal-btn { transition: all 0.15s; border: 1.5px solid #D1D5DB; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; background: white; color: #6B7280; font-family: Inter, sans-serif; font-weight: 500; }
        .canal-btn.active { border-color: #1DB954; background: #F0FDF4; color: #15803d; font-weight: 600; }
        .canal-btn.disabled { opacity: 0.45; cursor: not-allowed; color: #6B7280; }
        .canal-btn:hover:not(.disabled):not(.active) { border-color: #9CA3AF; background: #F9FAFB; }
        .tooltip-wrap { position: relative; display: inline-block; }
        .tooltip-wrap .tooltip { visibility: hidden; position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%); background: #111; color: white; font-size: 11px; padding: 5px 9px; border-radius: 6px; white-space: nowrap; z-index: 10; }
        .tooltip-wrap:hover .tooltip { visibility: visible; }
        .toggle-wrap { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        .toggle { width: 36px; height: 20px; border-radius: 10px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .toggle-knob { width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 3px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .btn-activer { background: #1DB954; color: white; border: none; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: Inter, sans-serif; white-space: nowrap; transition: all 0.15s; }
        .btn-activer:hover { background: #18a34a; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16 }}>P</span>
            </div>
            <span onClick={() => window.location.href = '/'} style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#111', cursor: 'pointer' }}>ProBoost</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#1DB954', fontSize: 14, fontWeight: 600, background: 'rgba(29,185,84,0.12)' }}>
              <span>📊</span> Tableau de bord
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/importer'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>📥</span> Importer
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/facturation'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>💰</span> Facturation
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/settings'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>⚙️</span> Paramètres
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

        {/* MAIN */}
        <div style={{ marginLeft: 240, flex: 1, padding: '32px 24px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, animation: 'fadeUp 0.4s ease both' }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 4 }}>Tableau de bord</h1>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Bienvenue 👋 — voici l'état de vos factures</p>
            </div>
            <button className="btn-main" onClick={() => window.location.href = '/dashboard/importer'}
              style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              + Importer des factures
            </button>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            {[
              { label: 'Total factures', value: stats.total, unit: '', icon: '📄', accent: '#3B82F6', bg: '#EFF6FF', highlight: false },
              { label: 'Impayées', value: stats.impayees, unit: '', icon: '⏳', accent: '#DC2626', bg: '#FEF2F2', highlight: false },
              { label: 'Montant dû', value: stats.montantTotal.toLocaleString('fr-FR'), unit: '€', icon: '💸', accent: '#EA580C', bg: '#FFF7ED', highlight: false },
              { label: 'Payées', value: stats.payees, unit: '', icon: '✅', accent: '#16A34A', bg: '#F0FDF4', highlight: false },
              { label: 'Récupéré', value: stats.montantRecupere.toLocaleString('fr-FR'), unit: '€', icon: '🏆', accent: 'white', bg: 'rgba(255,255,255,0.2)', highlight: true },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                background: s.highlight ? 'linear-gradient(135deg, #1DB954, #15803d)' : 'white',
                borderRadius: 14, padding: '22px 20px',
                boxShadow: s.highlight ? '0 4px 20px rgba(29,185,84,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                border: s.highlight ? 'none' : '1px solid #EAECEF'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: s.highlight ? 'rgba(255,255,255,0.8)' : '#6B7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</p>
                  <div style={{ width: 32, height: 32, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: s.highlight ? 'white' : s.accent, lineHeight: 1 }}>{s.value}</span>
                  {s.unit && <span style={{ fontSize: 16, color: s.highlight ? 'white' : s.accent, fontWeight: 700 }}>{s.unit}</span>}
                </div>
                {s.highlight && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 500 }}>grâce à ProBoost 💚</p>
                )}
              </div>
            ))}
          </div>

          {/* BANNER setup société */}
          {!profile?.company_name && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, color: '#EA580C' }}>⚠️ Renseignez le nom de votre société pour personnaliser vos relances</p>
              <button onClick={() => window.location.href = '/dashboard/settings'}
                style={{ background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Configurer →
              </button>
            </div>
          )}

          {/* BANNER upsell SMS pour non-Pro */}
          {!isPro && (
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, color: 'white' }}>📱 Les relances SMS multiplient les taux de recouvrement — disponibles en <strong>Plan Pro</strong></p>
              <button onClick={() => window.location.href = '/pricing'}
                style={{ background: 'white', color: '#7C3AED', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Passer Pro →
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
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

          {/* TABLE FACTURES */}
          {factures.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Mes factures</h2>
                <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6F8', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>{factures.length} facture{factures.length > 1 ? 's' : ''}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Client', 'Montant', 'Échéance', 'Statut', 'Canal', 'Séquence de relance'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f, i) => {
                    const canal = getCanalForFacture(f.id)
                    const badge = getStatutBadge(f.statut)
                    const nextRelance = getNextRelanceDate(f)
                    const limite = getLimiteRelances()
                    const nbRelances = f.nombre_relances || 0
                    const limiteAtteinte = nbRelances >= limite

                    return (
                      <tr key={f.id} className="row-hover" style={{ borderBottom: i < factures.length - 1 ? '1px solid #F3F4F6' : 'none', background: 'white' }}>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6' }}>{f.client_nom?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: '#111', fontSize: 13, whiteSpace: 'nowrap' }}>{f.client_nom}</p>
                              {f.numero_facture && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{f.numero_facture}</p>}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111', fontSize: 14, fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>
                          {Number(f.montant).toLocaleString('fr-FR')} €
                        </td>

                        <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: badge.bg, color: badge.color,
                            border: `1.5px solid ${badge.border}`,
                            borderRadius: 8, padding: '4px 12px',
                            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'
                          }}>
                            {badge.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {f.statut !== 'payée' && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className={`canal-btn${canal === 'email' ? ' active' : ''}`} onClick={() => setCanaux(prev => ({ ...prev, [f.id]: 'email' }))}>Email</button>
                              <div className="tooltip-wrap">
                                <button className={`canal-btn${canal === 'sms' ? ' active' : ''}${!isPro ? ' disabled' : ''}`} onClick={() => isPro && setCanaux(prev => ({ ...prev, [f.id]: 'sms' }))}>SMS</button>
                                {!isPro && <span className="tooltip">Plan Pro requis</span>}
                              </div>
                              <div className="tooltip-wrap">
                                <button className={`canal-btn${canal === 'both' ? ' active' : ''}${!isPro ? ' disabled' : ''}`} onClick={() => isPro && setCanaux(prev => ({ ...prev, [f.id]: 'both' }))}>Les 2</button>
                                {!isPro && <span className="tooltip">Plan Pro requis</span>}
                              </div>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {f.statut === 'payée' ? (
                            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✓ Soldée</span>
                          ) : limiteAtteinte ? (
                            <div>
                              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
                                🔒 Limite atteinte ({nbRelances}/{limite})
                              </span>
                              {!isPremiumOrPro && (
                                <p style={{ fontSize: 11, color: '#7C3AED', cursor: 'pointer', marginTop: 2, fontWeight: 600 }}
                                  onClick={() => window.location.href = '/pricing'}>
                                  Passer Premium pour +2 relances →
                                </p>
                              )}
                            </div>
                          ) : f.sequence_active ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1DB954', animation: 'pulse 1.5s infinite' }} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                                    Active ({nbRelances}/{limite})
                                  </span>
                                </div>
                                {nextRelance && (
                                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                                    {nextRelance.date.toDateString() === new Date().toDateString()
                                      ? 'Envoi aujourd\'hui'
                                      : `Prochaine : ${nextRelance.date.toLocaleDateString('fr-FR')}`
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="toggle-wrap" onClick={() => handleStopperSequence(f)} title="Stopper la séquence">
                                <div className="toggle" style={{ background: '#1DB954' }}>
                                  <div className="toggle-knob" style={{ left: 18 }} />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <button className="btn-activer" onClick={() => handleActiverSequence(f)}>
                                ▶ Démarrer la séquence
                              </button>
                              {nbRelances > 0 && (
                                <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                                  En pause · {nbRelances}/{limite} envoyées
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
