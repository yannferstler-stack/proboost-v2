'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

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
  const supabase = createClient()

  const isPro = profile?.plan === 'pro'
  const isPremiumOrPro = profile?.plan === 'premium' || profile?.plan === 'pro'

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setCompanyName(data.company_name || '')
        setCompanyAddress(data.company_address || '')
        setCompanyPhone(data.company_phone || '')
        setCanalRelance(data.canal_relance || 'email')
        setSeqJ1(data.sequence_j1 || 7)
        setSeqJ2(data.sequence_j2 || 15)
        setSeqJ3(data.sequence_j3 || 30)
        setSeqJ4(data.sequence_j4 || null)
        setSeqJ5(data.sequence_j5 || null)
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
    width: 72, borderRadius: 8, padding: '8px 10px', fontSize: 14,
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        .input-field:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.10); }
        .delai-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.10); }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(168,85,247,0.08) !important; color: #a855f7 !important; }
        .canal-btn { transition: all 0.15s; cursor: pointer; }
        .canal-btn:hover:not(:disabled) { border-color: #a855f7 !important; }
        .seq-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
        .seq-row:last-child { border-bottom: none; }
        .card-section { background: white; border-radius: 16px; padding: 28px 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #EAECEF; margin-bottom: 20px; animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F8' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(168,85,247,0.35)' }}>
              <span style={{ color: 'white', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16 }}>P</span>
            </div>
            <span onClick={() => window.location.href = '/'} style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#111', cursor: 'pointer' }}>ProBoost</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {[
              { label: 'Tableau de bord', href: '/dashboard', active: false },
              { label: 'Importer', href: '/dashboard/importer', active: false },
              { label: 'Facturation', href: '/dashboard/facturation', active: false },
              { label: 'Paramètres', href: '/dashboard/settings', active: true },
            ].map(item => (
              <div key={item.label} className="sidebar-link"
                onClick={() => window.location.href = item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: item.active ? '#a855f7' : '#6B7280', fontSize: 14, fontWeight: item.active ? 600 : 400, background: item.active ? 'rgba(168,85,247,0.08)' : 'transparent' }}>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ borderTop: '1px solid #EAECEF', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                  style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ marginLeft: 240, flex: 1, padding: '32px 32px', maxWidth: 860 }}>
          <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 4 }}>Paramètres</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Ces informations apparaîtront dans vos emails de relance</p>
          </div>

          {/* SOCIÉTÉ */}
          <div className="card-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Votre société</h2>
            </div>

            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 3 }}>Information importante</p>
                <p style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.6 }}>Ce nom apparaîtra dans <strong>tous vos emails de relance</strong>. Assurez-vous qu'il corresponde à votre raison sociale officielle.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nom de la société *</label>
                <input type="text" placeholder="Ex: Dupont & Associés SARL" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Adresse</label>
                <input type="text" placeholder="Ex: 12 rue de la Paix, 75001 Paris" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="input-field" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Téléphone</label>
                <input type="text" placeholder="Ex: 01 23 45 67 89" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="input-field" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* SÉQUENCE */}
          <div className="card-section" style={{ animationDelay: '0.05s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 2 }}>Séquence de relance</h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>Délais en jours après la date d'échéance</p>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                background: isPro ? 'linear-gradient(135deg, #a855f7, #ec4899)' : isPremiumOrPro ? 'rgba(168,85,247,0.10)' : '#F3F4F6',
                color: isPro ? 'white' : isPremiumOrPro ? '#7c3aed' : '#6B7280',
              }}>
                {isPro ? 'Pro' : isPremiumOrPro ? 'Premium' : 'Starter'}
              </span>
            </div>

            {!isPremiumOrPro && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 500 }}>
                  La personnalisation est disponible à partir du plan <strong>Premium</strong>.{' '}
                  <span onClick={() => window.location.href = '/souscrire'} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Passer Premium →</span>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {isPremiumOrPro ? (
                [
                  { label: 'Relance 1', value: seqJ1, set: setSeqJ1 as (v: number | null) => void, locked: false },
                  { label: 'Relance 2', value: seqJ2, set: setSeqJ2 as (v: number | null) => void, locked: false },
                  { label: 'Relance 3', value: seqJ3, set: setSeqJ3 as (v: number | null) => void, locked: false },
                  { label: 'Relance 4 (optionnelle)', value: seqJ4, set: setSeqJ4 as (v: number | null) => void, locked: !isPro, optional: true },
                  { label: 'Relance 5 (optionnelle)', value: seqJ5, set: setSeqJ5 as (v: number | null) => void, locked: !isPro, optional: true },
                ].map((r, i) => {
                  const isOptional = r.optional
                  const isLocked = r.locked
                  const isActive = !isOptional || r.value !== null
                  return (
                    <div key={i} className="seq-row" style={{ opacity: isLocked ? 0.5 : 1 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isLocked ? '#F3F4F6' : isActive ? 'rgba(168,85,247,0.12)' : '#F3F4F6', border: isActive && !isLocked ? '1px solid rgba(168,85,247,0.25)' : 'none' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isLocked ? '#9CA3AF' : isActive ? '#a855f7' : '#6B7280' }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 13, color: isLocked ? '#9CA3AF' : '#374151', fontWeight: 500, flex: 1 }}>
                        {r.label}
                        {isLocked && <span style={{ marginLeft: 8, fontSize: 11, color: '#9CA3AF' }}>Pro requis</span>}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isOptional && !isLocked && (
                          <button onClick={() => r.set(r.value === null ? (i === 3 ? seqJ3 + 15 : (seqJ4 || seqJ3) + 15) : null)}
                            style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif', background: r.value !== null ? '#FEF2F2' : 'rgba(168,85,247,0.10)', color: r.value !== null ? '#DC2626' : '#7c3aed' }}>
                            {r.value !== null ? '− Supprimer' : '+ Ajouter'}
                          </button>
                        )}
                        <input type="number" min={1} max={365} value={r.value ?? ''} disabled={isLocked || (isOptional && r.value === null)}
                          onChange={e => !isLocked && r.set(parseInt(e.target.value) || null)}
                          className="delai-input" style={delaiInputStyle(!!(isLocked || (isOptional && r.value === null)))} />
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>jours</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                [{ label: 'Relance 1', value: 7 }, { label: 'Relance 2', value: 15 }, { label: 'Relance 3', value: 30 }].map((r, i) => (
                  <div key={i} className="seq-row">
                    <div style={{ width: 24, height: 24, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>{r.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" value={r.value} disabled className="delai-input" style={delaiInputStyle(true)} />
                      <span style={{ fontSize: 13, color: '#9CA3AF' }}>jours après échéance</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isPremiumOrPro && (
              <div style={{ marginTop: 14, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 12, color: '#7c3aed' }}>
                  Vos délais : J+{seqJ1}, J+{seqJ2}, J+{seqJ3}{seqJ4 ? `, J+${seqJ4}` : ''}{seqJ5 ? `, J+${seqJ5}` : ''}
                </p>
              </div>
            )}

            {/* Canal */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>Canal de relance par défaut</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Choisissez comment ProBoost relance vos clients par défaut</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
                      title={disabled ? 'Plan Pro requis' : ''}
                      style={{
                        padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                        border: active ? '2px solid #a855f7' : '1.5px solid #E5E7EB',
                        background: active ? 'rgba(168,85,247,0.10)' : disabled ? '#F9FAFB' : 'white',
                        color: disabled ? '#9CA3AF' : active ? '#7c3aed' : '#374151',
                      }}>
                      {opt.label}
                      {disabled && <span style={{ marginLeft: 6, fontSize: 10, color: '#9CA3AF' }}>Pro requis</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* COMPTE */}
          <div className="card-section" style={{ animationDelay: '0.10s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, background: 'rgba(192,132,252,0.10)', border: '1px solid rgba(192,132,252,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Compte</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{user?.email}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>Email de connexion</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Plan actuel</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' }}>{profile?.plan || 'Starter'}</p>
              </div>
              <button onClick={() => window.location.href = '/souscrire'}
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 10px rgba(168,85,247,0.30)' }}>
                Changer de plan →
              </button>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div style={{ background: isError ? '#FEF2F2' : 'rgba(168,85,247,0.08)', border: `1px solid ${isError ? '#FECACA' : 'rgba(168,85,247,0.25)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: isError ? '#DC2626' : '#7c3aed', fontWeight: 600 }}>{msgText}</p>
            </div>
          )}

          <button onClick={saveProfile} disabled={saving}
            style={{ background: saving ? '#E5E7EB' : 'linear-gradient(135deg, #a855f7, #ec4899)', color: saving ? '#9CA3AF' : 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: saving ? 'none' : '0 4px 16px rgba(168,85,247,0.35)', transition: 'all 0.2s' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </div>
    </>
  )
}
