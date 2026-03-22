'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../lib/supabase'

type Mode = null | 'csv' | 'pdf'

type FacturePreview = {
  raison_sociale?: string
  adresse?: string
  email_facturation?: string
  telephone?: string
  numero_facture?: string
  date_facture?: string
  date_echeance?: string
  montant_total?: string
  montant_restant?: string
  nom?: string
  client_nom?: string
  email?: string
  client_email?: string
  client_telephone?: string
  montant?: string
  fichier?: string
  erreur?: boolean
  doublonWarning?: boolean
}

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/dashboard', active: false },
  { label: 'Importer', href: '/dashboard/importer', active: true },
  { label: 'Facturation', href: '/dashboard/facturation', active: false },
  { label: 'Paramètres', href: '/dashboard/settings', active: false },
]

export default function ImporterPage() {
  const [mode, setMode] = useState<Mode>(null)
  const [factures, setFactures] = useState<FacturePreview[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const cancelRef = useRef(false)
  const [profile, setProfile] = useState<any>(null)
  const [facturesCeMois, setFacturesCeMois] = useState(0)
  const [numerosExistants, setNumerosExistants] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const debutMois = new Date(); debutMois.setDate(1); debutMois.setHours(0, 0, 0, 0)
      const { count } = await supabase.from('factures').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', debutMois.toISOString())
      setFacturesCeMois(count || 0)
      const { data: facturesExistantes } = await supabase.from('factures').select('numero_facture').eq('user_id', user.id)
      setNumerosExistants((facturesExistantes || []).map((f: any) => f.numero_facture).filter(Boolean))
    }
    loadData()
  }, [])

  const getLimiteFactures = () => {
    if (profile?.plan === 'pro') return 200
    if (profile?.plan === 'premium') return 50
    return 10
  }

  const limiteAtteinte = getLimiteFactures() !== Infinity && facturesCeMois >= getLimiteFactures()
  const placesRestantes = getLimiteFactures() === Infinity ? Infinity : Math.max(0, getLimiteFactures() - facturesCeMois)

  const getFirstRelanceDate = (dateEcheance: string): Date => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const echeance = new Date(dateEcheance); echeance.setHours(0, 0, 0, 0)
    const j1 = 7
    const limitePassee = new Date(today); limitePassee.setDate(limitePassee.getDate() - j1)
    if (echeance <= limitePassee) return today
    const d = new Date(echeance); d.setDate(d.getDate() + j1)
    return d
  }

  const isDublon = (numeroFacture: string | undefined) => {
    if (!numeroFacture) return false
    return numerosExistants.includes(numeroFacture)
  }

  const downloadTemplate = () => {
    const headers = 'raison_sociale,adresse,email_facturation,telephone,numero_facture,date_facture,date_echeance,montant_total,montant_restant'
    const example = 'SARL Dupont,12 rue de la Paix 75001 Paris,compta@dupont.fr,0600000000,FACT-2024-001,2024-11-01,2024-12-31,5000.00,3500.00'
    const blob = new Blob([headers + '\n' + example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'template-manaflow.csv'; a.click()
  }

  const exporterCSV = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('factures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (!data) return
    const rows = [
      ['N° Facture', 'Raison sociale', 'Adresse', 'Email', 'Téléphone', 'Date facture', 'Échéance', 'Montant total', 'Montant restant', 'Statut', 'Relances effectuées', 'Canal relance', 'Séquence active', 'Prochaine relance'].join(','),
      ...(data as any[]).map(f => [
        f.numero_facture || '', f.client_nom || '', f.adresse || '', f.client_email || '',
        f.client_telephone || '', f.date_facture || '', f.date_echeance || '',
        f.montant_total || f.montant || '', f.montant_restant || f.montant || '',
        f.statut || '', f.nombre_relances || 0, f.canal_relance || 'email',
        f.sequence_active ? 'Oui' : 'Non',
        f.next_relance_date ? new Date(f.next_relance_date).toLocaleDateString('fr-FR') : '—',
      ].map(v => `"${v}"`).join(','))
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `export-manaflow-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const rows: FacturePreview[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const obj: any = {}
        headers.forEach((h, i) => { obj[h] = values[i] })
        return obj
      }).filter(r => r.raison_sociale || r.nom || r.client_nom)
      const marques = rows.map(r => ({ ...r, doublonWarning: isDublon(r.numero_facture) }))
      const limitees = placesRestantes === Infinity ? marques : marques.slice(0, placesRestantes)
      if (rows.length > limitees.length) setMessage(`Seulement ${placesRestantes} facture${placesRestantes > 1 ? 's' : ''} importable${placesRestantes > 1 ? 's' : ''} ce mois-ci`)
      setFactures(limitees)
    }
    reader.readAsText(file)
  }

  const analyserPDFs = async () => {
    if (files.length === 0) return
    setLoading(true); setMessage('')
    cancelRef.current = false
    setProgress({ done: 0, total: files.length })

    const resultats: FacturePreview[] = []
    const BATCH = 5

    for (let i = 0; i < files.length; i += BATCH) {
      if (cancelRef.current) break
      const batch = files.slice(i, i + BATCH)
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          const formData = new FormData(); formData.append('pdf', file)
          try {
            const res = await fetch('/api/analyser-pdf', { method: 'POST', body: formData })
            const data = await res.json()
            return { ...data, fichier: file.name, doublonWarning: isDublon(data.numero_facture) }
          } catch {
            return { fichier: file.name, erreur: true }
          }
        })
      )
      resultats.push(...batchResults)
      setProgress({ done: Math.min(i + BATCH, files.length), total: files.length })
    }

    const valides = resultats.filter(f => !f.erreur)
    const limitees = [...resultats.filter(f => f.erreur), ...valides.slice(0, placesRestantes)]
    setFactures(limitees)
    setProgress(null)
    setLoading(false)
  }

  const annulerAnalyse = () => {
    cancelRef.current = true
    setLoading(false)
    setProgress(null)
    setMessage('Analyse annulée.')
  }

  const importerFactures = async () => {
    if (limiteAtteinte) { setMessage(`Limite de ${getLimiteFactures()} factures/mois atteinte`); return }
    const doublons = factures.filter(f => f.doublonWarning && !f.erreur)
    if (doublons.length > 0) { setMessage(`Impossible d'importer : ${doublons.length} numéro(s) déjà existant(s). Corrigez avant d'importer.`); return }
    setImporting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    const valides = factures.filter(f => !f.erreur && !f.doublonWarning)
    const rows = valides.map(f => {
      const dateEcheance = f.date_echeance || ''
      const nextRelanceDate = getFirstRelanceDate(dateEcheance)
      return {
        client_nom: f.raison_sociale || f.client_nom || f.nom,
        client_email: f.email_facturation || f.client_email || f.email,
        client_telephone: f.telephone || f.client_telephone,
        adresse: f.adresse,
        numero_facture: f.numero_facture,
        date_facture: f.date_facture,
        montant_total: parseFloat(f.montant_total || f.montant || '0'),
        montant_restant: parseFloat(f.montant_restant || f.montant || '0'),
        montant: parseFloat(f.montant_restant || f.montant_total || f.montant || '0'),
        date_echeance: dateEcheance,
        statut: 'impayée',
        nombre_relances: 0,
        sequence_active: false,
        sequence_started_at: null,
        next_relance_date: nextRelanceDate.toISOString(),
      }
    })

    // Import via API (validation limite côté serveur)
    const res = await fetch('/api/import-factures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ rows }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Erreur lors de l\'import')
      setImporting(false)
      return
    }
    const msg = data.skipped > 0
      ? `${data.inserted} facture${data.inserted > 1 ? 's' : ''} importée${data.inserted > 1 ? 's' : ''} · ${data.skipped} ignorée${data.skipped > 1 ? 's' : ''} (limite mensuelle)`
      : 'Factures importées avec succès !'
    setMessage(msg)
    setTimeout(() => window.location.href = '/dashboard', 1500)
    setImporting(false)
  }

  const resetMode = () => { setMode(null); setFactures([]); setFiles([]); setFileName(''); setMessage('') }
  const hasDublon = factures.some(f => f.doublonWarning && !f.erreur)
  const pctMois = getLimiteFactures() === Infinity ? 0 : Math.min(100, (facturesCeMois / getLimiteFactures()) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(168,85,247,0.08) !important; color: #a855f7 !important; }
        .mode-card { transition: all 0.2s; cursor: pointer; border: 2px solid #E5E7EB; border-radius: 18px; padding: 24px; background: white; }
        .mode-card:hover { border-color: #a855f7; box-shadow: 0 4px 24px rgba(168,85,247,0.12); transform: translateY(-2px); }
        .mode-card.disabled { opacity: 0.5; cursor: not-allowed; }
        .drop-zone { border: 2px dashed rgba(168,85,247,0.25); border-radius: 14px; padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(168,85,247,0.03); }
        .drop-zone:hover { border-color: #a855f7; background: rgba(168,85,247,0.06); }
        .row-dublon { background: #FFF7ED !important; }
        .btn-import { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; transition: all 0.2s; box-shadow: 0 4px 16px rgba(168,85,247,0.35); }
        .btn-import:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-import:disabled { background: #F3F4F6; color: #9CA3AF; cursor: not-allowed; box-shadow: none; }
        .export-btn { transition: all 0.15s; }
        .export-btn:hover { background: rgba(168,85,247,0.08) !important; border-color: #a855f7 !important; color: #7c3aed !important; }
        .step-num { width: 30px; height: 30px; background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #a855f7; font-size: 13px; flex-shrink: 0; }
        .desktop-sidebar { display: flex; }
        .mobile-topbar { display: none; }
        .sidebar-overlay { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 76px 16px 24px !important; }
          .header-top { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .header-right { width: 100%; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }
          .mode-grid { grid-template-columns: 1fr !important; }
          .step-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .step-row-btn { width: 100% !important; }
          .banner-row { flex-direction: column !important; gap: 10px !important; align-items: flex-start !important; }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 299; }
          .mobile-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 300; background: white; animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid #EAECEF; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* SIDEBAR DESKTOP */}
        <aside className="desktop-sidebar" style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 8px', marginBottom: 36 }}>
            <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span onClick={() => window.location.href = '/'} style={{ fontSize: 22, color: '#111', cursor: 'pointer' }}><span style={{ fontFamily: "'Yeseva One', serif" }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.label} className="sidebar-link" onClick={() => window.location.href = item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: item.active ? '#a855f7' : '#6B7280', fontSize: 14, fontWeight: item.active ? 600 : 400, background: item.active ? 'rgba(168,85,247,0.08)' : 'transparent' }}>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* SIDEBAR MOBILE */}
        {sidebarOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            <div className="mobile-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 14 }}>P</span>
                  </div>
                  <span style={{ fontSize: 22, color: '#111' }}><span style={{ fontFamily: "'Yeseva One', serif" }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 400 }}>flow</span></span>
                </div>
                <button onClick={() => setSidebarOpen(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>×</button>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_ITEMS.map(item => (
                  <div key={item.label} className="sidebar-link" onClick={() => { window.location.href = item.href; setSidebarOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', color: item.active ? '#a855f7' : '#6B7280', fontSize: 15, fontWeight: item.active ? 600 : 400, background: item.active ? 'rgba(168,85,247,0.08)' : 'transparent' }}>
                    {item.label}
                  </div>
                ))}
              </nav>
            </div>
          </>
        )}

        {/* TOPBAR MOBILE */}
        <div className="mobile-topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'white', borderBottom: '1px solid #EAECEF', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 16, color: '#111' }}>Importer</span>
          <button className="export-btn" onClick={exporterCSV}
            style={{ background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Export CSV
          </button>
        </div>

        {/* MAIN */}
        <div className="main-content" style={{ marginLeft: isMobile ? 0 : 240, flex: 1, padding: isMobile ? '76px 16px 24px' : '32px 32px' }}>

          {/* HEADER */}
          <div className="header-top" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {mode && (
                <button onClick={resetMode} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>← Retour</button>
              )}
              <div>
                <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: isMobile ? 20 : 24, color: '#111', marginBottom: 3 }}>
                  {mode === null ? 'Importer des factures' : mode === 'csv' ? 'Import CSV' : 'Import PDF par IA'}
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>
                  {mode === null ? "Choisissez votre méthode d'import" : mode === 'csv' ? 'Remplissez le template et importez votre fichier' : "L'IA extrait automatiquement les informations"}
                </p>
              </div>
            </div>

            {/* Desktop only — export + compteur */}
            {!isMobile && (
              <div className="header-right" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <button className="export-btn" onClick={exporterCSV}
                  style={{ background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                  Exporter tout en CSV
                </button>
                {profile && (
                  <div style={{ background: limiteAtteinte ? '#FEF2F2' : 'white', border: `1px solid ${limiteAtteinte ? '#FECACA' : '#EAECEF'}`, borderRadius: 12, padding: '10px 16px', textAlign: 'right', minWidth: 130 }}>
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Ce mois</p>
                    <p style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 18, color: limiteAtteinte ? '#DC2626' : '#111' }}>
                      {facturesCeMois}
                      {getLimiteFactures() !== Infinity && <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>/{getLimiteFactures()}</span>}
                      {profile?.plan === 'pro' && <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 500 }}> /200</span>}
                    </p>
                    {getLimiteFactures() !== Infinity && (
                      <div style={{ marginTop: 6, height: 3, background: '#F3F4F6', borderRadius: 2, width: 100 }}>
                        <div style={{ height: '100%', borderRadius: 2, width: `${pctMois}%`, background: limiteAtteinte ? '#DC2626' : 'linear-gradient(135deg, #a855f7, #ec4899)', transition: 'width 0.3s' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile — compteur compact */}
            {isMobile && profile && (
              <div style={{ background: limiteAtteinte ? '#FEF2F2' : 'white', border: `1px solid ${limiteAtteinte ? '#FECACA' : '#EAECEF'}`, borderRadius: 10, padding: '8px 12px', textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Ce mois</p>
                <p style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 15, color: limiteAtteinte ? '#DC2626' : '#111' }}>
                  {facturesCeMois}{getLimiteFactures() !== Infinity && <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>/{getLimiteFactures()}</span>}
                </p>
              </div>
            )}
          </div>

          {/* BANNERS */}
          {limiteAtteinte && (
            <div className="banner-row" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>Limite atteinte — passez au plan supérieur.</p>
              <button onClick={() => window.location.href = '/souscrire'} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Changer →</button>
            </div>
          )}

          {!limiteAtteinte && getLimiteFactures() !== Infinity && facturesCeMois >= getLimiteFactures() * 0.8 && (
            <div className="banner-row" style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#EA580C' }}>Il reste <strong>{placesRestantes}</strong> facture{placesRestantes > 1 ? 's' : ''} ce mois-ci</p>
              <button onClick={() => window.location.href = '/souscrire'} style={{ background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Upgrader →</button>
            </div>
          )}

          {hasDublon && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#EA580C', marginBottom: 3 }}>Doublons détectés</p>
              <p style={{ fontSize: 13, color: '#92400E' }}>Les lignes en orange contiennent un numéro déjà présent. Corrigez avant d'importer.</p>
            </div>
          )}

          {mode !== null && !limiteAtteinte && (
            <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>Après l'import, activez les relances depuis le tableau de bord.</p>
            </div>
          )}

          {/* CHOIX MODE */}
          {mode === null && (
            <div className="mode-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, maxWidth: 680, animation: 'fadeUp 0.4s ease 0.1s both' }}>
              <div className={`mode-card${limiteAtteinte ? ' disabled' : ''}`} onClick={() => !limiteAtteinte && setMode('csv')}>
                <div style={{ width: 44, height: 44, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 6 }}>Import CSV</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>Téléchargez notre template, remplissez-le et importez-le en un clic.</p>
                <span style={{ fontSize: 12, background: 'rgba(168,85,247,0.10)', color: '#7c3aed', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>Simple et rapide</span>
              </div>
              <div className={`mode-card${limiteAtteinte ? ' disabled' : ''}`} onClick={() => !limiteAtteinte && setMode('pdf')}>
                <div style={{ width: 44, height: 44, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 6 }}>Import PDF par IA</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>Déposez vos factures PDF et l'IA détecte automatiquement toutes les informations.</p>
                <span style={{ fontSize: 12, background: 'rgba(236,72,153,0.10)', color: '#be185d', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>Zéro saisie manuelle</span>
              </div>
            </div>
          )}

          {/* CSV */}
          {mode === 'csv' && (
            <div style={{ maxWidth: 960, animation: 'fadeUp 0.3s ease both' }}>
              {/* Étape 1 */}
              <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #EAECEF', marginBottom: 10 }}>
                <div className="step-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="step-num">1</div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111', marginBottom: 2, fontSize: 14 }}>Téléchargez le template CSV</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>Raison sociale, adresse, email, téléphone, n° facture, dates, montants</p>
                    </div>
                  </div>
                  <button className="step-row-btn" onClick={downloadTemplate} style={{ background: 'rgba(168,85,247,0.08)', color: '#7c3aed', border: '1.5px solid rgba(168,85,247,0.25)', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                    Télécharger le template
                  </button>
                </div>
              </div>

              {/* Étape 2 */}
              <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #EAECEF', marginBottom: 16 }}>
                <div className="step-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="step-num">2</div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111', marginBottom: 2, fontSize: 14 }}>Importez votre fichier rempli</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {fileName ? <span style={{ color: '#a855f7', fontWeight: 600 }}>{fileName} ✓</span> : 'Format CSV uniquement'}
                        {placesRestantes !== Infinity && <span style={{ color: '#EA580C' }}> — {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}</span>}
                      </p>
                    </div>
                  </div>
                  <label className="step-row-btn" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(168,85,247,0.30)', display: 'inline-block' }}>
                    Choisir un fichier
                    <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {factures.length > 0 && (
                <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #EAECEF' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="step-num">3</div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>Vérifiez avant d'importer</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{factures.length} factures{hasDublon ? ` — ${factures.filter(f => f.doublonWarning).length} doublon(s)` : ''}</p>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Raison sociale', 'Email', 'N° Facture', 'Échéance', 'Montant total', 'Restant', '1ère relance'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {factures.map((f, i) => {
                          const firstRelance = f.date_echeance ? getFirstRelanceDate(f.date_echeance) : null
                          const isToday = firstRelance?.toDateString() === new Date().toDateString()
                          return (
                            <tr key={i} className={f.doublonWarning ? 'row-dublon' : ''} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111', fontSize: 12, whiteSpace: 'nowrap' }}>{f.raison_sociale || f.client_nom || f.nom}</td>
                              <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{f.email_facturation || f.email || f.client_email || '—'}</td>
                              <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                                {f.doublonWarning
                                  ? <span style={{ color: '#EA580C', fontWeight: 700 }}>{f.numero_facture} ⚠</span>
                                  : <span style={{ color: '#111', fontWeight: 600 }}>{f.numero_facture || '—'}</span>}
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{f.date_echeance || '—'}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111', fontSize: 12, whiteSpace: 'nowrap' }}>{f.montant_total ? `${parseFloat(f.montant_total).toFixed(2)} €` : '—'}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#a855f7', fontSize: 12, whiteSpace: 'nowrap' }}>{f.montant_restant ? `${parseFloat(f.montant_restant).toFixed(2)} €` : '—'}</td>
                              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                {firstRelance
                                  ? <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? '#DC2626' : '#16A34A' }}>{isToday ? "Aujourd'hui" : firstRelance.toLocaleDateString('fr-FR')}</span>
                                  : <span style={{ color: '#9CA3AF' }}>—</span>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #EAECEF' }}>
                    {message && (
                      <div style={{ background: message.includes('succès') ? 'rgba(168,85,247,0.08)' : '#FEF2F2', border: `1px solid ${message.includes('succès') ? 'rgba(168,85,247,0.25)' : '#FECACA'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                        <p style={{ color: message.includes('succès') ? '#7c3aed' : '#DC2626', fontSize: 13, fontWeight: 600 }}>{message}</p>
                      </div>
                    )}
                    <button className="btn-import" onClick={importerFactures} disabled={importing || limiteAtteinte || hasDublon}>
                      {importing ? 'Import en cours...' : hasDublon ? "Corrigez les doublons avant d'importer" : limiteAtteinte ? 'Limite atteinte' : `Importer ${factures.filter(f => !f.doublonWarning).length} facture${factures.filter(f => !f.doublonWarning).length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF */}
          {mode === 'pdf' && (
            <div style={{ maxWidth: 800, animation: 'fadeUp 0.3s ease both' }}>
              <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #EAECEF', marginBottom: 16 }}>
                <label className="drop-zone" style={{ display: 'block' }}>
                  <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                  <div style={{ width: 48, height: 48, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <p style={{ fontWeight: 600, color: '#111', fontSize: 15, marginBottom: 4 }}>Cliquez ou glissez vos PDFs ici</p>
                  <p style={{ color: '#9CA3AF', fontSize: 13 }}>Plusieurs fichiers acceptés — l'IA lit chaque facture automatiquement</p>
                </label>
                {files.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}</p>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 8, marginBottom: 5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span style={{ fontSize: 13, color: '#111' }}>{f.name}</span>
                      </div>
                    ))}
                    {/* Barre de progression */}
                    {progress && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                            {progress.done} / {progress.total} PDFs analysés
                          </span>
                          <button onClick={annulerAnalyse} style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                            Annuler
                          </button>
                        </div>
                        <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #a855f7, #ec4899)', width: `${Math.round(progress.done / progress.total * 100)}%`, transition: 'width 0.3s ease' }} />
                        </div>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                          ~{Math.max(1, Math.ceil((progress.total - progress.done) / 5 * 5))}s restantes
                        </p>
                      </div>
                    )}

                    {!progress && (
                      <button className="btn-import" onClick={analyserPDFs} disabled={loading} style={{ marginTop: 14 }}>
                        {loading ? 'Analyse en cours...' : `Analyser ${files.length} PDF${files.length > 1 ? 's' : ''} avec l'IA`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {factures.length > 0 && (
                <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #EAECEF' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #EAECEF' }}>
                    <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 14, color: '#111' }}>Résultats de l'analyse</h2>
                  </div>
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Fichier', 'Client', 'N° Facture', 'Total', 'Restant', 'Échéance'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {factures.map((f, i) => (
                          <tr key={i} className={f.doublonWarning ? 'row-dublon' : ''} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{f.fichier}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111', fontSize: 12 }}>{f.erreur ? 'Erreur' : (f.raison_sociale || f.client_nom)}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12 }}>
                              {f.doublonWarning ? <span style={{ color: '#EA580C', fontWeight: 700 }}>{f.numero_facture} ⚠</span> : <span style={{ color: '#111' }}>{f.numero_facture || '—'}</span>}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111', fontSize: 12 }}>{f.montant_total ? `${f.montant_total} €` : f.montant ? `${f.montant} €` : '—'}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#a855f7', fontSize: 12 }}>{f.montant_restant ? `${f.montant_restant} €` : '—'}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{f.date_echeance || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #EAECEF' }}>
                    {message && (
                      <div style={{ background: message.includes('succès') ? 'rgba(168,85,247,0.08)' : '#FEF2F2', border: `1px solid ${message.includes('succès') ? 'rgba(168,85,247,0.25)' : '#FECACA'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                        <p style={{ color: message.includes('succès') ? '#7c3aed' : '#DC2626', fontSize: 13, fontWeight: 600 }}>{message}</p>
                      </div>
                    )}
                    <button className="btn-import" onClick={importerFactures} disabled={importing || limiteAtteinte || hasDublon}>
                      {importing ? 'Import en cours...' : hasDublon ? "Corrigez les doublons avant d'importer" : limiteAtteinte ? 'Limite atteinte' : `Importer ${factures.filter(f => !f.erreur && !f.doublonWarning).length} facture${factures.filter(f => !f.erreur && !f.doublonWarning).length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
