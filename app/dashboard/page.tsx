'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'
import { getEmailContent } from '../lib/email-templates'
import { DashboardSidebar } from '../components/DashboardSidebar'

type Relance = {
  date: string
  type: 'email' | 'sms'
  numero: number
}

type Facture = {
  id: string
  client_nom: string
  client_email?: string
  client_telephone?: string
  numero_facture: string
  montant: number
  date_echeance: string
  statut: string
  sequence_active: boolean
  sequence_started_at: string | null
  next_relance_date: string | null
  nombre_relances: number
  relances_history?: Relance[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [factures, setFactures] = useState<Facture[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canaux, setCanaux] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'date' | 'relances' | 'ouvertes' | 'recouvrees'>('date')
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null)
  const [historyFacture, setHistoryFacture] = useState<Facture | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [realHistory, setRealHistory] = useState<Record<string, any[]>>({})
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [previewFacture, setPreviewFacture] = useState<Facture | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [displayCount, setDisplayCount] = useState(20)
  const [relancingId, setRelancingId] = useState<string | null>(null)
  const [relanceMsg, setRelanceMsg] = useState<{ id: string; ok: boolean } | null>(null)
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)
  const [welcome, setWelcome] = useState<{ prenom: string; euros: number; isNew: boolean } | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data } = await supabase.from('factures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setFactures(data || [])
      setLoading(false)

      // Message de bienvenue personnalisé
      const totalActuel = (data || []).filter((f: any) => f.statut === 'payée').reduce((s: number, f: any) => s + (f.montant || 0), 0)
      const key = `manaflow_last_total_${user.id}`
      const lastTotal = parseFloat(typeof window !== 'undefined' ? (localStorage.getItem(key) || '0') : '0')
      const diff = Math.max(0, totalActuel - lastTotal)
      if (typeof window !== 'undefined') localStorage.setItem(key, String(totalActuel))
      const rawPrenom = (profileData?.full_name || user.email || '').split(/[@\s]/)[0]
      const prenom = rawPrenom.charAt(0).toUpperCase() + rawPrenom.slice(1).toLowerCase()
      setWelcome({ prenom, euros: diff, isNew: lastTotal === 0 && totalActuel === 0 })
      setShowWelcome(true)
    }
    getUser()
  }, [])

  // Afficher le modal d'onboarding à la première visite
  useEffect(() => {
    if (!loading) {
      const done = typeof window !== 'undefined' && localStorage.getItem('manaflow_onboarding_done')
      if (!done) setShowOnboarding(true)
    }
  }, [loading])

  // Réinitialiser la pagination quand le tri change
  useEffect(() => { setDisplayCount(20) }, [sortBy])

  // Charger l'historique réel quand on ouvre le modal
  useEffect(() => {
    if (!historyFacture) return
    if (realHistory[historyFacture.id]) return // déjà chargé
    setLoadingHistory(true)
    supabase
      .from('relances')
      .select('*')
      .eq('facture_id', historyFacture.id)
      .order('envoye_le', { ascending: true })
      .then(({ data }: { data: any }) => {
        if (data) {
          setRealHistory(prev => ({ ...prev, [historyFacture.id]: data }))
        }
        setLoadingHistory(false)
      })
  }, [historyFacture])

  const isPro = profile?.plan === 'pro'
  const isPremiumOrPro = profile?.plan === 'premium' || profile?.plan === 'pro'
  const getLimiteRelances = () => profile?.plan === 'starter' ? 3 : 5
  const getCanalForFacture = (factureId: string) => canaux[factureId] || profile?.canal_relance || 'email'

  const totalRelances = factures.reduce((sum, f) => sum + (f.nombre_relances || 0), 0)
  const totalFactures = factures.length
  const montantRecupere = factures.filter(f => f.statut === 'payée').reduce((sum, f) => sum + Number(f.montant), 0)

  const getSortedFactures = () => {
    const copy = [...factures]
    if (sortBy === 'relances') return copy.sort((a, b) => (b.nombre_relances || 0) - (a.nombre_relances || 0))
    if (sortBy === 'ouvertes') return copy.filter(f => f.statut !== 'payée').concat(copy.filter(f => f.statut === 'payée'))
    if (sortBy === 'recouvrees') return copy.filter(f => f.statut === 'payée').concat(copy.filter(f => f.statut !== 'payée'))
    return copy
  }

  const getStatutBadge = (statut: string) => {
    const config: any = {
      impayée: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Impayée' },
      relancée: { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'En cours' },
      payée: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'Recouvrée' },
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

  const getFirstRelanceDate = (facture: Facture): Date => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const echeance = new Date(facture.date_echeance); echeance.setHours(0, 0, 0, 0)
    const delais = getDelais()
    const j1 = delais[0]
    const limitePassee = new Date(today); limitePassee.setDate(limitePassee.getDate() - j1)
    if (echeance <= limitePassee) return today
    const d = new Date(echeance); d.setDate(d.getDate() + j1)
    return d
  }

  const getNextRelanceDate = (facture: Facture) => {
    if (!facture.sequence_active) return null
    const delais = getDelais()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const nbRelances = facture.nombre_relances || 0
    if (nbRelances === 0) return { date: getFirstRelanceDate(facture), index: 0 }
    const firstDate = getFirstRelanceDate(facture)
    for (let i = nbRelances; i < delais.length; i++) {
      const date = new Date(firstDate)
      date.setDate(date.getDate() + (delais[i] - delais[0]))
      if (date >= today) return { date, index: i }
    }
    return null
  }

  const handleActiverSequence = async (facture: Facture) => {
    const limite = getLimiteRelances()
    if ((facture.nombre_relances || 0) >= limite) return
    const now = new Date().toISOString()
    const nextDate = getFirstRelanceDate(facture)
    const { error } = await supabase.from('factures').update({
      sequence_active: true, sequence_started_at: now, next_relance_date: nextDate.toISOString(),
    }).eq('id', facture.id)
    if (!error) setFactures(prev => prev.map(f => f.id === facture.id ? { ...f, sequence_active: true, sequence_started_at: now, next_relance_date: nextDate.toISOString() } : f))
  }

  const handleStopperSequence = async (facture: Facture) => {
    const { error } = await supabase.from('factures').update({ sequence_active: false, next_relance_date: null }).eq('id', facture.id)
    if (!error) setFactures(prev => prev.map(f => f.id === facture.id ? { ...f, sequence_active: false, next_relance_date: null } : f))
  }

  const handleSupprimerFacture = async (factureId: string) => {
    const { error } = await supabase.from('factures').delete().eq('id', factureId)
    if (!error) {
      setFactures(prev => prev.filter(f => f.id !== factureId))
      setConfirmDelete(null)
    }
  }

  const getEmailPreviewContent = (facture: Facture) => {
    const numeroRelance = (facture.nombre_relances || 0) + 1
    return getEmailContent({
      clientNom: facture.client_nom,
      montant: facture.montant,
      dateEcheance: facture.date_echeance,
      numeroFacture: facture.numero_facture || '',
      companyName: profile?.company_name || 'Votre société',
      companyAddress: profile?.company_address || '',
      companyPhone: profile?.company_phone || '',
      numeroRelance,
    })
  }

  const getMockHistory = (facture: Facture): Relance[] => {
    const nb = facture.nombre_relances || 0
    const types: ('email' | 'sms')[] = ['email', 'sms', 'email', 'email', 'sms']
    const history: Relance[] = []
    const base = new Date(facture.date_echeance)
    const delais = getDelais()
    for (let i = 0; i < nb; i++) {
      const d = new Date(base)
      d.setDate(d.getDate() + (delais[i] || 7 * (i + 1)))
      history.push({ date: d.toISOString(), type: isPro ? types[i % types.length] : 'email', numero: i + 1 })
    }
    return history
  }

  const handleExportCSV = () => {
    if (factures.length === 0) return
    const rows = [
      ['N° Facture', 'Client', 'Email', 'Téléphone', 'Montant (€)', 'Échéance', 'Statut', 'Relances', 'Séquence active', 'Prochaine relance'].join(','),
      ...factures.map(f => [
        f.numero_facture || '', f.client_nom || '', f.client_email || '',
        f.client_telephone || '', f.montant || '', f.date_echeance || '',
        f.statut || '', f.nombre_relances || 0,
        f.sequence_active ? 'Oui' : 'Non',
        f.next_relance_date ? new Date(f.next_relance_date).toLocaleDateString('fr-FR') : '—',
      ].map(v => `"${v}"`).join(','))
    ]
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `manaflow-factures-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleMarquerPayee = async (facture: Facture) => {
    setMarkingPaidId(facture.id)
    try {
      const res = await fetch('/api/marquer-payee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factureId: facture.id, userId: user?.id }),
      })
      if (res.ok) {
        setFactures(prev => prev.map(f => f.id === facture.id
          ? { ...f, statut: 'payée', sequence_active: false, next_relance_date: null }
          : f
        ))
      }
    } catch {}
    setMarkingPaidId(null)
  }

  const handleRelancerMaintenant = async (facture: Facture) => {
    if (!facture.client_email) { setRelanceMsg({ id: facture.id, ok: false }); setTimeout(() => setRelanceMsg(null), 3000); return }
    setRelancingId(facture.id)
    try {
      const res = await fetch('/api/relancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureId: facture.id,
          clientEmail: facture.client_email,
          clientNom: facture.client_nom,
          clientTelephone: facture.client_telephone,
          montant: facture.montant,
          dateEcheance: facture.date_echeance,
          nombreRelances: facture.nombre_relances || 0,
          numeroFacture: facture.numero_facture,
          companyName: profile?.company_name,
          companyAddress: profile?.company_address,
          companyPhone: profile?.company_phone,
          typeRelance: getCanalForFacture(facture.id),
          userId: user?.id,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setFactures(prev => prev.map(f => f.id === facture.id
          ? { ...f, nombre_relances: data.numeroRelance, statut: 'relancée' }
          : f
        ))
        setRelanceMsg({ id: facture.id, ok: true })
      } else {
        setRelanceMsg({ id: facture.id, ok: false })
      }
    } catch {
      setRelanceMsg({ id: facture.id, ok: false })
    }
    setRelancingId(null)
    setTimeout(() => setRelanceMsg(null), 3000)
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } } .sk { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }`}</style>
      {/* Sidebar skeleton — hidden on mobile */}
      {!isMobile && (
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', padding: '24px 16px', flexShrink: 0 }}>
          <div className="sk" style={{ height: 36, width: 120, marginBottom: 36 }} />
          {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 36, borderRadius: 10, marginBottom: 8 }} />)}
        </aside>
      )}
      {/* Main skeleton */}
      <div className="dash-main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div className="sk" style={{ height: 28, width: 180 }} />
          <div className="sk" style={{ height: 40, width: 160, borderRadius: 10 }} />
        </div>
        {/* Stats */}
        <div className="dash-grid-3">
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EAECEF' }}>
              <div className="sk" style={{ height: 12, width: 100, marginBottom: 16 }} />
              <div className="sk" style={{ height: 40, width: 80, marginBottom: 8 }} />
              <div className="sk" style={{ height: 10, width: 120 }} />
            </div>
          ))}
        </div>
        {/* Table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EAECEF', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #EAECEF' }}>
            <div className="sk" style={{ height: 16, width: 80 }} />
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 20, padding: '16px 24px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
              <div className="sk" style={{ height: 14, width: 100 }} />
              <div className="sk" style={{ height: 14, width: 70 }} />
              <div className="sk" style={{ height: 14, width: 90 }} />
              <div className="sk" style={{ height: 24, width: 70, borderRadius: 20 }} />
              <div className="sk" style={{ height: 14, width: 60 }} />
              <div className="sk" style={{ height: 14, flex: 1 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const sortedFactures = getSortedFactures()
  const factureToDelete = factures.find(f => f.id === confirmDelete)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.10) !important; }
        .row-hover { transition: background 0.12s; cursor: pointer; }
        .row-hover:hover { background: #FAFAFA !important; }
        .btn-main { transition: all 0.15s; background: linear-gradient(135deg, #a855f7, #ec4899); }
        .btn-main:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168,85,247,0.35) !important; }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
        .canal-btn { transition: all 0.15s; border: 1.5px solid #D1D5DB; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; background: white; color: #6B7280; font-family: Inter, sans-serif; font-weight: 500; }
        .canal-btn.active { border-color: #a855f7; background: #F5F3FF; color: #7c3aed; font-weight: 600; }
        .canal-btn.disabled { opacity: 0.45; cursor: not-allowed; }
        .canal-btn:hover:not(.disabled):not(.active) { border-color: #9CA3AF; background: #F9FAFB; }
        .tooltip-wrap { position: relative; display: inline-block; }
        .tooltip-wrap .tooltip { visibility: hidden; position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%); background: #111; color: white; font-size: 11px; padding: 5px 9px; border-radius: 6px; white-space: nowrap; z-index: 10; }
        .tooltip-wrap:hover .tooltip { visibility: visible; }
        .toggle { width: 36px; height: 20px; border-radius: 10px; position: relative; transition: background 0.2s; flex-shrink: 0; cursor: pointer; }
        .toggle-knob { width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 3px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .btn-activer { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: Inter, sans-serif; white-space: nowrap; transition: all 0.15s; box-shadow: 0 2px 10px rgba(168,85,247,0.30); }
        .btn-activer:hover { opacity: 0.9; transform: translateY(-1px); }
        .sort-btn { border: 1.5px solid #E5E7EB; background: white; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 500; color: #6B7280; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; }
        .sort-btn.active { border-color: #a855f7; background: #F5F3FF; color: #7c3aed; font-weight: 600; }
        .sort-btn:hover:not(.active) { border-color: #9CA3AF; background: #F9FAFB; }
        .btn-delete { background: none; border: none; cursor: pointer; color: #D1D5DB; font-size: 18px; padding: 4px 6px; border-radius: 6px; transition: all 0.15s; line-height: 1; }
        .btn-delete:hover { color: #EF4444; background: #FEF2F2; }
        .btn-paid { background: none; border: 1px solid #BBF7D0; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; color: #16A34A; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; white-space: nowrap; }
        .btn-paid:hover:not(:disabled) { background: #F0FDF4; border-color: #16A34A; }
        .btn-paid:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-load-more { background: white; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 9px 20px; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; }
        .btn-load-more:hover { border-color: #a855f7; color: #7c3aed; background: #F5F3FF; }
        .btn-export { background: white; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 9px 16px; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; }
        .btn-export:hover { border-color: #a855f7; color: #7c3aed; background: #F5F3FF; }
        .btn-relay { background: none; border: 1px solid #DDD6FE; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #7c3aed; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; white-space: nowrap; }
        .btn-relay:hover:not(:disabled) { background: #F5F3FF; border-color: #a855f7; }
        .btn-relay:disabled { opacity: 0.5; cursor: not-allowed; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal { background: white; border-radius: 20px; padding: 32px; max-width: 520px; width: 90%; animation: modalIn 0.2s ease; max-height: 80vh; overflow-y: auto; }
        .modal-confirm { background: white; border-radius: 16px; padding: 28px; max-width: 400px; width: 90%; animation: modalIn 0.2s ease; }
        .history-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .history-row:last-child { border-bottom: none; }
        .badge-type { border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        <DashboardSidebar user={user} title="Tableau de bord" />

        {/* MAIN */}
        <div className="dash-main">

          {/* BANDEAU BIENVENUE */}
          {showWelcome && welcome && (
            <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.10), rgba(236,72,153,0.08))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeUp 0.4s ease both', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>👋</span>
                <div>
                  <p style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>
                    Bon retour, {welcome.prenom} !
                  </p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                    {welcome.euros > 0
                      ? <>Depuis votre dernière visite, vous avez récupéré <strong style={{ color: '#a855f7' }}>{welcome.euros.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong> supplémentaires 🎉</>
                      : welcome.isNew
                        ? <>Bienvenue sur ManaFlow — importez vos premières factures pour commencer le recouvrement.</>
                        : <>Aucun nouveau recouvrement depuis votre dernière visite — continuez à importer vos factures.</>
                    }
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWelcome(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18, lineHeight: 1, padding: '4px', flexShrink: 0 }}>×</button>
            </div>
          )}

          {/* HEADER */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 0, marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 24, color: '#111' }}>Tableau de bord</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {factures.length > 0 && (
                <button className="btn-export" onClick={handleExportCSV}>
                  ↓ Exporter CSV
                </button>
              )}
              <button className="btn-main" onClick={() => router.push('/dashboard/importer')}
                style={{ color: 'white', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(168,85,247,0.35)' }}>
                + Importer des factures
              </button>
            </div>
          </div>

          {/* BANNIÈRE STRIPE CONNECT */}
          {!profile?.stripe_connect_account_id && (
            <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1.5px solid #f59e0b', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, animation: 'fadeUp 0.4s ease 0.05s both' }}>
              <div style={{ width: 40, height: 40, background: '#f59e0b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                ⚡
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2, fontFamily: 'Comfortaa, sans-serif' }}>
                  Activez les paiements en ligne
                </p>
                <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>
                  Connectez Stripe pour permettre à vos clients de payer directement depuis l'email de relance.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Configurer →
              </button>
            </div>
          )}

          {/* STATS */}
          <div className="dash-grid-3" style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Relances effectuées</p>
              <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 36, color: '#a855f7' }}>{totalRelances}</span>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>emails + SMS cumulés</p>
            </div>
            <div className="card" style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Total factures</p>
              <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 36, color: '#ec4899' }}>{totalFactures}</span>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>factures importées</p>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(168,85,247,0.30)', border: 'none' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Montant récupéré</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 36, color: 'white' }}>{montantRecupere.toLocaleString('fr-FR')}</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>€</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>grâce à ManaFlow</p>
            </div>
          </div>

          {/* BANNERS */}
          {!profile?.company_name && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: '#EA580C', flex: 1, minWidth: 160 }}>Renseignez le nom de votre société pour personnaliser vos relances</p>
              <button onClick={() => router.push('/dashboard/settings')}
                style={{ background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Configurer →
              </button>
            </div>
          )}

          {!isPro && (
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: 'white', flex: 1, minWidth: 160 }}>Les relances SMS multiplient les taux de recouvrement — disponibles en <strong>Plan Pro</strong></p>
              <button onClick={() => router.push('/souscrire?plan=pro')}
                style={{ background: 'white', color: '#7c3aed', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Passer Pro →
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {factures.length === 0 && (
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, padding: isMobile ? '24px 20px' : '32px 36px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 24px rgba(168,85,247,0.30)' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Commencez maintenant</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Importez votre premier fichier CSV et automatisez vos relances</p>
              </div>
              <button onClick={() => router.push('/dashboard/importer')}
                style={{ background: 'white', color: '#a855f7', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Importer maintenant
              </button>
            </div>
          )}

          {/* TABLE */}
          {factures.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111' }}>Factures</h2>
                  <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6F8', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{factures.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF', marginRight: 4 }}>Trier par</span>
                  {([
                    { key: 'date', label: 'Date' },
                    { key: 'relances', label: 'Nb relances' },
                    { key: 'ouvertes', label: 'Ouvertes' },
                    { key: 'recouvrees', label: 'Recouvrées' },
                  ] as const).map(s => (
                    <button key={s.key} className={`sort-btn${sortBy === s.key ? ' active' : ''}`} onClick={() => setSortBy(s.key)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['N° Facture', 'Montant', 'Échéance', 'Statut', 'Canal', 'Relances', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedFactures.slice(0, displayCount).map((f, i) => {
                    const canal = getCanalForFacture(f.id)
                    const badge = getStatutBadge(f.statut)
                    const nextRelance = getNextRelanceDate(f)
                    const limite = getLimiteRelances()
                    const nbRelances = f.nombre_relances || 0
                    const limiteAtteinte = nbRelances >= limite
                    const visibleCount = Math.min(sortedFactures.length, displayCount)

                    return (
                      <tr key={f.id} className="row-hover"
                        onClick={() => setSelectedFacture(f)}
                        style={{ borderBottom: i < visibleCount - 1 ? '1px solid #F3F4F6' : 'none', background: 'white' }}>

                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 700, color: '#111', fontSize: 13, fontFamily: 'Comfortaa, sans-serif' }}>{f.numero_facture || '—'}</span>
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{f.client_nom}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111', fontSize: 14, fontFamily: 'Comfortaa, sans-serif', whiteSpace: 'nowrap' }}>
                          {Number(f.montant).toLocaleString('fr-FR')} €
                        </td>

                        <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}`, borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {badge.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
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

                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          {f.statut === 'payée' ? (
                            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Soldée</span>
                          ) : limiteAtteinte ? (
                            <div>
                              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Limite atteinte ({nbRelances}/{limite})</span>
                              {!isPremiumOrPro && (
                                <p style={{ fontSize: 11, color: '#a855f7', cursor: 'pointer', marginTop: 2, fontWeight: 600 }} onClick={() => router.push('/souscrire')}>
                                  Passer Premium →
                                </p>
                              )}
                            </div>
                          ) : f.sequence_active ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a855f7', animation: 'pulse 1.5s infinite' }} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>Active ({nbRelances}/{limite})</span>
                                </div>
                                {nextRelance && (
                                  <p style={{ fontSize: 11, color: '#9CA3AF', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={(e) => { e.stopPropagation(); setHistoryFacture(f) }}>
                                    {nextRelance.date.toDateString() === new Date().toDateString() ? "Envoi aujourd'hui" : `Prochaine : ${nextRelance.date.toLocaleDateString('fr-FR')}`}
                                  </p>
                                )}
                              </div>
                              <div className="toggle" style={{ background: '#a855f7' }} onClick={() => handleStopperSequence(f)}>
                                <div className="toggle-knob" style={{ left: 18 }} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <button className="btn-activer" onClick={() => handleActiverSequence(f)}>Commencer</button>
                              {nbRelances > 0 && (
                                <span style={{ fontSize: 11, color: '#9CA3AF', cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={(e) => { e.stopPropagation(); setHistoryFacture(f) }}>
                                  En pause · {nbRelances}/{limite} — voir historique
                                </span>
                              )}
                              <button
                                className="btn-relay"
                                disabled={relancingId === f.id}
                                onClick={(e) => { e.stopPropagation(); handleRelancerMaintenant(f) }}>
                                {relancingId === f.id ? '⏳ Envoi...' : relanceMsg?.id === f.id ? (relanceMsg.ok ? '✓ Envoyée' : '✗ Erreur') : '⚡ Relancer'}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* SUPPRIMER + MARQUER PAYÉE */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                            {f.statut !== 'payée' && (
                              <button
                                className="btn-paid"
                                disabled={markingPaidId === f.id}
                                onClick={() => handleMarquerPayee(f)}
                                title="Marquer comme payée">
                                {markingPaidId === f.id ? '⏳' : '✓ Payée'}
                              </button>
                            )}
                            <button className="btn-delete" onClick={() => setConfirmDelete(f.id)} title="Supprimer cette facture">
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
              {sortedFactures.length > displayCount && (
                <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #F3F4F6' }}>
                  <button className="btn-load-more" onClick={() => setDisplayCount(c => c + 20)}>
                    Charger {Math.min(20, sortedFactures.length - displayCount)} facture{Math.min(20, sortedFactures.length - displayCount) > 1 ? 's' : ''} de plus
                    <span style={{ color: '#9CA3AF', fontWeight: 400 }}> · {sortedFactures.length - displayCount} restante{sortedFactures.length - displayCount > 1 ? 's' : ''}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete && factureToDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-confirm" onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
              🗑️
            </div>
            <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 18, color: '#111', textAlign: 'center', marginBottom: 8 }}>
              Supprimer cette facture ?
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 6, lineHeight: 1.6 }}>
              <strong>{factureToDelete.numero_facture || 'Facture'}</strong> — {factureToDelete.client_nom}
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 }}>
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Annuler
              </button>
              <button onClick={() => handleSupprimerFacture(confirmDelete)}
                style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL FACTURE */}
      {selectedFacture && (
        <div className="overlay" onClick={() => setSelectedFacture(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 4 }}>
                  {selectedFacture.numero_facture || 'Facture'}
                </h2>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>Détails de la facture</span>
              </div>
              <button onClick={() => setSelectedFacture(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Client', value: selectedFacture.client_nom },
                { label: 'N° Facture', value: selectedFacture.numero_facture || '—' },
                { label: 'Montant', value: `${Number(selectedFacture.montant).toLocaleString('fr-FR')} €` },
                { label: 'Échéance', value: new Date(selectedFacture.date_echeance).toLocaleDateString('fr-FR') },
                { label: 'Statut', value: getStatutBadge(selectedFacture.statut).label },
                { label: 'Relances envoyées', value: `${selectedFacture.nombre_relances || 0} / ${getLimiteRelances()}` },
              ].map((row, i) => (
                <div key={i} style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{row.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{row.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => { setHistoryFacture(selectedFacture); setSelectedFacture(null) }}
                style={{ flex: 1, background: '#F5F3FF', color: '#7c3aed', border: '1.5px solid #DDD6FE', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Historique →
              </button>
              {selectedFacture.statut !== 'payée' && (
                <button onClick={() => { setPreviewFacture(selectedFacture); setSelectedFacture(null) }}
                  style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #BBF7D0', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Prévisualiser l&apos;email →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRÉVISUALISATION EMAIL */}
      {previewFacture && (() => {
        const { subject, html } = getEmailPreviewContent(previewFacture)
        const numeroRelance = (previewFacture.nombre_relances || 0) + 1
        return (
          <div className="overlay" onClick={() => setPreviewFacture(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 660, padding: '0' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '20px 20px 0 0' }}>
                <div>
                  <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, color: '#111', marginBottom: 2 }}>
                    Prévisualisation — Relance #{numeroRelance}
                  </h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{previewFacture.numero_facture} · {previewFacture.client_nom}</p>
                </div>
                <button onClick={() => setPreviewFacture(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>×</button>
              </div>
              {/* Sujet */}
              <div style={{ padding: '12px 24px', background: '#F9FAFB', borderBottom: '1px solid #EAECEF' }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 8 }}>Objet :</span>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{subject}</span>
              </div>
              {/* Corps email */}
              <div style={{ height: 440, overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
                <iframe
                  srcDoc={html}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  title="Prévisualisation email"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL HISTORIQUE RELANCES */}
      {historyFacture && (
        <div className="overlay" onClick={() => setHistoryFacture(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 4 }}>
                  Historique des relances
                </h2>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>{historyFacture.numero_facture} · {historyFacture.client_nom}</span>
              </div>
              <button onClick={() => setHistoryFacture(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>×</button>
            </div>
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 20 }}>
              <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>{historyFacture.nombre_relances || 0} relances envoyées</span>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>Limite : {getLimiteRelances()}</span>
            </div>
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #E0E0E0', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : (() => {
              const rows = realHistory[historyFacture.id]?.length
                ? realHistory[historyFacture.id].map((r, i) => ({
                    date: r.envoye_le,
                    type: r.type === 'sms' ? 'sms' : 'email',
                    numero: r.numero_relance || i + 1,
                    statut: r.statut || 'envoyé',
                  }))
                : getMockHistory(historyFacture)
              return rows.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>Aucune relance envoyée pour cette facture.</p>
              ) : rows.map((r, i) => (
                <div key={i} className="history-row">
                  <div style={{ width: 32, height: 32, background: r.type === 'sms' ? '#F5F3FF' : '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>{r.type === 'sms' ? '📱' : '✉️'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Relance #{r.numero}</span>
                      <span className="badge-type" style={{ background: r.type === 'sms' ? '#F5F3FF' : '#F0FDF4', color: r.type === 'sms' ? '#7c3aed' : '#16A34A' }}>
                        {r.type === 'sms' ? 'SMS' : 'Email'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: (r as any).statut === 'erreur' ? '#EF4444' : '#16A34A' }}>
                    {(r as any).statut === 'erreur' ? 'Erreur' : 'Envoyée'}
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}
      {/* MODAL ONBOARDING */}
      {showOnboarding && (
        <div className="overlay" onClick={() => { setShowOnboarding(false); localStorage.setItem('manaflow_onboarding_done', '1') }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>🚀</div>
            <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, color: '#111', marginBottom: 8 }}>
              Bienvenue sur ManaFlow !
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
              3 étapes pour automatiser votre recouvrement
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left' }}>
              {[
                { n: '1', icon: '📂', title: 'Importez vos factures', desc: 'Glissez un CSV ou des PDF — ManaFlow extrait tout automatiquement', color: '#F5F3FF', border: '#DDD6FE', text: '#7c3aed' },
                { n: '2', icon: '⚡', title: 'Activez les relances auto', desc: 'Pour chaque facture impayée, cliquez "Commencer" — les emails partent seuls', color: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
                { n: '3', icon: '📊', title: 'Suivez vos recouvrements', desc: 'Consultez le tableau de bord pour voir les paiements encaissés', color: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: step.color, border: `1.5px solid ${step.border}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ width: 36, height: 36, background: step.border, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {step.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: step.text, marginBottom: 2 }}>{step.title}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowOnboarding(false); localStorage.setItem('manaflow_onboarding_done', '1'); router.push('/dashboard/settings') }}
                style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Configurer d&apos;abord
              </button>
              <button
                onClick={() => { setShowOnboarding(false); localStorage.setItem('manaflow_onboarding_done', '1'); router.push('/dashboard/importer') }}
                className="btn-main"
                style={{ flex: 1, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Importer mes factures →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

