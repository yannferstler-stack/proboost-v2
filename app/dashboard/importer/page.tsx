'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

type Mode = null | 'csv' | 'pdf'

export default function ImporterPage() {
  const [mode, setMode] = useState<Mode>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [facturesCeMois, setFacturesCeMois] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      // Compter factures du mois en cours
      const debutMois = new Date()
      debutMois.setDate(1)
      debutMois.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('factures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', debutMois.toISOString())
      setFacturesCeMois(count || 0)
    }
    loadData()
  }, [])

  const getLimiteFactures = () => {
    if (profile?.plan === 'pro') return Infinity
    if (profile?.plan === 'premium') return 50
    return 10 // starter
  }

  const limiteAtteinte = getLimiteFactures() !== Infinity && facturesCeMois >= getLimiteFactures()
  const placesRestantes = getLimiteFactures() === Infinity ? Infinity : Math.max(0, getLimiteFactures() - facturesCeMois)

  const getFirstRelanceDate = (dateEcheance: string): Date => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const echeance = new Date(dateEcheance)
    echeance.setHours(0, 0, 0, 0)
    const j1 = 7
    const limitePassee = new Date(today)
    limitePassee.setDate(limitePassee.getDate() - j1)
    if (echeance <= limitePassee) return today
    const d = new Date(echeance)
    d.setDate(d.getDate() + j1)
    return d
  }

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const obj: any = {}
        headers.forEach((h, i) => { obj[h] = values[i] })
        return obj
      }).filter(r => r.nom || r.client_nom)
      // Limiter le nombre de lignes selon places restantes
      const limitees = placesRestantes === Infinity ? rows : rows.slice(0, placesRestantes)
      if (rows.length > limitees.length) {
        setMessage(`⚠️ Seulement ${placesRestantes} facture${placesRestantes > 1 ? 's' : ''} importable${placesRestantes > 1 ? 's' : ''} ce mois-ci (limite ${getLimiteFactures()} ${profile?.plan || 'starter'})`)
      }
      setFactures(limitees)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csv = 'nom,email,telephone,montant,date_echeance\nJean Dupont,jean@email.com,0600000000,1500.00,2024-12-31'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-factures-proboost.csv'
    a.click()
  }

  const analyserPDFs = async () => {
    if (files.length === 0) return
    setLoading(true)
    setMessage('')
    const resultats: any[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('pdf', file)
      try {
        const res = await fetch('/api/analyser-pdf', { method: 'POST', body: formData })
        const data = await res.json()
        resultats.push({ ...data, fichier: file.name })
      } catch {
        resultats.push({ fichier: file.name, erreur: true })
      }
    }
    // Limiter selon places restantes
    const valides = resultats.filter(f => !f.erreur)
    const limitees = placesRestantes === Infinity ? resultats : [
      ...resultats.filter(f => f.erreur),
      ...valides.slice(0, placesRestantes)
    ]
    if (valides.length > (placesRestantes === Infinity ? valides.length : placesRestantes)) {
      setMessage(`⚠️ Seulement ${placesRestantes} facture${placesRestantes > 1 ? 's' : ''} importable${placesRestantes > 1 ? 's' : ''} ce mois-ci`)
    }
    setFactures(limitees)
    setLoading(false)
  }

  const importerFactures = async () => {
    if (limiteAtteinte) {
      setMessage(`❌ Limite de ${getLimiteFactures()} factures/mois atteinte pour le plan ${profile?.plan || 'Starter'}`)
      return
    }
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const valides = factures.filter(f => !f.erreur)
    const { error } = await supabase.from('factures').insert(
      valides.map(f => {
        const dateEcheance = f.date_echeance
        const nextRelanceDate = getFirstRelanceDate(dateEcheance)
        return {
          user_id: user.id,
          client_nom: f.client_nom || f.nom,
          client_email: f.client_email || f.email,
          client_telephone: f.client_telephone || f.telephone,
          montant: parseFloat(f.montant),
          date_echeance: dateEcheance,
          statut: 'impayée',
          nombre_relances: 0,
          sequence_active: false,
          sequence_started_at: null,
          next_relance_date: nextRelanceDate.toISOString(),
        }
      })
    )

    if (error) setMessage('Erreur : ' + error.message)
    else {
      setMessage('✅ Factures importées !')
      setTimeout(() => window.location.href = '/dashboard', 1500)
    }
    setImporting(false)
  }

  const resetMode = () => {
    setMode(null)
    setFactures([])
    setFiles([])
    setFileName('')
    setMessage('')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        .btn-main { transition: all 0.2s; }
        .btn-main:hover:not(:disabled) { background: #18a34a !important; transform: translateY(-1px); }
        .mode-card { transition: all 0.2s; cursor: pointer; border: 2px solid #E5E7EB; border-radius: 16px; padding: 28px; background: white; }
        .mode-card:hover { border-color: #1DB954; box-shadow: 0 4px 20px rgba(29,185,84,0.12); }
        .drop-zone { border: 2px dashed #E5E7EB; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover { border-color: #1DB954; background: #F0FDF4; }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(29,185,84,0.08) !important; color: #1DB954 !important; }
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
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>📊</span> Tableau de bord
            </div>
            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#1DB954', fontSize: 14, fontWeight: 600, background: 'rgba(29,185,84,0.12)' }}>
              <span>📥</span> Importer
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/facturation'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>💰</span> Facturation
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/settings'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>⚙️</span> Paramètres
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <div style={{ marginLeft: 240, flex: 1, padding: 40 }}>

          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {mode && (
                <button onClick={resetMode} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                  ← Retour
                </button>
              )}
              <div>
                <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 4 }}>
                  {mode === null ? 'Importer des factures' : mode === 'csv' ? 'Import CSV' : 'Import PDF par IA 🤖'}
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {mode === null ? "Choisissez votre méthode d'import" : mode === 'csv' ? 'Remplissez le template et importez votre fichier' : "L'IA extrait automatiquement les informations de vos factures"}
                </p>
              </div>
            </div>

            {/* Compteur factures du mois */}
            {profile && (
              <div style={{
                background: limiteAtteinte ? '#FEF2F2' : facturesCeMois >= getLimiteFactures() * 0.8 ? '#FFF7ED' : 'white',
                border: `1px solid ${limiteAtteinte ? '#FECACA' : facturesCeMois >= getLimiteFactures() * 0.8 ? '#FED7AA' : '#EAECEF'}`,
                borderRadius: 12, padding: '12px 18px', textAlign: 'right',
              }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                  Factures ce mois
                </p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: limiteAtteinte ? '#DC2626' : '#111' }}>
                  {facturesCeMois}
                  {getLimiteFactures() !== Infinity && <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>/{getLimiteFactures()}</span>}
                  {getLimiteFactures() === Infinity && <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 500 }}> illimité</span>}
                </p>
                {getLimiteFactures() !== Infinity && (
                  <div style={{ marginTop: 6, height: 4, background: '#F3F4F6', borderRadius: 2, width: 120 }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${Math.min(100, (facturesCeMois / getLimiteFactures()) * 100)}%`,
                      background: limiteAtteinte ? '#DC2626' : facturesCeMois >= getLimiteFactures() * 0.8 ? '#EA580C' : '#1DB954',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Banner limite atteinte */}
          {limiteAtteinte && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 2 }}>
                    Limite de {getLimiteFactures()} factures/mois atteinte
                  </p>
                  <p style={{ fontSize: 13, color: '#991B1B' }}>
                    Passez au plan supérieur pour importer plus de factures ce mois-ci.
                  </p>
                </div>
              </div>
              <button onClick={() => window.location.href = '/dashboard/pricing'}
                style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Changer de plan →
              </button>
            </div>
          )}

          {/* Banner proche limite (80%) */}
          {!limiteAtteinte && getLimiteFactures() !== Infinity && facturesCeMois >= getLimiteFactures() * 0.8 && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⚠️</span>
                <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 500 }}>
                  Il vous reste <strong>{placesRestantes} facture{placesRestantes > 1 ? 's' : ''}</strong> importable{placesRestantes > 1 ? 's' : ''} ce mois-ci (plan {profile?.plan})
                </p>
              </div>
              <button onClick={() => window.location.href = '/dashboard/pricing'}
                style={{ background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                Upgrader →
              </button>
            </div>
          )}

          {/* Info séquence */}
          {mode !== null && !limiteAtteinte && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <p style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>
                Après l'import, activez la séquence de relance depuis le tableau de bord pour chaque facture.
              </p>
            </div>
          )}

          {/* ÉTAPE 1 — Choix du mode */}
          {mode === null && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700 }}>
              <div className="mode-card" onClick={() => !limiteAtteinte && setMode('csv')}
                style={{ opacity: limiteAtteinte ? 0.5 : 1, cursor: limiteAtteinte ? 'not-allowed' : 'pointer' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 8 }}>Import CSV</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>Téléchargez notre template Excel, remplissez-le et importez-le en un clic.</p>
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>✓ Simple et rapide</span>
                </div>
              </div>

              <div className="mode-card" onClick={() => !limiteAtteinte && setMode('pdf')}
                style={{ opacity: limiteAtteinte ? 0.5 : 1, cursor: limiteAtteinte ? 'not-allowed' : 'pointer' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 8 }}>Import PDF par IA</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>Déposez vos factures PDF et l'IA détecte automatiquement toutes les informations.</p>
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✓ Zéro saisie manuelle</span>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — CSV */}
          {mode === 'csv' && (
            <div style={{ maxWidth: 800 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 36, height: 36, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3B82F6' }}>1</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111', marginBottom: 2 }}>Téléchargez le template CSV</p>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>Ouvrez-le avec Excel, Google Sheets ou LibreOffice</p>
                  </div>
                </div>
                <button onClick={downloadTemplate} style={{ background: 'white', color: '#3B82F6', border: '1.5px solid #BFDBFE', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  ↓ Télécharger le template
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 36, height: 36, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3B82F6' }}>2</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111', marginBottom: 2 }}>Importez votre fichier rempli</p>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                      Format CSV uniquement {fileName && <span style={{ color: '#1DB954' }}>— {fileName} ✓</span>}
                      {placesRestantes !== Infinity && <span style={{ color: '#EA580C' }}> — {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}</span>}
                    </p>
                  </div>
                </div>
                <label style={{ background: '#F9FAFB', color: '#111', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  📁 Choisir un fichier
                  <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
                </label>
              </div>

              {factures.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 36, height: 36, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3B82F6' }}>3</div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111' }}>Vérifiez avant d'importer</p>
                      <p style={{ fontSize: 13, color: '#9CA3AF' }}>{factures.length} factures détectées</p>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Client', 'Email', 'Téléphone', 'Montant', 'Échéance', 'Première relance'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {factures.map((f, i) => {
                        const firstRelance = getFirstRelanceDate(f.date_echeance)
                        const isToday = firstRelance.toDateString() === new Date().toDateString()
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111' }}>{f.nom || f.client_nom}</td>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.email || f.client_email}</td>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.telephone || f.client_telephone}</td>
                            <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111' }}>{parseFloat(f.montant).toFixed(2)} €</td>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.date_echeance}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: isToday ? '#DC2626' : '#16A34A' }}>
                                {isToday ? "⚡ Aujourd'hui" : firstRelance.toLocaleDateString('fr-FR')}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: 24, borderTop: '1px solid #EAECEF' }}>
                    {message && <p style={{ color: message.includes('✅') ? '#16A34A' : message.includes('⚠️') ? '#EA580C' : '#DC2626', fontSize: 14, marginBottom: 12 }}>{message}</p>}
                    <button className="btn-main" onClick={importerFactures} disabled={importing || limiteAtteinte}
                      style={{ background: limiteAtteinte ? '#F3F4F6' : '#1DB954', color: limiteAtteinte ? '#9CA3AF' : 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: limiteAtteinte ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                      {importing ? 'Import en cours...' : limiteAtteinte ? '🔒 Limite atteinte' : `✅ Importer ${factures.length} factures`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 — PDF */}
          {mode === 'pdf' && (
            <div style={{ maxWidth: 800 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 24 }}>
                <label className="drop-zone" style={{ display: 'block' }}>
                  <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                  <p style={{ fontWeight: 600, color: '#111', fontSize: 16, marginBottom: 8 }}>Cliquez ou glissez vos PDFs ici</p>
                  <p style={{ color: '#9CA3AF', fontSize: 13 }}>Plusieurs fichiers acceptés — l'IA lira chaque facture automatiquement</p>
                </label>

                {files.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>{files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}</p>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 6 }}>
                        <span>📄</span>
                        <span style={{ fontSize: 13, color: '#111' }}>{f.name}</span>
                      </div>
                    ))}
                    <button className="btn-main" onClick={analyserPDFs} disabled={loading}
                      style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 16, fontFamily: 'Inter, sans-serif', width: '100%' }}>
                      {loading ? '🤖 Analyse en cours...' : `🤖 Analyser ${files.length} PDF${files.length > 1 ? 's' : ''} avec l'IA`}
                    </button>
                  </div>
                )}
              </div>

              {factures.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF' }}>
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Résultats de l'analyse</h2>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Fichier', 'Client', 'Email', 'Montant', 'Échéance', 'Première relance'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {factures.map((f, i) => {
                        const firstRelance = f.erreur ? null : getFirstRelanceDate(f.date_echeance)
                        const isToday = firstRelance?.toDateString() === new Date().toDateString()
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.fichier}</td>
                            <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111' }}>{f.erreur ? '❌ Erreur' : f.client_nom}</td>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.client_email || '—'}</td>
                            <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111' }}>{f.montant ? `${f.montant} €` : '—'}</td>
                            <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.date_echeance || '—'}</td>
                            <td style={{ padding: '14px 20px' }}>
                              {firstRelance ? (
                                <span style={{ fontSize: 12, fontWeight: 600, color: isToday ? '#DC2626' : '#16A34A' }}>
                                  {isToday ? "⚡ Aujourd'hui" : firstRelance.toLocaleDateString('fr-FR')}
                                </span>
                              ) : <span style={{ color: '#9CA3AF' }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: 24, borderTop: '1px solid #EAECEF' }}>
                    {message && <p style={{ color: message.includes('✅') ? '#16A34A' : message.includes('⚠️') ? '#EA580C' : '#DC2626', fontSize: 14, marginBottom: 12 }}>{message}</p>}
                    <button className="btn-main" onClick={importerFactures} disabled={importing || limiteAtteinte}
                      style={{ background: limiteAtteinte ? '#F3F4F6' : '#1DB954', color: limiteAtteinte ? '#9CA3AF' : 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: limiteAtteinte ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                      {importing ? 'Import en cours...' : limiteAtteinte ? '🔒 Limite atteinte' : `✅ Importer ${factures.filter(f => !f.erreur).length} facture${factures.filter(f => !f.erreur).length > 1 ? 's' : ''}`}
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