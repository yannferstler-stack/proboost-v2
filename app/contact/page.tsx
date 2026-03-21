'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const FAQ_RAPIDE = [
  { q: 'Délai de réponse ?', r: 'Nous répondons sous 24 à 48h ouvrées.' },
  { q: 'Support technique', r: 'Pour les bugs ou problèmes sur votre compte, précisez votre email de connexion.' },
  { q: 'Questions de facturation', r: 'Pour tout litige sur un paiement ou une commission, joignez le numéro de facture concerné.' },
  { q: 'Plan Pro — support prioritaire', r: 'Les abonnés Pro bénéficient d\'un délai de réponse prioritaire sous 4h ouvrées.' },
]

export default function ContactPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connecter à un backend (Resend, Supabase Edge Function, etc.)
    setSent(true)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .input-field { transition: all 0.2s; border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); width: 100%; border-radius: 12px; padding: 13px 16px; font-size: 14px; font-family: Inter, sans-serif; color: white; }
        .input-field::placeholder { color: rgba(255,255,255,0.30); }
        .input-field:focus { outline: none; border-color: rgba(168,85,247,0.60) !important; box-shadow: 0 0 0 4px rgba(168,85,247,0.12); background: rgba(255,255,255,0.09); }
        .btn-submit { transition: all 0.2s; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; width: 100%; box-shadow: 0 4px 24px rgba(168,85,247,0.40); }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .info-card { border: 1px solid rgba(255,255,255,0.08); transition: border-color 0.2s, transform 0.2s; }
        .info-card:hover { border-color: rgba(168,85,247,0.30); transform: translateY(-2px); }
        .faq-item { border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.2s; }
        .faq-item:hover { border-color: rgba(168,85,247,0.25); }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh' }}>

        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: 'white' }}>ManaFlow</span>
            </div>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14 }}>Accueil</span>
              <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14 }}>Comment ça marche ?</span>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '72px 20px 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Réponse sous 48h</span>
          </div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
            Une question ?<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>On est là.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.45)', maxWidth: 440, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Que ce soit pour une question sur le service, un problème technique ou une suggestion, écrivez-nous.
          </p>
        </div>

        {/* GRILLE PRINCIPALE */}
        <section style={{ padding: isMobile ? '0 20px 80px' : '0 40px 100px', maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Infos de contact */}
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                titre: 'Email',
                valeur: 'contact@manaflow.fr',
                detail: 'Réponse sous 24–48h ouvrées',
                couleur: '#a855f7',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                titre: 'Horaires',
                valeur: 'Lun–Ven, 9h–18h',
                detail: 'Heure de Paris (CET/CEST)',
                couleur: '#ec4899',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                titre: 'Localisation',
                valeur: 'Paris, France',
                detail: 'Entreprise française',
                couleur: '#a855f7',
              },
            ].map((item, i) => (
              <div key={i} className="info-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '24px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, background: `rgba(${item.couleur === '#a855f7' ? '168,85,247' : '236,72,153'},0.12)`, border: `1px solid rgba(${item.couleur === '#a855f7' ? '168,85,247' : '236,72,153'},0.25)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.titre}</p>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 2 }}>{item.valeur}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire + FAQ rapide */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: 32, alignItems: 'start' }}>

            {/* Formulaire */}
            <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: isMobile ? '28px 24px' : '40px 36px' }}>
              {!sent ? (
                <>
                  <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 6 }}>Envoyez-nous un message</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 28 }}>Tous les champs sont obligatoires.</p>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nom</label>
                        <input type="text" placeholder="Votre nom" required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="input-field" />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email</label>
                        <input type="email" placeholder="vous@entreprise.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Sujet</label>
                      <select required value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} className="input-field" style={{ cursor: 'pointer' }}>
                        <option value="" disabled>Choisissez un sujet</option>
                        <option value="question-service">Question sur le service</option>
                        <option value="probleme-technique">Problème technique</option>
                        <option value="facturation">Facturation / abonnement</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Message</label>
                      <textarea placeholder="Décrivez votre question ou problème..." required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field" style={{ resize: 'vertical', minHeight: 120 }} />
                    </div>
                    <button type="submit" className="btn-submit">
                      Envoyer le message →
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
                  <div style={{ width: 64, height: 64, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.30)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 8 }}>Message envoyé !</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Nous reviendrons vers vous à l&apos;adresse <span style={{ color: '#c084fc', fontWeight: 600 }}>{form.email}</span> sous 48h ouvrées.</p>
                </div>
              )}
            </div>

            {/* FAQ rapide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>Questions fréquentes</p>
              {FAQ_RAPIDE.map((faq, i) => (
                <div key={i} className="faq-item" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '18px 20px' }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 700, color: 'white', fontSize: 13, marginBottom: 6 }}>{faq.q}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{faq.r}</p>
                </div>
              ))}

              <div style={{ marginTop: 8, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                  Consultez aussi notre page{' '}
                  <span onClick={() => router.push('/comment-ca-marche')} style={{ color: '#c084fc', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Comment ça marche ?
                  </span>{' '}
                  pour les questions sur le service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 15, color: 'white' }}>ManaFlow</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2025 ManaFlow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/cgu')} style={{ fontSize: 12 }}>CGU</span>
              <span className="nav-a" onClick={() => router.push('/confidentialite')} style={{ fontSize: 12 }}>Confidentialité</span>
              <span className="nav-a" style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
