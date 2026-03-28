'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '../../lib/supabase'

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', premium: 'Premium', pro: 'Pro' }
const PLAN_COLORS: Record<string, string> = { starter: '#10b981', premium: '#3B82F6', pro: '#a855f7' }

/** Validation SIRET par algorithme de Luhn (standard français). */
function validateSiretLuhn(siret: string): boolean {
  if (!/^\d{14}$/.test(siret)) return false
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let d = parseInt(siret[i], 10)
    if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return sum % 10 === 0
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') || 'starter'
  const sessionId = searchParams.get('session_id')

  // 4 étapes : infos → password → stripe → done
  const [step, setStep] = useState<'infos' | 'password' | 'stripe' | 'done'>('infos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null) // Créé à la fin de l'étape password

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    societe: '', siret: '', adresse: '', ville: '', codePostal: '',
    password: '', passwordConfirm: '',
  })

  const planColor = PLAN_COLORS[plan] || '#a855f7'

  const handleChange = (field: string, value: string) => {
    if (field === 'siret') {
      // Auto-format SIRET : XXX XXX XXX XXXXX
      const digits = value.replace(/\D/g, '').slice(0, 14)
      let formatted = ''
      if (digits.length <= 3) formatted = digits
      else if (digits.length <= 6) formatted = `${digits.slice(0,3)} ${digits.slice(3)}`
      else if (digits.length <= 9) formatted = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`
      else formatted = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)} ${digits.slice(9)}`
      setForm(prev => ({ ...prev, siret: formatted }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const siretDigits = form.siret.replace(/\D/g, '')
  const siretFull = siretDigits.length === 14
  const siretValid = siretFull && validateSiretLuhn(siretDigits)
  const siretLuhnFail = siretFull && !validateSiretLuhn(siretDigits)
  const siretPartial = siretDigits.length > 0 && siretDigits.length < 14

  const handleSubmitInfos = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.prenom || !form.nom || !form.email || !form.societe) { setError('Veuillez remplir tous les champs obligatoires.'); return }
    if (form.siret) {
      const siretClean = form.siret.replace(/[\s.-]/g, '')
      if (!/^\d{14}$/.test(siretClean)) { setError('Le SIRET doit contenir exactement 14 chiffres.'); return }
      if (!validateSiretLuhn(siretClean)) { setError('SIRET invalide : la clé de contrôle est incorrecte. Vérifiez le numéro sur annuaire-entreprises.data.gouv.fr'); return }
    }
    setError(''); setStep('password')
  }

  // Étape 2 : crée le compte ManaFlow immédiatement, puis passe à l'étape Stripe
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (form.password !== form.passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: `${form.prenom} ${form.nom}`, company: form.societe }
        }
      })
      if (authError) throw authError
      const uid = authData.user?.id
      if (!uid) throw new Error('Erreur création compte')

      await supabase.from('profiles').upsert({
        id: uid,
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
        sequence_j1: 3,
        sequence_j2: 7,
        sequence_j3: 15,
      })

      // Enrichir avec les données Stripe (polling — webhook peut arriver avec du retard)
      if (sessionId) {
        try {
          let stripeData: any = null
          for (let attempt = 0; attempt < 10; attempt++) {
            if (attempt > 0) await new Promise(r => setTimeout(r, 3000))
            const stripeRes = await fetch(`/api/subscription/session-data?session_id=${sessionId}`)
            if (stripeRes.ok) {
              const sd = await stripeRes.json()
              if (sd.customer_id) { stripeData = sd; break }
            }
          }
          if (stripeData && (stripeData.customer_id || stripeData.subscription_id)) {
            await supabase.from('profiles').update({
              stripe_customer_id: stripeData.customer_id,
              stripe_subscription_id: stripeData.subscription_id,
              current_period_end: stripeData.current_period_end,
              payment_status: 'active',
            }).eq('id', uid)
          }
        } catch {}
      }

      setUserId(uid) // Stocker le userId pour l'étape Stripe
      setStep('stripe')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  // Étape 3 : connecter Stripe (maintenant qu'on a le userId)
  const handleStripeConnect = async () => {
    if (!userId) return
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ email: form.email, company: form.societe }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.already_connected) {
        setStep('done')
        setTimeout(() => router.push('/dashboard'), 2500)
      } else {
        setError('Impossible d\'initialiser Stripe. Vous pourrez le configurer depuis les Paramètres.')
      }
    } catch {
      setError('Erreur réseau. Configurez Stripe depuis les Paramètres.')
    }
    setLoading(false)
  }

  // Guard : si l'utilisateur a déjà un profil complet → rediriger vers le dashboard
  useEffect(() => {
    const checkExistingProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile?.full_name) {
        router.replace('/dashboard')
      }
    }
    checkExistingProfile()
  }, [])

  // Cas : l'utilisateur revient de Stripe (return_url = /dashboard?connect=success)
  // Ce cas est géré dans le dashboard. Ici, on propose aussi un accès au dashboard
  // si l'utilisateur a été redirigé depuis /souscrire/success?stripe=refresh (refresh_url)
  const isRefresh = searchParams.get('stripe') === 'refresh'
  useEffect(() => {
    if (isRefresh) {
      // Refresh Stripe = lien expiré, il faut se reconnecter depuis les paramètres
      router.push('/dashboard/settings')
    }
  }, [isRefresh])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    color: 'white',
    outline: 'none',
    background: 'rgba(255,255,255,0.08)',
    transition: 'all 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkmark { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes orb { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.08) translate(10px,-10px); } }
        @keyframes orbB { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.05) translate(-8px,8px); } }
        .success-input { transition: all 0.2s; }
        .success-input:focus { outline: none !important; border-color: rgba(168,85,247,0.7) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; background: rgba(255,255,255,0.12) !important; }
        .success-input::placeholder { color: rgba(255,255,255,0.3); }
        .btn-submit { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; transition: all 0.2s; box-shadow: 0 4px 20px rgba(168,85,247,0.40); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55); }
        .btn-submit:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; box-shadow: none; }
        .step-dot { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .btn-later { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer; font-family: Inter, sans-serif; padding: 11px 16px; width: 100%; font-weight: 500; transition: all 0.2s; }
        .btn-later:hover:not(:disabled) { background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.7); }
        .btn-later:disabled { cursor: not-allowed; opacity: 0.5; }
        .btn-back { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 13px; cursor: pointer; font-family: Inter, sans-serif; margin-top: 12px; width: 100%; text-align: center; transition: color 0.2s; }
        .btn-back:hover { color: rgba(255,255,255,0.7); }
        .orb-1 { position: fixed; top: 5%; left: 15%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(236,72,153,0.10) 45%, transparent 70%); border-radius: 50%; pointer-events: none; filter: blur(2px); animation: orb 8s ease-in-out infinite; }
        .orb-2 { position: fixed; bottom: -5%; right: 5%; width: 380px; height: 380px; background: radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(168,85,247,0.07) 50%, transparent 70%); border-radius: 50%; pointer-events: none; filter: blur(2px); animation: orbB 10s ease-in-out infinite; }
        .dot-grid { position: fixed; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 32px 32px; pointer-events: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

        {/* Décorations de fond */}
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="dot-grid" />

        {/* NAV */}
        <nav style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', height: 60, display: 'flex', alignItems: 'center', padding: '0 40px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src="/logo.png" alt="ManaFlow" width={44} height={44} style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
          </div>
        </nav>

        <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 10 }}>

          {/* PAIEMENT CONFIRMÉ */}
          <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>✓</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 2 }}>Paiement confirmé — Plan {PLAN_LABELS[plan]}</p>
              <p style={{ fontSize: 13, color: 'rgba(52,211,153,0.75)' }}>Finalisez la création de votre compte pour accéder au dashboard.</p>
            </div>
          </div>

          {/* ÉTAPES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {[
              { key: 'infos', label: 'Informations' },
              { key: 'password', label: 'Mot de passe' },
              { key: 'stripe', label: 'Paiements Stripe' },
            ].map((s, i) => {
              const steps = ['infos', 'password', 'stripe', 'done']
              const currentIdx = steps.indexOf(step)
              const stepIdx = steps.indexOf(s.key)
              const done = currentIdx > stepIdx
              const active = step === s.key
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                    <div className="step-dot" style={{
                      background: done ? 'linear-gradient(135deg, #10b981, #059669)' : active ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.10)',
                      color: (done || active) ? 'white' : 'rgba(255,255,255,0.35)',
                      boxShadow: active ? '0 4px 16px rgba(168,85,247,0.45)' : done ? '0 4px 12px rgba(16,185,129,0.30)' : 'none',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: active ? 'white' : 'rgba(255,255,255,0.35)', fontWeight: active ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div style={{ height: 2, background: done ? 'rgba(16,185,129,0.50)' : 'rgba(255,255,255,0.10)', flex: 1, margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />}
                </div>
              )
            })}
          </div>

          {/* CARTE PRINCIPALE */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: '32px', animation: 'fadeIn 0.3s ease', backdropFilter: 'blur(12px)' }}>

            {/* ÉTAPE 1 — INFOS */}
            {step === 'infos' && (
              <form onSubmit={handleSubmitInfos}>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Vos informations</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>Ces informations seront utilisées pour personnaliser vos relances.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input className="success-input" style={inputStyle} value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} placeholder="Jean" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Nom *</label>
                    <input className="success-input" style={inputStyle} value={form.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Dupont" required />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email *</label>
                  <input className="success-input" style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="jean@societe.fr" required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Téléphone</label>
                  <input className="success-input" style={inputStyle} value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="06 00 00 00 00" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Raison sociale / Nom de société *</label>
                  <input className="success-input" style={inputStyle} value={form.societe} onChange={e => handleChange('societe', e.target.value)} placeholder="SARL Dupont" required />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>SIRET</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="success-input"
                      style={{ ...inputStyle, paddingRight: 40, borderColor: siretValid ? 'rgba(16,185,129,0.60)' : siretLuhnFail ? 'rgba(251,191,36,0.60)' : siretPartial ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.15)' }}
                      value={form.siret}
                      onChange={e => handleChange('siret', e.target.value)}
                      placeholder="123 456 789 00012"
                    />
                    {(siretValid || siretLuhnFail || siretPartial) && (
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: siretValid ? '#34d399' : siretLuhnFail ? '#fbbf24' : '#f87171', pointerEvents: 'none' }}>
                        {siretValid ? '✓' : siretLuhnFail ? '⚠' : '✗'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                    {siretPartial && <span style={{ fontSize: 11, color: '#f87171' }}>14 chiffres requis ({siretDigits.length}/14)</span>}
                    {siretLuhnFail && <span style={{ fontSize: 11, color: '#fbbf24' }}>Clé de contrôle incorrecte — vérifiez le numéro</span>}
                    {siretValid && <span style={{ fontSize: 11, color: '#34d399' }}>SIRET valide ✓</span>}
                    {!siretPartial && !siretFull && <span />}
                    <a href="https://annuaire-entreprises.data.gouv.fr" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>
                      Trouver mon SIRET →
                    </a>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Adresse</label>
                  <input className="success-input" style={inputStyle} value={form.adresse} onChange={e => handleChange('adresse', e.target.value)} placeholder="12 rue de la Paix" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Code postal</label>
                    <input className="success-input" style={inputStyle} value={form.codePostal} onChange={e => handleChange('codePostal', e.target.value)} placeholder="75001" />
                  </div>
                  <div>
                    <label style={labelStyle}>Ville</label>
                    <input className="success-input" style={inputStyle} value={form.ville} onChange={e => handleChange('ville', e.target.value)} placeholder="Paris" />
                  </div>
                </div>

                {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, fontWeight: 500 }}>{error}</p>}
                <button type="submit" className="btn-submit">Continuer →</button>
              </form>
            )}

            {/* ÉTAPE 2 — MOT DE PASSE (+ création compte en fond) */}
            {step === 'password' && (
              <form onSubmit={handleSubmitPassword}>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Créez votre mot de passe</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>Minimum 8 caractères.</p>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Mot de passe *</label>
                  <input className="success-input" style={inputStyle} type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="••••••••" required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Confirmer le mot de passe *</label>
                  <input className="success-input" style={inputStyle} type="password" value={form.passwordConfirm} onChange={e => handleChange('passwordConfirm', e.target.value)} placeholder="••••••••" required />
                </div>

                {form.password && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.10)', borderRadius: 2, marginBottom: 6 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: form.password.length >= 12 ? 'linear-gradient(90deg, #10b981, #34d399)' : form.password.length >= 8 ? '#f59e0b' : '#ef4444', width: form.password.length >= 12 ? '100%' : form.password.length >= 8 ? '66%' : '33%', transition: 'all 0.2s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: form.password.length >= 12 ? '#34d399' : form.password.length >= 8 ? '#fbbf24' : '#f87171' }}>
                      {form.password.length >= 12 ? 'Fort' : form.password.length >= 8 ? 'Correct' : 'Trop court'}
                    </span>
                  </div>
                )}

                {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, fontWeight: 500 }}>{error}</p>}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Création du compte...
                    </span>
                  ) : 'Créer mon compte →'}
                </button>
                <button type="button" className="btn-back" onClick={() => setStep('infos')}>← Retour</button>
              </form>
            )}

            {/* ÉTAPE 3 — STRIPE CONNECT (recommandé) */}
            {step === 'stripe' && (
              <div>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Connectez votre compte Stripe</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>Pour recevoir les paiements directement sur votre compte bancaire. Vous pouvez le configurer maintenant ou plus tard depuis les Paramètres.</p>

                {/* Explication visuelle du flux */}
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 10 }}>Comment ça fonctionne</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: '📧', text: 'ManaFlow envoie les relances avec un bouton "Payer maintenant"' },
                      { icon: '💳', text: 'Votre client paie via une page Stripe sécurisée' },
                      { icon: '💶', text: 'Le montant arrive directement sur votre compte bancaire, moins notre commission' },
                      { icon: '✅', text: 'La facture est automatiquement marquée comme payée dans votre dashboard' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.5 }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, fontSize: 14 }}>ℹ️</span>
                  <p style={{ fontSize: 12, color: 'rgba(251,191,36,0.85)', lineHeight: 1.6 }}>
                    La création du compte Stripe Express prend environ <strong>3 minutes</strong>. Vous aurez besoin d'une pièce d'identité et d'un RIB. C'est Stripe qui gère la conformité, pas ManaFlow.
                  </p>
                </div>

                {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, fontWeight: 500 }}>{error}</p>}

                <button className="btn-submit" onClick={handleStripeConnect} disabled={loading} style={{ marginBottom: 12 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Connexion à Stripe...
                    </span>
                  ) : '🔗 Connecter mon compte Stripe →'}
                </button>

                {/* Accès sans Stripe — option visible */}
                <div style={{ paddingTop: 4 }}>
                  <button
                    className="btn-later"
                    onClick={() => { setStep('done'); setTimeout(() => router.push('/dashboard'), 1800) }}
                    disabled={loading}>
                    Configurer plus tard depuis les Paramètres
                  </button>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6, textAlign: 'center' }}>
                    Sans Stripe, les liens de paiement ne seront pas inclus dans vos emails.
                  </p>
                </div>
              </div>
            )}

            {/* DONE */}
            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'checkmark 0.4s ease', boxShadow: '0 8px 32px rgba(168,85,247,0.50)' }}>
                  <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>✓</span>
                </div>
                <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 22, color: 'white', marginBottom: 8 }}>Compte créé !</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', marginBottom: 6 }}>Bienvenue sur ManaFlow, {form.prenom}.</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>Redirection vers votre dashboard...</p>
                <div style={{ marginTop: 20, width: 32, height: 32, border: '3px solid rgba(255,255,255,0.15)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '20px auto 0' }} />
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.15)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
