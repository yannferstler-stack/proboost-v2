'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaiementRecuPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // On peut vérifier le statut de la session, mais le webhook a déjà tout mis à jour
    // Ici on affiche simplement une page de confirmation
    if (sessionId) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4" />
            <div className="h-4 bg-white/10 rounded w-2/3 mx-auto" />
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Paiement confirmé !</h1>
            <p className="text-slate-400 leading-relaxed mb-6">
              Votre paiement a bien été reçu. La facture a été mise à jour automatiquement.
              Vous pouvez fermer cette page.
            </p>
            <p className="text-slate-500 text-sm">
              Un email de confirmation vous a été envoyé.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Une erreur est survenue</h1>
            <p className="text-slate-400 leading-relaxed">
              Nous n'avons pas pu confirmer votre paiement. Veuillez contacter l'émetteur de la facture.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
