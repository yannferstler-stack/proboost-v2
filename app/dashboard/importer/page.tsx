'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { DashboardSidebar } from '../../components/DashboardSidebar'

type Mode = null | 'csv' | 'pdf' | 'fec'

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
  erreurMessage?: string
  doublonWarning?: boolean
}

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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [facturesCeMois, setFacturesCeMois] = useState(0)
  const [numerosExistants, setNumerosExistants] = useState<string[]>([])
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
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const user = session.user
      setUser(user)
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
    const j1 = 3
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
    const example = 'SARL Dupont,12 rue de la Paix 75001 Paris,compta@dupont.fr,0600000000,FACT-2026-001,2026-01-15,2026-02-28,5000.00,3500.00'
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

  const REQUIRED_CSV_COLUMNS = ['raison_sociale', 'email_facturation', 'numero_facture', 'date_echeance', 'montant_total']

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setMessage('Le fichier CSV est vide ou ne contient pas de données.'); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      // ── Validation des colonnes obligatoires ──
      const manquantes = REQUIRED_CSV_COLUMNS.filter(col => !headers.includes(col))
      if (manquantes.length > 0) {
        setMessage(`Colonnes manquantes dans le CSV : ${manquantes.join(', ')}. Téléchargez le modèle pour voir le format attendu.`)
        setFactures([])
        return
      }
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

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? ''

    const resultats: FacturePreview[] = []
    const BATCH = 5

    for (let i = 0; i < files.length; i += BATCH) {
      if (cancelRef.current) break
      const batch = files.slice(i, i + BATCH)
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          const formData = new FormData(); formData.append('pdf', file)
          try {
            const res = await fetch('/api/analyser-pdf', {
              method: 'POST',
              body: formData,
              headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok || data.error) {
              return { fichier: file.name, erreur: true, erreurMessage: data.error || 'Erreur inconnue' }
            }
            const email = data.client_email || data.email_facturation || data.email || null
            if (!email) {
              return { ...data, fichier: file.name, erreur: true, erreurMessage: 'Email client manquant' }
            }
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
    const erreurs = resultats.filter(f => f.erreur)
    const limitees = [...erreurs, ...valides.slice(0, placesRestantes)]
    setFactures(limitees)
    setProgress(null)
    setLoading(false)
    // Bannière d'erreur si tous les PDFs ont échoué
    if (erreurs.length > 0 && valides.length === 0) {
      const firstMsg = erreurs[0]?.erreurMessage || 'Erreur inconnue'
      setMessage(`Analyse échouée : ${firstMsg}`)
    } else if (erreurs.length > 0) {
      setMessage(`${erreurs.length} PDF non reconnu${erreurs.length > 1 ? 's' : ''} · ${valides.length} analysé${valides.length > 1 ? 's' : ''} avec succès`)
    }
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
    if (!session) { router.push('/login'); return }
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
        date_facture: f.date_facture || null,
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
    setTimeout(() => router.push('/dashboard'), 1500)
    setImporting(false)
  }

  const handleFEC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setMessage('Fichier FEC vide ou invalide.'); return }

      const rawHeaders = lines[0].split('|').map(h => h.trim().replace(/"/g, ''))
      const idx = (name: string) => rawHeaders.findIndex(h => h.toLowerCase() === name.toLowerCase())

      const iCompteNum = idx('CompteNum'); const iCompAuxLib = idx('CompAuxLib')
      const iPieceRef = idx('PieceRef'); const iPieceDate = idx('PieceDate')
      const iDebit = idx('Debit'); const iCredit = idx('Credit')

      if (iCompteNum === -1 || iPieceRef === -1) {
        setMessage('Format FEC invalide — colonnes CompteNum ou PieceRef introuvables.')
        return
      }

      // Regrouper par PieceRef (une facture = plusieurs lignes comptables)
      const grouped: Record<string, { compAuxLib: string; solde: number; pieceDate: string }> = {}
      lines.slice(1).forEach(line => {
        const vals = line.split('|').map(v => v.trim().replace(/"/g, ''))
        const compteNum = vals[iCompteNum] || ''
        if (!compteNum.startsWith('411')) return // Filtre créances clients seulement

        const pieceRef = vals[iPieceRef] || ''
        if (!pieceRef) return
        const debit = parseFloat((vals[iDebit] || '0').replace(',', '.')) || 0
        const credit = parseFloat((vals[iCredit] || '0').replace(',', '.')) || 0
        const solde = debit - credit

        if (!grouped[pieceRef]) {
          grouped[pieceRef] = { compAuxLib: vals[iCompAuxLib] || '', solde: 0, pieceDate: vals[iPieceDate] || '' }
        }
        grouped[pieceRef].solde += solde
        if (!grouped[pieceRef].compAuxLib && vals[iCompAuxLib]) {
          grouped[pieceRef].compAuxLib = vals[iCompAuxLib]
        }
      })

      // Convertir en FacturePreview (garder uniquement les montants positifs = impayés)
      const rows: FacturePreview[] = Object.entries(grouped)
        .filter(([, g]) => g.solde > 0.01)
        .map(([pieceRef, g]) => {
          // PieceDate YYYYMMDD → ISO
          const pd = g.pieceDate.replace(/\D/g, '')
          let dateFacture = ''
          if (pd.length === 8) {
            dateFacture = `${pd.slice(0, 4)}-${pd.slice(4, 6)}-${pd.slice(6, 8)}`
          }
          // Échéance = date facture + 30 jours
          let dateEcheance = ''
          if (dateFacture) {
            const d = new Date(dateFacture); d.setDate(d.getDate() + 30)
            dateEcheance = d.toISOString().split('T')[0]
          }
          return {
            client_nom: g.compAuxLib || pieceRef,
            numero_facture: pieceRef,
            date_facture: dateFacture,
            date_echeance: dateEcheance,
            montant: g.solde.toFixed(2),
            client_email: '',
            doublonWarning: isDublon(pieceRef),
          }
        })

      if (rows.length === 0) {
        setMessage('Aucune créance client (compte 411) trouvée dans ce fichier FEC.')
        return
      }

      const limitees = placesRestantes === Infinity ? rows : rows.slice(0, placesRestantes)
      if (rows.length > limitees.length) setMessage(`Seulement ${placesRestantes} facture(s) importable(s) ce mois-ci`)
      setFactures(limitees)
    }
    reader.readAsText(file, 'UTF-8')
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
        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
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
          .mobile-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 300; background: linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%); animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.07); }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        <DashboardSidebar user={user} title="Importer" />

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
                  {mode === null ? 'Importer des factures' : mode === 'csv' ? 'Import CSV' : mode === 'fec' ? 'Import FEC' : 'Import PDF par IA'}
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>
                  {mode === null ? "Choisissez votre méthode d'import" : mode === 'csv' ? 'Remplissez le template et importez votre fichier' : mode === 'fec' ? 'Fichier FEC — comptes 411 extraits automatiquement' : "L'IA extrait automatiquement les informations"}
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
              <button onClick={() => router.push('/souscrire')} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Changer →</button>
            </div>
          )}

          {!limiteAtteinte && getLimiteFactures() !== Infinity && (placesRestantes <= 5 || facturesCeMois >= getLimiteFactures() * 0.8) && (
            <div className="banner-row" style={{ background: placesRestantes <= 2 ? '#FEF2F2' : '#FFF7ED', border: `1px solid ${placesRestantes <= 2 ? '#FECACA' : '#FED7AA'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 13, color: placesRestantes <= 2 ? '#DC2626' : '#EA580C' }}>
                {placesRestantes <= 2
                  ? <><strong>Attention :</strong> il ne reste que <strong>{placesRestantes}</strong> import{placesRestantes > 1 ? 's' : ''} ce mois-ci</>
                  : <>Il reste <strong>{placesRestantes}</strong> facture{placesRestantes > 1 ? 's' : ''} importable{placesRestantes > 1 ? 's' : ''} ce mois-ci ({facturesCeMois}/{getLimiteFactures()})</>
                }
              </p>
              <button onClick={() => router.push('/souscrire')} style={{ background: placesRestantes <= 2 ? '#DC2626' : '#EA580C', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Upgrader →</button>
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
            <div className="mode-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16, maxWidth: 960, animation: 'fadeUp 0.4s ease 0.1s both' }}>
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
              <div className={`mode-card${limiteAtteinte ? ' disabled' : ''}`} onClick={() => !limiteAtteinte && setMode('fec')}>
                <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 6 }}>Import FEC</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>Importez votre Fichier des Écritures Comptables — les créances clients 411 sont extraites automatiquement.</p>
                <span style={{ fontSize: 12, background: 'rgba(16,185,129,0.10)', color: '#059669', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>Comptabilité française</span>
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
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>Colonnes <strong style={{ color: '#DC2626' }}>requises</strong> : raison_sociale, email_facturation, numero_facture, date_echeance, montant_total</p>
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

              {message && factures.length === 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{message}</p>
                  <button onClick={() => { setMessage(''); setFileName(''); setFactures([]) }} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>↺ Réessayer</button>
                </div>
              )}

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

          {/* FEC */}
          {mode === 'fec' && (
            <div style={{ maxWidth: 960, animation: 'fadeUp 0.3s ease both' }}>
              {/* Info FEC */}
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📊</span>
                <div>
                  <p style={{ fontWeight: 600, color: '#059669', fontSize: 13, marginBottom: 4 }}>Format FEC (Fichier des Écritures Comptables)</p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
                    Séparateur pipe <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>|</code> — Les lignes de compte <strong>411</strong> (créances clients) sont extraites automatiquement et regroupées par pièce. L'email client n'est pas disponible dans le FEC — vous pourrez le compléter dans le tableau de bord.
                  </p>
                </div>
              </div>

              {/* Upload */}
              <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #EAECEF', marginBottom: 16 }}>
                <div className="step-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="step-num">1</div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111', marginBottom: 2, fontSize: 14 }}>Importez votre fichier FEC</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {fileName ? <span style={{ color: '#059669', fontWeight: 600 }}>{fileName} ✓</span> : 'Fichier .txt ou .csv séparé par |'}
                        {placesRestantes !== Infinity && <span style={{ color: '#EA580C' }}> — {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}</span>}
                      </p>
                    </div>
                  </div>
                  <label className="step-row-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(16,185,129,0.30)', display: 'inline-block' }}>
                    Choisir un fichier FEC
                    <input type="file" accept=".txt,.csv,.fec" onChange={handleFEC} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Preview table */}
              {factures.length > 0 && (
                <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #EAECEF' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="step-num">2</div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>Vérifiez avant d'importer</p>
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>{factures.length} créance{factures.length > 1 ? 's' : ''} client{factures.length > 1 ? 's' : ''} trouvée{factures.length > 1 ? 's' : ''}{hasDublon ? ` — ${factures.filter(f => f.doublonWarning).length} doublon(s)` : ''}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.12)', color: '#059669', borderRadius: 6, padding: '3px 10px', fontWeight: 700 }}>FEC · Compte 411</span>
                  </div>
                  <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13 }}>⚠️</span>
                    <p style={{ fontSize: 12, color: '#92400E' }}>L'email client n'est pas disponible dans le FEC — complétez-le manuellement dans le tableau de bord après import.</p>
                  </div>
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Client', 'N° Pièce', 'Date facture', 'Échéance', 'Montant', 'Email'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {factures.map((f, i) => (
                          <tr key={i} className={f.doublonWarning ? 'row-dublon' : ''} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111', fontSize: 12, whiteSpace: 'nowrap' }}>{f.client_nom || '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                              {f.doublonWarning
                                ? <span style={{ color: '#EA580C', fontWeight: 700 }}>{f.numero_facture} ⚠</span>
                                : <span style={{ color: '#111', fontWeight: 600 }}>{f.numero_facture || '—'}</span>}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{f.date_facture || '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{f.date_echeance || '—'}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#a855f7', fontSize: 12, whiteSpace: 'nowrap' }}>{f.montant ? `${parseFloat(f.montant).toFixed(2)} €` : '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#D1D5DB', fontStyle: 'italic', whiteSpace: 'nowrap' }}>À compléter</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #EAECEF' }}>
                    {message && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                        <p style={{ color: '#DC2626', fontSize: 13, fontWeight: 600 }}>{message}</p>
                      </div>
                    )}
                    <button className="btn-import" onClick={importerFactures} disabled={importing || limiteAtteinte || hasDublon}>
                      {importing ? 'Import en cours...' : hasDublon ? "Corrigez les doublons avant d'importer" : limiteAtteinte ? 'Limite atteinte' : `Importer ${factures.filter(f => !f.doublonWarning).length} créance${factures.filter(f => !f.doublonWarning).length > 1 ? 's' : ''} client${factures.filter(f => !f.doublonWarning).length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              )}

              {message && factures.length === 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ color: '#DC2626', fontSize: 13, fontWeight: 600 }}>{message}</p>
                </div>
              )}
            </div>
          )}

          {/* PDF */}
          {mode === 'pdf' && (
            <div style={{ maxWidth: 800, animation: 'fadeUp 0.3s ease both' }}>
              <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #EAECEF', marginBottom: 16 }}>
                <label className="drop-zone" style={{ display: 'block' }}>
                  <input type="file" accept=".pdf" multiple onChange={(e) => { setFiles(Array.from(e.target.files || [])); e.target.value = '' }} style={{ display: 'none' }} />
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
                        <span style={{ fontSize: 13, color: '#111', flex: 1 }}>{f.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} title="Retirer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18, lineHeight: 1, padding: '0 2px', display: 'flex', alignItems: 'center' }}>×</button>
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
                          {['Fichier', 'Client', 'N° Facture', 'Total', 'Restant', 'Échéance', ''].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {factures.map((f, i) => (
                          <tr key={i} className={f.doublonWarning ? 'row-dublon' : ''} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{f.fichier}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: f.erreur ? '#DC2626' : '#111', fontSize: 12 }}>
                              {f.erreur
                                ? <span title={f.erreurMessage || 'Erreur'}>⚠ {f.erreurMessage ? f.erreurMessage.slice(0, 40) + (f.erreurMessage.length > 40 ? '…' : '') : 'Erreur'}</span>
                                : (f.raison_sociale || f.client_nom)}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 12 }}>
                              {f.doublonWarning ? <span style={{ color: '#EA580C', fontWeight: 700 }}>{f.numero_facture} ⚠</span> : <span style={{ color: '#111' }}>{f.numero_facture || '—'}</span>}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111', fontSize: 12 }}>{f.montant_total ? `${f.montant_total} €` : f.montant ? `${f.montant} €` : '—'}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#a855f7', fontSize: 12 }}>{f.montant_restant ? `${f.montant_restant} €` : '—'}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{f.date_echeance || '—'}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                              <button
                                onClick={() => {
                                  const nom = factures[i].fichier
                                  setFactures(prev => prev.filter((_, idx) => idx !== i))
                                  if (nom) setFiles(prev => prev.filter(file => file.name !== nom))
                                }}
                                title="Retirer"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4, transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
                              >×</button>
                            </td>
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

