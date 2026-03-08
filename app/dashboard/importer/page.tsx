'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ImporterFactures() {
  const [preview, setPreview] = useState<any[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('upload')
  const router = useRouter()
  const supabase = createClient()

  const downloadTemplate = () => {
    const csv = `client_nom,client_email,client_telephone,montant,date_echeance\nDupont SARL,dupont@email.com,0600000001,1500.00,2024-03-31\nMartin SAS,martin@email.com,0600000002,2300.50,2024-04-15`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-factures-relanceauto.csv'
    a.click()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',')
      const rows = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj: any = {}
        headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() })
        return obj
      })
      setPreview(rows)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const factures = preview.map(row => ({
      user_id: user.id,
      client_nom: row.client_nom,
      client_email: row.client_email,
      client_telephone: row.client_telephone || '',
      montant: parseFloat(row.montant),
      date_echeance: row.date_echeance,
      statut: 'impayée'
    }))
    const { error } = await supabase.from('factures').insert(factures)
    if (error) setMessage('Erreur : ' + error.message)
    else { setStep('done'); setMessage(`${factures.length} factures importées avec succès !`) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">RelanceAuto</h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:underline">
          ← Retour au tableau de bord
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Importer des factures</h2>
        <p className="text-gray-500 mb-6">Téléchargez le template, remplissez-le et réimportez-le.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Téléchargez le template CSV</p>
              <p className="text-sm text-gray-500">Ouvrez-le avec Excel, Google Sheets ou LibreOffice</p>
            </div>
            <button onClick={downloadTemplate} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
              ⬇ Télécharger le template
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Importez votre fichier rempli</p>
              <p className="text-sm text-gray-500">Format CSV uniquement {fileName && <span className="text-indigo-600">— {fileName} ✓</span>}</p>
            </div>
            <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition cursor-pointer">
              📂 Choisir un fichier
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        {step === 'preview' && preview.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium text-gray-800">Vérifiez avant d'importer</p>
                <p className="text-sm text-gray-500">{preview.length} factures détectées</p>
              </div>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500">Client</th>
                    <th className="text-left px-4 py-2 text-gray-500">Email</th>
                    <th className="text-left px-4 py-2 text-gray-500">Téléphone</th>
                    <th className="text-left px-4 py-2 text-gray-500">Montant</th>
                    <th className="text-left px-4 py-2 text-gray-500">Échéance</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800">{row.client_nom}</td>
                      <td className="px-4 py-2 text-gray-600">{row.client_email}</td>
                      <td className="px-4 py-2 text-gray-600">{row.client_telephone}</td>
                      <td className="px-4 py-2 font-semibold text-gray-800">{row.montant} €</td>
                      <td className="px-4 py-2 text-gray-600">{row.date_echeance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {message && <p className="text-sm text-red-500 mb-3">{message}</p>}
            <button onClick={handleImport} disabled={loading} className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Importation en cours...' : `✓ Importer ${preview.length} factures`}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-green-700 font-semibold text-lg">{message}</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
              Voir mon tableau de bord
            </button>
          </div>
        )}
      </main>
    </div>
  )
}