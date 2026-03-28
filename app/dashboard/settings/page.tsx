'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { DEFAULT_MESSAGES } from '../../lib/email-templates'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [canalRelance, setCanalRelance] = useState('email')
  const [seqJ1, setSeqJ1] = useState(7)
  const [seqJ2, setSeqJ2] = useState(15)
  const [seqJ3, setSeqJ3] = useState(30)
  const [seqJ4, setSeqJ4] = useState<number | null>(null)
  const [seqJ5, setSeqJ5] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [templateTab, setTemplateTab] = useState(0)
  const [templates, setTemplates] = useState([DEFAULT_MESSAGES[0], DEFAULT_MESSAGES[1], DEFAULT_MESSAGES[2]])
  const [showPreview, setShowPreview] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)
  const [planMessage, setPlanMessage] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const PLAN_ORDER: Record<string, number> = { starter: 1, premium: 2, pro: 3 }
  const PLAN_LABELS: Record<string, string> = { starter: 'Starter — 19,99€/mois', premium: 'Premium — 49,99€/mois', pro: 'Pro — 149,99€/mois' }
  const PLAN_COLORS: Record<string, string> = { starter: '#a855f7', premium: '#ec4899', pro: '#c084fc' }

  const changePlan = async (newPlan: string) => {
    setChangingPlan(true)
    setPlanMessage('')
    try {
      const res = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPlanMessage('error:' + (data.error || 'Erreur lors du changement de plan.'))
      } else if (data.immediate) {
        setPlanMessage('success:Plan mis à jour en ' + newPlan + ' avec succès !')
        setProfile((p: any) => ({ ...p, plan: newPlan, pending_plan: null }))
      } else {
        const date = new Date(data.effective_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        setPlanMessage('success:Passage en ' + newPlan + ' planifié pour le ' + date + '.')
        setProfile((p: any) => ({ ...p, pending_plan: newPlan, pending_plan_effective_date: data.effective_date }))
      }
    } catch {
      setPlanMessage('error:Erreur réseau. Réessayez.')
    }
    setChangingPlan(false)
    setShowPlanModal(false)
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else {
        const msg = data.error || ''
        if (msg.toLowerCase().includes('no such customer') || msg.toLowerCase().includes('customer') || res.status === 404) {
          setPlanMessage('⚠️ Portail indisponible : aucun abonnement actif trouvé. Si vous venez de souscrire, patientez quelques instants puis réessayez.')
        } else {
          setPlanMessage('⚠️ Impossible d\'accéder au portail de paiement. Contactez-nous à contact@manaflow.fr si le problème persiste.')
        }
      }
    } catch {
      setPlanMessage('⚠️ Erreur réseau. Vérifiez votre connexion et réessayez.')
    }
    setPortalLoading(false)
  }

  const openStripeConnect = async () => {
    if (!user || !profile) return
    setConnectLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          email: user.email,
          company: profile.company_name || '',
        }),
      })
      const data = await res.json()
      if (data.url) {
        setPlanMessage('info:Redirection vers Stripe en cours...')
        window.location.href = data.url
      } else if (data.already_connected) {
        setPlanMessage('success:Votre compte Stripe est déjà connecté et actif.')
      } else {
        setPlanMessage('error:' + (data.error || 'Erreur lors de la connexion Stripe.'))
      }
    } catch {
      setPlanMessage('error:Erreur réseau. Vérifiez votre connexion.')
    }
    setConnectLoading(false)
  }

  const isPro = profile?.plan === 'pro'
  const isPremiumOrPro = profile?.plan === 'premium' || profile?.plan === 'pro'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const user = session.user
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setCompanyName(data.company_name || '')
        setCompanyAddress(data.company_address || '')
        setCompanyPhone(data.company_phone || '')
        setCanalRelance(data.canal_relance || 'email')
        setSeqJ1(data.sequence_j1 || 3)
        setSeqJ2(data.sequence_j2 || 7)
        setSeqJ3(data.sequence_j3 || 15)
        setSeqJ4(data.sequence_j4 || null)
        setSeqJ5(data.sequence_j5 || null)
        setTemplates([
          data.template_relance_1 || DEFAULT_MESSAGES[0],
          data.template_relance_2 || DEFAULT_MESSAGES[1],
          data.template_relance_3 || DEFAULT_MESSAGES[2],
        ])
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const delais = [seqJ1, seqJ2, seqJ3, ...(seqJ4 ? [seqJ4] : []), ...(seqJ5 ? [seqJ5] : [])]
    for (let i = 1; i < delais.length; i++) {
      if (delais[i] <= delais[i - 1]) {
        setMessage('error:Chaque délai doit être supérieur au précédent')
        setSaving(false)
        setTimeout(() => setMessage(''), 4000)
        return
      }
    }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, email: user.email,
      company_name: companyName, company_address: companyAddress, company_phone: companyPhone,
      canal_relance: canalRelance,
      sequence_j1: seqJ1, sequence_j2: seqJ2, sequence_j3: seqJ3,
      sequence_j4: seqJ4, sequence_j5: seqJ5,
      template_relance_1: templates[0] !== DEFAULT_MESSAGES[0] ? templates[0] : null,
      template_relance_2: templates[1] !== DEFAULT_MESSAGES[1] ? templates[1] : null,
      template_relance_3: templates[2] !== DEFAULT_MESSAGES[2] ? templates[2] : null,
    })
    if (error) setMessage('error:' + error.message)
    else setMessage('success:Paramètres sauvegardés !')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const isError = message.startsWith('error:')
  const msgText = message.replace(/^(error:|success:)/, '')

  const inputStyle = { width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', border: '1.5px solid #E5E7EB', color: '#111', background: 'white', outline: 'none' }
  const delaiInputStyle = (disabled: boolean) => ({
    width: 64, borderRadius: 8, padding: '8px 8px', fontSize: 14,
    fontFamily: 'Inter, sans-serif', textAlign: 'center' as const,
    border: `1.5px solid ${disabled ? '#E5E7EB' : '#D1D5DB'}`,
    background: disabled ? '#F3F4F6' : 'white',
    color: disabled ? '#9CA3AF' : '#111',
    cursor: disabled ? 'not-allowed' : 'text',
    outline: 'none',
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }
        .input-field:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.10); }
        .delai-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.10); }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
        .canal-btn { transition: all 0.15s; cursor: pointer; }
        .canal-btn:hover:not(:disabled) { border-color: #a855f7 !important; }
        .seq-row { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid #F3F4F6; }
        .seq-row:last-child { border-bottom: none; }
        .card-section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #EAECEF; margin-bottom: 16px; animation: fadeUp 0.4s ease both; }
        .desktop-sidebar { display: flex; }
        .mobile-topbar { display: none; }
        .sidebar-overlay { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 76px 16px 32px !important; max-width: 100% !important; }
          .seq-row { flex-wrap: wrap; gap: 8px; }
          .seq-label { flex: 1; min-width: 120px; }
          .seq-controls { display: flex; align-items: center; gap: 8px; margin-left: auto; }
          .canal-wrap { flex-direction: column !important; }
          .compte-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 299; }
          .mobile-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 300; background: linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%); animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.07); }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        <DashboardSidebar user={user} title="Paramètres" />

        {/* MAIN */}
        <div className="main-content" style={{ marginLeft: isMobile ? 0 : 240, flex: 1, padding: isMobile ? '76px 16px 32px' : '32px 32px', maxWidth: isMobile ? '100%' : 860 }}>

          <div style={{ marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: isMobile ? 20 : 24, color: '#111', marginBottom: 4 }}>Paramètres</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Ces informations apparaîtront dans vos emails de relance</p>
          </div>

          {/* SOCIÉTÉ */}
          <div className="card-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111' }}>Votre société</h2>
            </div>

            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.6 }}>Ce nom apparaîtra dans <strong>tous vos emails de relance</strong>. Assurez-vous qu'il corresponde à votre raison sociale officielle.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Nom de la société *', placeholder: 'Ex: Dupont & Associés SARL', value: companyName, set: setCompanyName },
                { label: 'Adresse', placeholder: 'Ex: 12 rue de la Paix, 75001 Paris', value: companyAddress, set: setCompanyAddress },
                { label: 'Téléphone', placeholder: 'Ex: 01 23 45 67 89', value: companyPhone, set: setCompanyPhone },
              ].map((field, i) => (
                <div key={i}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{field.label}</label>
                  <input type="text" placeholder={field.placeholder} value={field.value} onChange={e => field.set(e.target.value)} className="input-field" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* SÉQUENCE */}
          <div className="card-section" style={{ animationDelay: '0.05s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>Séquence de relance</h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>Délais en jours après l'échéance</p>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: isPro ? 'linear-gradient(135deg, #a855f7, #ec4899)' : isPremiumOrPro ? 'rgba(168,85,247,0.10)' : '#F3F4F6', color: isPro ? 'white' : isPremiumOrPro ? '#7c3aed' : '#6B7280' }}>
                {isPro ? 'Pro' : isPremiumOrPro ? 'Premium' : 'Starter'}
              </span>
            </div>

            {!isPremiumOrPro && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 500 }}>
                  Personnalisation disponible à partir du plan <strong>Premium</strong>.{' '}
                  <span onClick={() => router.push('/souscrire')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Passer Premium →</span>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {isPremiumOrPro ? (
                [
                  { label: 'Relance 1', value: seqJ1, set: setSeqJ1 as (v: number | null) => void, locked: false },
                  { label: 'Relance 2', value: seqJ2, set: setSeqJ2 as (v: number | null) => void, locked: false },
                  { label: 'Relance 3', value: seqJ3, set: setSeqJ3 as (v: number | null) => void, locked: false },
                  { label: 'Relance 4 (opt.)', value: seqJ4, set: setSeqJ4 as (v: number | null) => void, locked: !isPro, optional: true },
                  { label: 'Relance 5 (opt.)', value: seqJ5, set: setSeqJ5 as (v: number | null) => void, locked: !isPro, optional: true },
                ].map((r, i) => {
                  const isOptional = r.optional
                  const isLocked = r.locked
                  const isActive = !isOptional || r.value !== null
                  return (
                    <div key={i} className="seq-row" style={{ opacity: isLocked ? 0.5 : 1 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isLocked ? '#F3F4F6' : isActive ? 'rgba(168,85,247,0.12)' : '#F3F4F6', border: isActive && !isLocked ? '1px solid rgba(168,85,247,0.25)' : 'none' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: isLocked ? '#9CA3AF' : isActive ? '#a855f7' : '#6B7280' }}>{i + 1}</span>
                      </div>
                      <span className="seq-label" style={{ fontSize: 13, color: isLocked ? '#9CA3AF' : '#374151', fontWeight: 500, flex: 1 }}>
                        {r.label}{isLocked && <span style={{ marginLeft: 6, fontSize: 11, color: '#9CA3AF' }}>Pro requis</span>}
                      </span>
                      <div className="seq-controls" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isOptional && !isLocked && (
                          <button onClick={() => r.set(r.value === null ? (i === 3 ? seqJ3 + 15 : (seqJ4 || seqJ3) + 15) : null)}
                            style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif', background: r.value !== null ? '#FEF2F2' : 'rgba(168,85,247,0.10)', color: r.value !== null ? '#DC2626' : '#7c3aed', whiteSpace: 'nowrap' }}>
                            {r.value !== null ? '− Suppr.' : '+ Ajouter'}
                          </button>
                        )}
                        <input type="number" min={1} max={365} value={r.value ?? ''} disabled={isLocked || (isOptional && r.value === null)}
                          onChange={e => !isLocked && r.set(parseInt(e.target.value) || null)}
                          className="delai-input" style={delaiInputStyle(!!(isLocked || (isOptional && r.value === null)))} />
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>j.</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                [{ label: 'Relance 1', value: 7 }, { label: 'Relance 2', value: 15 }, { label: 'Relance 3', value: 30 }].map((r, i) => (
                  <div key={i} className="seq-row">
                    <div style={{ width: 22, height: 22, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>{r.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" value={r.value} disabled className="delai-input" style={delaiInputStyle(true)} />
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>jours</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isPremiumOrPro && (
              <div style={{ marginTop: 12, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: 10, padding: '9px 12px' }}>
                <p style={{ fontSize: 12, color: '#7c3aed' }}>
                  Délais : J+{seqJ1}, J+{seqJ2}, J+{seqJ3}{seqJ4 ? `, J+${seqJ4}` : ''}{seqJ5 ? `, J+${seqJ5}` : ''}
                </p>
              </div>
            )}

            {/* Canal */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>Canal de relance par défaut</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Comment ManaFlow relance vos clients par défaut</p>
              <div className="canal-wrap" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'email', label: 'Email uniquement', proOnly: false },
                  { value: 'sms', label: 'SMS uniquement', proOnly: true },
                  { value: 'both', label: 'Email + SMS', proOnly: true },
                ].map(opt => {
                  const disabled = opt.proOnly && !isPro
                  const active = canalRelance === opt.value
                  return (
                    <button key={opt.value} className="canal-btn" disabled={disabled}
                      onClick={() => !disabled && setCanalRelance(opt.value)}
                      style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', border: active ? '2px solid #a855f7' : '1.5px solid #E5E7EB', background: active ? 'rgba(168,85,247,0.10)' : disabled ? '#F9FAFB' : 'white', color: disabled ? '#9CA3AF' : active ? '#7c3aed' : '#374151' }}>
                      {opt.label}
                      {disabled && <span style={{ marginLeft: 5, fontSize: 10, color: '#9CA3AF' }}>Pro</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* EMAIL TEMPLATES */}
          <div className="card-section" style={{ animationDelay: '0.08s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>Personnaliser mes relances</h2>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>Modifiez le texte principal de chaque email de relance</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['Relance 1', 'Relance 2', 'Relance 3'].map((label, i) => (
                <button key={i} onClick={() => setTemplateTab(i)}
                  style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: templateTab === i ? '2px solid #ec4899' : '1.5px solid #E5E7EB', background: templateTab === i ? 'rgba(236,72,153,0.08)' : 'white', color: templateTab === i ? '#ec4899' : '#6B7280', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={templates[templateTab]}
              onChange={e => setTemplates(prev => prev.map((t, i) => i === templateTab ? e.target.value : t))}
              rows={6}
              style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 13, fontFamily: 'Inter, sans-serif', border: '1.5px solid #E5E7EB', color: '#111', resize: 'vertical', outline: 'none', lineHeight: 1.7 }}
            />

            {/* Variables disponibles */}
            <div style={{ marginTop: 8, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Variables :</span>
              {['{client}', '{montant}', '{facture}', '{echeance}', '{entreprise}'].map(v => (
                <span key={v} style={{ fontSize: 11, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 7px', color: '#374151', fontFamily: 'monospace', cursor: 'pointer' }}
                  onClick={() => {
                    const el = document.querySelector('textarea') as HTMLTextAreaElement
                    if (!el) return
                    const start = el.selectionStart
                    const end = el.selectionEnd
                    const newText = templates[templateTab].slice(0, start) + v + templates[templateTab].slice(end)
                    setTemplates(prev => prev.map((t, i) => i === templateTab ? newText : t))
                    setTimeout(() => { el.setSelectionRange(start + v.length, start + v.length); el.focus() }, 0)
                  }}>
                  {v}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowPreview(true)}
                style={{ background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#ec4899', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                👁 Aperçu email
              </button>
              <button
                onClick={() => setTemplates(prev => prev.map((t, i) => i === templateTab ? DEFAULT_MESSAGES[templateTab] : t))}
                style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#6B7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ↺ Réinitialiser au modèle standard
              </button>
            </div>
          </div>

          {/* Modal aperçu email */}
          {showPreview && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPreview(false)}>
              <div style={{ background: 'white', borderRadius: 20, padding: 0, maxWidth: 620, width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 2 }}>Aperçu — Relance {templateTab + 1}</h3>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>Visualisation avec des données d'exemple</p>
                  </div>
                  <button onClick={() => setShowPreview(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>×</button>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '0 0 20px' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100%', padding: '32px 28px', color: '#111' }}>
                    <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 28, color: '#111' }}>{companyName || 'Votre Société'}</p>
                    <h2 style={{ fontSize: 20, marginBottom: 16 }}>{templateTab === 0 ? 'Rappel de paiement' : templateTab === 1 ? 'Deuxième rappel de paiement' : 'Mise en demeure de payer'}</h2>
                    <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: 12 }}>Bonjour Jean Dupont,</p>
                    {templates[templateTab].split(/\n\n+/).map((p, i) => (
                      <p key={i} style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: 12 }}>
                        {p
                          .replace(/\{client\}/g, 'Jean Dupont')
                          .replace(/\{montant\}/g, '1 500')
                          .replace(/\{facture\}/g, 'FAC-2026-001')
                          .replace(/\{echeance\}/g, '01/03/2026')
                          .replace(/\{entreprise\}/g, companyName || 'Votre Société')}
                      </p>
                    ))}
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 16, margin: '20px 0' }}>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: 12 }}>Référence facture</p>
                      <p style={{ margin: '4px 0 8px', fontWeight: 700, color: '#111' }}>FAC-2026-001</p>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: 12 }}>Montant à régler</p>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: '#16A34A', fontSize: 20 }}>1 500 €</p>
                    </div>
                    <p style={{ color: '#6B7280', lineHeight: 1.7 }}>Cordialement,</p>
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#111' }}>{companyName || 'Votre Société'}</p>
                      {companyAddress && <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>{companyAddress}</p>}
                      {companyPhone && <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>Tél : {companyPhone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPTE */}
          <div className="card-section" style={{ animationDelay: '0.10s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(192,132,252,0.10)', border: '1px solid rgba(192,132,252,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 15, color: '#111' }}>Compte &amp; Abonnement</h2>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{user?.email}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>Email de connexion</p>
              </div>
            </div>

            {/* ── Stripe Connect ── */}
            {profile?.stripe_connect_account_id ? (
              // Connecté ✅
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>✓</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>Compte Stripe connecté</p>
                  <p style={{ fontSize: 11, color: '#16A34A' }}>Les paiements clients arrivent directement sur votre compte bancaire.</p>
                </div>
                <button onClick={openStripeConnect} disabled={connectLoading}
                  style={{ fontSize: 11, color: '#6B7280', background: 'white', border: '1px solid #D1FAE5', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                  Gérer
                </button>
              </div>
            ) : (
              // Non connecté ⚠️
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>💳</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>Compte Stripe non connecté</p>
                    <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.6 }}>
                      Sans Stripe, les relances sont envoyées mais sans lien de paiement. Vos clients ne peuvent pas payer directement depuis l'email.
                    </p>
                  </div>
                </div>
                <button onClick={openStripeConnect} disabled={connectLoading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: connectLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: connectLoading ? 0.6 : 1 }}>
                  {connectLoading ? 'Connexion...' : '🔗 Connecter mon compte Stripe →'}
                </button>
              </div>
            )}

            {/* Alerte paiement en retard */}
            {profile?.payment_status === 'past_due' && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 2 }}>Paiement en attente</p>
                  {profile?.payment_failed_at && (() => {
                    const deadline = new Date(new Date(profile.payment_failed_at).getTime() + 3 * 24 * 60 * 60 * 1000)
                    return <p style={{ fontSize: 12, color: '#EF4444' }}>Régularisez avant le {deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} pour éviter la suspension.</p>
                  })()}
                </div>
              </div>
            )}

            {/* Plan actuel */}
            <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 10 }}>
              <div className="compte-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: profile?.current_period_end ? 10 : 0 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Plan actuel</p>
                  <p style={{ fontSize: 13, color: '#a855f7', marginTop: 2, fontWeight: 700, textTransform: 'capitalize' }}>
                    {profile?.plan || 'Starter'}
                  </p>
                </div>
                <button onClick={() => setShowPlanModal(true)}
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 10px rgba(168,85,247,0.30)', whiteSpace: 'nowrap' }}>
                  Changer de plan
                </button>
              </div>

              {(() => {
                // Utilise current_period_end si disponible, sinon calcule depuis created_at
                const renewalDate = profile?.current_period_end
                  ? new Date(profile.current_period_end)
                  : profile?.created_at
                    ? (() => { const d = new Date(profile.created_at); d.setMonth(d.getMonth() + 1); return d })()
                    : null
                if (!renewalDate) return null
                return (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(168,85,247,0.05)', borderRadius: 8, border: '1px solid rgba(168,85,247,0.15)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>
                      Prochaine échéance prélevée le{' '}
                      <strong style={{ color: '#374151' }}>
                        {renewalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </strong>
                    </p>
                  </div>
                )
              })()}

              {profile?.pending_plan && profile?.pending_plan_effective_date && (
                <div style={{ marginTop: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px' }}>
                  <p style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                    Passage en {profile.pending_plan} planifié le {new Date(profile.pending_plan_effective_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Message changement de plan */}
            {planMessage && (
              <div style={{ background: planMessage.startsWith('error:') ? '#FEF2F2' : 'rgba(168,85,247,0.08)', border: `1px solid ${planMessage.startsWith('error:') ? '#FECACA' : 'rgba(168,85,247,0.25)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
                <p style={{ fontSize: 13, color: planMessage.startsWith('error:') ? '#DC2626' : '#7c3aed', fontWeight: 600 }}>
                  {planMessage.replace(/^(error:|success:)/, '')}
                </p>
              </div>
            )}

            {/* Portail Stripe */}
            <button onClick={openPortal} disabled={portalLoading}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: portalLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB' }}>
              {portalLoading ? 'Connexion...' : '💳 Gérer mon moyen de paiement'}
            </button>
          </div>

          {/* MODAL CHANGEMENT DE PLAN */}
          {showPlanModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPlanModal(false)}>
              <div style={{ background: 'white', borderRadius: 20, padding: '28px', maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 18, color: '#111' }}>Changer de plan</h3>
                  <button onClick={() => setShowPlanModal(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['starter', 'premium', 'pro'].map(plan => {
                    const isCurrent = profile?.plan === plan
                    const isPending = profile?.pending_plan === plan
                    const isUpgrade = (PLAN_ORDER[plan] || 0) > (PLAN_ORDER[profile?.plan] || 0)
                    const effectiveLabel = isUpgrade
                      ? 'Effectif immédiatement (avec prorata)'
                      : profile?.current_period_end
                        ? `Effectif le ${new Date(profile.current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                        : 'Effectif au prochain renouvellement'
                    return (
                      <div key={plan} style={{ border: `1.5px solid ${isCurrent || isPending ? PLAN_COLORS[plan] : '#E5E7EB'}`, borderRadius: 12, padding: '14px 16px', background: isCurrent ? 'rgba(168,85,247,0.04)' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#111', textTransform: 'capitalize', marginBottom: 3 }}>
                              {plan === 'starter' ? 'Starter — 19,99€/mois' : plan === 'premium' ? 'Premium — 49,99€/mois' : 'Pro — 149,99€/mois'}
                            </p>
                            {!isCurrent && !isPending && (
                              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{effectiveLabel}</p>
                            )}
                            {isPending && (
                              <p style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>Changement planifié</p>
                            )}
                          </div>
                          {isCurrent ? (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: `${PLAN_COLORS[plan]}20`, color: PLAN_COLORS[plan] }}>Actuel</span>
                          ) : isPending ? (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>Planifié</span>
                          ) : (
                            <button onClick={() => changePlan(plan)} disabled={changingPlan}
                              style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[plan]}, ${plan === 'pro' ? '#a855f7' : '#ec4899'})`, color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: changingPlan ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: changingPlan ? 0.6 : 1 }}>
                              {changingPlan ? '...' : isUpgrade ? 'Passer en ' + plan : 'Réduire en ' + plan}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 14, lineHeight: 1.6 }}>
                  Les upgrades sont effectifs immédiatement avec un prorata. Les downgrades sont effectifs à la fin de votre période de facturation en cours.
                </p>
              </div>
            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div style={{ background: isError ? '#FEF2F2' : 'rgba(168,85,247,0.08)', border: `1px solid ${isError ? '#FECACA' : 'rgba(168,85,247,0.25)'}`, borderRadius: 10, padding: '11px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: isError ? '#DC2626' : '#7c3aed', fontWeight: 600 }}>{msgText}</p>
            </div>
          )}

          <button onClick={saveProfile} disabled={saving}
            style={{ background: saving ? '#E5E7EB' : 'linear-gradient(135deg, #a855f7, #ec4899)', color: saving ? '#9CA3AF' : 'white', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: saving ? 'none' : '0 4px 16px rgba(168,85,247,0.35)', transition: 'all 0.2s', width: isMobile ? '100%' : 'auto' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </div>
    </>
  )
}

