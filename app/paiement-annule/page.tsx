'use client'

export default function PaiementAnnulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Paiement annulé</h1>
        <p className="text-slate-400 leading-relaxed mb-6">
          Vous avez annulé le paiement. Aucun montant n'a été débité.
          Vous pouvez effectuer le paiement à tout moment via le lien reçu par email.
        </p>
        <p className="text-slate-500 text-sm">
          Vous pouvez fermer cette page.
        </p>
      </div>
    </div>
  )
}
