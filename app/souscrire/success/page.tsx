'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
const PLAN_LABELS: Record<string, string> = { starter: 'Starter', premium: 'Premium', pro: 'Pro' }
const PLAN_COLORS: Record<string, string> = { starter: '#16A34A', premium: '#3B82F6', pro: '#7C3AED' }

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') || 'starter'
  const sessionId = searchParams.get('session_id')

  const [step, setStep] = useState<'infos' | 'password' | 'stripe' | 'done'>('infos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    societe: '', siret: '', adresse: '', ville: '', codePostal: '',
    password: '', passwordConfirm: '',
  })

  const planColor = PLAN_COLORS[plan] || '#1DB954'

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmitInfos = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.prenom || !form.nom || !form.email || !form.societe) { setError('Veuillez remplir tous les champs obligatoires.'); return }
    setError(''); setStep('password')
  }

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (form.password !== form.passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setError(''); setStep('stripe')
  }

  const handleCreateAccount = async () => {
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      // Créer le compte auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: `${form.prenom} ${form.nom}`,
            company: form.societe,
          }
        }
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Erreur création compte')

      // Sauvegarder le profil
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: form.email,
        full_name: `${form.prenom} ${form.nom}`,
        company_name: form.societe,
        siret: form.siret,
        telephone: form.telephone,
        adresse: `${form.adresse}, ${form.codePostal} ${form.ville}`,
        plan: plan,
        stripe_session_id: sessionId,
        created_at: new Date().toISOString(),
        canal_relance: 'email',
        sequence_j1: 7,
        sequence_j2: 15,
        sequence_j3: 30,
      })
      if (profileError) throw profileError

      setStep('done')
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  const handleStripeConnect = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, company: form.societe }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { await handleCreateAccount() }
    } catch {
      await handleCreateAccount()
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#111', outline: 'none', background: 'white' }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.3px', display: 'block', marginBottom: 6 }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkmark { from { transform: scale(0); } to { transform: scale(1); } }
        input:focus { border-color: #1DB954 !important; box-shadow: 0 0 0 3px rgba(29,185,84,0.10); }
        .btn-submit { background: linear-gradient(135deg, #1DB954, #15a347); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; transition: all 0.2s; box-shadow: 0 4px 16px rgba(29,185,84,0.30); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,185,84,0.40); }
        .btn-submit:disabled { background: #E5E7EB; color: #9CA3AF; cursor: not-allowed; box-shadow: none; }
        .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'Inter, sans-serif' }}>

        {/* NAV */}
        <nav style={{ background: 'white', borderBottom: '1px solid #EAECEF', height: 60, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/logo.png" style={{ width: 96, height: 96, objectFit: 'contain', marginLeft: -26, marginRight: -22, marginTop: -22, marginBottom: -22 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111' }}>ProBoost</span>
          </div>
        </nav>

        <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 24px' }}>

          {/* PAIEMENT CONFIRMÉ */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#1DB954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>✓</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>Paiement confirmé — Plan {PLAN_LABELS[plan]}</p>
              <p style={{ fontSize: 13, color: '#16A34A' }}>Finalisez la création de votre compte pour accéder au dashboard.</p>
            </div>
          </div>

          {/* ÉTAPES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {[
              { key: 'infos', label: 'Vos informations' },
              { key: 'password', label: 'Mot de passe' },
              { key: 'stripe', label: 'Compte Stripe' },
            ].map((s, i) => {
              const steps = ['infos', 'password', 'stripe', 'done']
              const currentIdx = steps.indexOf(step)
              const stepIdx = steps.indexOf(s.key)
              const done = currentIdx > stepIdx
              const active = step === s.key
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                    <div className="step-dot" style={{ background: done ? '#1DB954' : active ? planColor : '#E5E7EB', color: (done || active) ? 'white' : '#9CA3AF' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: active ? '#111' : '#9CA3AF', fontWeight: active ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div style={{ height: 2, background: done ? '#1DB954' : '#E5E7EB', flex: 1, margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />}
                </div>
              )
            })}
          </div>

          <div style={{ background: 'white', border: '1px solid #EAECEF', borderRadius: 20, padding: '32px', animation: 'fadeIn 0.3s ease' }}>

            {/* ÉTAPE 1 — INFOS */}
            {step === 'infos' && (
              <form onSubmit={handleSubmitInfos}>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 6 }}>Vos informations</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Ces informations seront utilisées pour personnaliser vos relances.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input style={inputStyle} value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} placeholder="Jean" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Nom *</label>
                    <input style={inputStyle} value={form.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Dupont" required />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="jean@societe.fr" required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Téléphone</label>
                  <input style={inputStyle} value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="06 00 00 00 00" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Raison sociale / Nom de société *</label>
                  <input style={inputStyle} value={form.societe} onChange={e => handleChange('societe', e.target.value)} placeholder="SARL Dupont" required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>SIRET</label>
                  <input style={inputStyle} value={form.siret} onChange={e => handleChange('siret', e.target.value)} placeholder="123 456 789 00012" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Adresse</label>
                  <input style={inputStyle} value={form.adresse} onChange={e => handleChange('adresse', e.target.value)} placeholder="12 rue de la Paix" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Code postal</label>
                    <input style={inputStyle} value={form.codePostal} onChange={e => handleChange('codePostal', e.target.value)} placeholder="75001" />
                  </div>
                  <div>
                    <label style={labelStyle}>Ville</label>
                    <input style={inputStyle} value={form.ville} onChange={e => handleChange('ville', e.target.value)} placeholder="Paris" />
                  </div>
                </div>

                {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, fontWeight: 500 }}>{error}</p>}
                <button type="submit" className="btn-submit">Continuer →</button>
              </form>
            )}

            {/* ÉTAPE 2 — MOT DE PASSE */}
            {step === 'password' && (
              <form onSubmit={handleSubmitPassword}>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 6 }}>Créez votre mot de passe</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Minimum 8 caractères.</p>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Mot de passe *</label>
                  <input style={inputStyle} type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="••••••••" required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Confirmer le mot de passe *</label>
                  <input style={inputStyle} type="password" value={form.passwordConfirm} onChange={e => handleChange('passwordConfirm', e.target.value)} placeholder="••••••••" required />
                </div>

                {form.password && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginBottom: 6 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: form.password.length >= 12 ? '#1DB954' : form.password.length >= 8 ? '#EA580C' : '#DC2626', width: form.password.length >= 12 ? '100%' : form.password.length >= 8 ? '66%' : '33%', transition: 'all 0.2s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: form.password.length >= 12 ? '#16A34A' : form.password.length >= 8 ? '#EA580C' : '#DC2626' }}>
                      {form.password.length >= 12 ? 'Fort' : form.password.length >= 8 ? 'Correct' : 'Trop court'}
                    </span>
                  </div>
                )}

                {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, fontWeight: 500 }}>{error}</p>}
                <button type="submit" className="btn-submit">Continuer →</button>
                <button type="button" onClick={() => setStep('infos')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 12, width: '100%', textAlign: 'center' }}>← Retour</button>
              </form>
            )}

            {/* ÉTAPE 3 — STRIPE CONNECT */}
            {step === 'stripe' && (
              <div>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 6 }}>Connexion Stripe</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Pour encaisser vos fonds recouvrés, connectez votre compte Stripe. Vous pourrez aussi ignorer cette étape et le configurer plus tard.</p>

                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: '#5B21B6', fontWeight: 600, marginBottom: 6 }}>Pourquoi Stripe Connect ?</p>
                  <p style={{ fontSize: 13, color: '#6D28D9', lineHeight: 1.6 }}>Stripe Connect vous permet de recevoir directement les paiements recouvrés sur votre compte bancaire, en toute sécurité et conformément à la réglementation.</p>
                </div>

                {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, fontWeight: 500 }}>{error}</p>}

                <button className="btn-submit" onClick={handleStripeConnect} disabled={loading} style={{ marginBottom: 10 }}>
                  {loading ? 'Création du compte...' : 'Connecter mon compte Stripe →'}
                </button>
                <button onClick={handleCreateAccount} disabled={loading} style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', transition: 'all 0.2s' }}>
                  {loading ? '...' : 'Ignorer pour l\'instant'}
                </button>
                <button type="button" onClick={() => setStep('password')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 12, width: '100%', textAlign: 'center' }}>← Retour</button>
              </div>
            )}

            {/* DONE */}
            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, background: '#1DB954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'checkmark 0.4s ease' }}>
                  <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>✓</span>
                </div>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 22, color: '#111', marginBottom: 8 }}>Compte créé !</h2>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>Bienvenue sur ProBoost, {form.prenom}.</p>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Redirection vers votre dashboard...</p>
                <div style={{ marginTop: 20, width: 32, height: 32, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '20px auto 0' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
