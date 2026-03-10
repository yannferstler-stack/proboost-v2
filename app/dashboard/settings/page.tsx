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
        setMessage('❌ Chaque délai doit être supérieur au précédent')
        setSaving(false)
        setTimeout(() => setMessage(''), 4000)
        return
      }
    }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      company_name: companyName,
      company_address: companyAddress,
      company_phone: companyPhone,
      canal_relance: canalRelance,
      sequence_j1: seqJ1,
      sequence_j2: seqJ2,
      sequence_j3: seqJ3,
      sequence_j4: seqJ4,
      sequence_j5: seqJ5,
    })
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('✅ Paramètres sauvegardés !')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const delaiInputStyle = (disabled: boolean) => ({
    width: 72, borderRadius: 8, padding: '8px 10px', fontSize: 14,
    fontFamily: 'Inter, sans-serif', textAlign: 'center' as const,
    border: `1.5px solid ${disabled ? '#E5E7EB' : '#D1D5DB'}`,
    background: disabled ? '#F3F4F6' : 'white',
    color: disabled ? '#9CA3AF' : '#111',
    cursor: disabled ? 'not-allowed' : 'text',
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E0E0E0', borderTop: '3px solid #1DB954', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F6F8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-field {
          transition: all 0.2s;
          border: 1.5px solid #D1D5DB !important;
          color: #111 !important;
          background: white !important;
        }
        .input-field::placeholder { color: #9CA3AF !important; }
        .input-field:focus { outline: none; border-color: #1DB954 !important; box-shadow: 0 0 0 3px rgba(29,185,84,0.10); }
        .delai-input:focus { outline: none; border-color: #1DB954 !important; box-shadow: 0 0 0 3px rgba(29,185,84,0.10); }
        .btn-main { transition: all 0.2s; }
        .btn-main:hover { background: #18a34a !important; transform: translateY(-1px); }
        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }
        .sidebar-link:hover { background: rgba(29,185,84,0.08) !important; color: #1DB954 !important; }
        .canal-btn { transition: all 0.15s; }
        .canal-btn:hover:not(:disabled) { border-color: #9CA3AF !important; }
        .seq-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
        .seq-row:last-child { border-bottom: none; }
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
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/importer'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>📥</span> Importer
            </div>
            <div className="sidebar-link" onClick={() => window.location.href = '/dashboard/facturation'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#6B7280', fontSize: 14 }}>
              <span>💰</span> Facturation
            </div>
            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#1DB954', fontSize: 14, fontWeight: 600, background: 'rgba(29,185,84,0.12)' }}>
              <span>⚙️</span> Paramètres
            </div>
          </nav>
          <div style={{ borderTop: '1px solid #EAECEF', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
        <div style={{ marginLeft: 240, flex: 1, padding: 40, maxWidth: 860 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 4 }}>Paramètres</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Ces informations apparaîtront dans vos emails de relance</p>
          </div>

          {/* BLOC SOCIÉTÉ */}
          <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 24 }}>🏢 Votre société</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Nom de la société *</label>
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>🚨</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 4 }}>Information importante</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#DC2626', lineHeight: 1.6 }}>Ce nom apparaîtra dans <strong>tous vos emails de relance</strong>. Assurez-vous qu'il corresponde à votre raison sociale officielle.</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Dupont & Associés SARL"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Adresse</label>
                <input
                  type="text"
                  placeholder="Ex: 12 rue de la Paix, 75001 Paris"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: 01 23 45 67 89"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* BLOC SÉQUENCE */}
          <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 4 }}>⏱️ Séquence de relance</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Définissez les délais (en jours) après la date d'échéance</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                background: isPro ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : isPremiumOrPro ? '#EFF6FF' : '#F3F4F6',
                color: isPro ? 'white' : isPremiumOrPro ? '#3B82F6' : '#6B7280',
              }}>
                {isPro ? '⭐ Pro' : isPremiumOrPro ? 'Premium' : 'Starter'}
              </span>
            </div>

            {/* Starter : fixe non modifiable */}
            {!isPremiumOrPro && (
              <>
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>🔒</span>
                  <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 500 }}>
                    La personnalisation est disponible à partir du plan <strong>Premium</strong>.{' '}
                    <span onClick={() => window.location.href = '/pricing'} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Passer Premium →</span>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[{ label: 'Relance 1', value: 7 }, { label: 'Relance 2', value: 15 }, { label: 'Relance 3', value: 30 }].map((r, i) => (
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
                  ))}
                </div>
              </>
            )}

            {/* Premium / Pro : modifiable */}
            {isPremiumOrPro && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'Relance 1', value: seqJ1, set: setSeqJ1, locked: false },
                  { label: 'Relance 2', value: seqJ2, set: setSeqJ2, locked: false },
                  { label: 'Relance 3', value: seqJ3, set: setSeqJ3, locked: false },
                  { label: 'Relance 4 (optionnelle)', value: seqJ4, set: setSeqJ4, locked: !isPro, optional: true },
                  { label: 'Relance 5 (optionnelle)', value: seqJ5, set: setSeqJ5, locked: !isPro, optional: true },
                ].map((r, i) => {
                  const isOptional = r.optional
                  const isLocked = r.locked
                  const isActive = !isOptional || r.value !== null
                  return (
                    <div key={i} className="seq-row" style={{ opacity: isLocked ? 0.5 : 1 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: isLocked ? '#F3F4F6' : isActive ? '#F0FDF4' : '#F3F4F6',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isLocked ? '#9CA3AF' : isActive ? '#16A34A' : '#6B7280' }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 13, color: isLocked ? '#9CA3AF' : '#374151', fontWeight: 500, flex: 1 }}>
                        {r.label}
                        {isLocked && <span style={{ marginLeft: 8, fontSize: 11, color: '#9CA3AF' }}>🔒 Pro</span>}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isOptional && !isLocked && (
                          <button
                            onClick={() => r.set(r.value === null ? (i === 3 ? seqJ3 + 15 : (seqJ4 || seqJ3) + 15) : null)}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif',
                              background: r.value !== null ? '#FEF2F2' : '#F0FDF4',
                              color: r.value !== null ? '#DC2626' : '#16A34A',
                            }}>
                            {r.value !== null ? '− Supprimer' : '+ Ajouter'}
                          </button>
                        )}
                        <input
                          type="number" min={1} max={365}
                          value={r.value ?? ''}
                          disabled={isLocked || (isOptional && r.value === null)}
                          onChange={(e) => !isLocked && r.set(parseInt(e.target.value) || null)}
                          className="delai-input"
                          style={delaiInputStyle(isLocked || (isOptional && r.value === null))}
                        />
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>jours</span>
                      </div>
                    </div>
                  )
                })}
                <div style={{ marginTop: 16, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <p style={{ fontSize: 12, color: '#15803d' }}>
                    Exemple avec vos réglages : J+{seqJ1}, J+{seqJ2}, J+{seqJ3}
                    {seqJ4 ? `, J+${seqJ4}` : ''}{seqJ5 ? `, J+${seqJ5}` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Canal de relance */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #EAECEF' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>Canal de relance par défaut</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Choisissez comment ProBoost relance vos clients par défaut</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { value: 'email', label: '✉️ Email uniquement', proOnly: false },
                  { value: 'sms', label: '📱 SMS uniquement', proOnly: true },
                  { value: 'both', label: '✉️ + 📱 Email & SMS', proOnly: true },
                ].map(opt => {
                  const disabled = opt.proOnly && !isPro
                  const active = canalRelance === opt.value
                  return (
                    <button key={opt.value} className="canal-btn" disabled={disabled}
                      onClick={() => !disabled && setCanalRelance(opt.value)}
                      title={disabled ? 'Plan Pro requis' : ''}
                      style={{
                        padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                        border: active ? '2px solid #1DB954' : '1.5px solid #E5E7EB',
                        background: active ? '#F0FDF4' : disabled ? '#F9FAFB' : 'white',
                        color: disabled ? '#9CA3AF' : active ? '#16A34A' : '#374151',
                      }}>
                      {opt.label}
                      {disabled && <span style={{ marginLeft: 6, fontSize: 10, color: '#9CA3AF' }}>🔒 Pro</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* BLOC COMPTE */}
          <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #EAECEF', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 16 }}>👤 Compte</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <button onClick={() => window.location.href = '/pricing'}
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Changer de plan →
              </button>
            </div>
          </div>

          {message && (
            <div style={{ background: message.includes('✅') ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${message.includes('✅') ? '#BBF7D0' : '#FECACA'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: message.includes('✅') ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{message}</p>
            </div>
          )}

          <button className="btn-main" onClick={saveProfile} disabled={saving}
            style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(29,185,84,0.25)' }}>
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres'}
          </button>
        </div>
      </div>
    </>
  )
}