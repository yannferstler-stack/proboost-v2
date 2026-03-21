'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function ImporterPDF() {
  const [files, setFiles] = useState<File[]>([])
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

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
        resultats.push({ ...data, fichier: file.name, statut: 'impayée', nombre_relances: 0 })
      } catch {
        resultats.push({ fichier: file.name, erreur: true })
      }
    }
    setFactures(resultats)
    setLoading(false)
  }

  const importerFactures = async () => {
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const valides = factures.filter(f => !f.erreur)
    const { error } = await supabase.from('factures').insert(
      valides.map(f => ({
        user_id: user.id,
        client_nom: f.client_nom,
        client_email: f.client_email,
        client_telephone: f.client_telephone,
        montant: f.montant,
        date_echeance: f.date_echeance,
        statut: 'impayée',
        nombre_relances: 0,
      }))
    )

    if (error) setMessage('Erreur : ' + error.message)
    else { setMessage('✅ Factures importées !'); setTimeout(() => window.location.href = '/dashboard', 1500) }
    setImporting(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        .drop-zone { border: 2px dashed #E5E7EB; border-radius: 16px; padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover { border-color: #1DB954; background: #F0FDF4; }
        .btn-main { transition: all 0.2s; }
        .btn-main:hover { background: #18a34a !important; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 8px', marginBottom: 36 }}>
            <img src="/logo.png" alt="ProBoost" style={{ width: 96, height: 96, objectFit: 'contain', marginLeft: -26, marginRight: -22, marginTop: -22, marginBottom: -22 }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#111' }}>ProBoost</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div onClick={() => window.location.href = '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14, cursor: 'pointer', borderRadius: 8 }}>
              <span>📊</span> Tableau de bord
            </div>
            <div onClick={() => window.location.href = '/dashboard/importer'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14, cursor: 'pointer', borderRadius: 8 }}>
              <span>📥</span> Import CSV
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#1DB954', fontSize: 14, cursor: 'pointer', borderRadius: 8, background: 'rgba(29,185,84,0.08)', fontWeight: 600 }}>
              <span>🤖</span> Import PDF (IA)
            </div>
          </nav>
        </aside>

        <div style={{ marginLeft: 240, flex: 1, padding: 40 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 4 }}>Import PDF par IA 🤖</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Déposez vos factures PDF — l'IA extrait automatiquement toutes les informations</p>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 24 }}>
            <label className="drop-zone" style={{ display: 'block' }}>
              <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} />
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ fontWeight: 600, color: '#111', fontSize: 16, marginBottom: 8 }}>Cliquez ou glissez vos PDFs ici</p>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>Plusieurs fichiers acceptés — l'IA lira chaque facture automatiquement</p>
            </label>

            {files.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>{files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''} :</p>
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
                    {['Fichier', 'Client', 'Email', 'Téléphone', 'Montant', 'Échéance'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #EAECEF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.fichier}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111', fontSize: 14 }}>{f.erreur ? '❌ Erreur' : f.client_nom}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.client_email || '—'}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.client_telephone || '—'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111' }}>{f.montant ? `${f.montant} €` : '—'}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.date_echeance || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: 24, borderTop: '1px solid #EAECEF' }}>
                {message && <p style={{ color: message.includes('✅') ? '#16A34A' : '#DC2626', fontSize: 14, marginBottom: 12 }}>{message}</p>}
                <button className="btn-main" onClick={importerFactures} disabled={importing}
                  style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                  {importing ? 'Import en cours...' : `✅ Importer ${factures.filter(f => !f.erreur).length} facture${factures.filter(f => !f.erreur).length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}