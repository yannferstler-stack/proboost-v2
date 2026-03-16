'use client'
import { useRouter } from 'next/navigation'

export default function CommentCaMarchePage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .faq-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); }
        .faq-card:hover { border-color: rgba(168,85,247,0.35) !important; box-shadow: 0 4px 24px rgba(168,85,247,0.12) !important; transform: translateY(-2px); }
        .temoignage-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); }
        .temoignage-card:hover { border-color: rgba(168,85,247,0.30) !important; transform: translateY(-2px); }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 36px; font-size: 15px; box-shadow: 0 4px 24px rgba(168,85,247,0.40); }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes déco */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: 'white' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14, fontWeight: 500 }}>Accueil</span>
            <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14, fontWeight: 500 }}>Blog</span>
            <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>Comment ça marche ?</span>
            <button className="btn-connexion" onClick={() => router.push('/login')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Connexion
            </button>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '72px 20px 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Guide complet</span>
          </div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 60px)', color: 'white', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
            Tout savoir sur<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ProBoost</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.50)', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Une vidéo, vos questions, et des retours clients — tout ce qu'il faut pour se lancer.
          </p>
        </div>

        {/* VIDÉO */}
        <section style={{ padding: '0 40px 80px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>01 — Vidéo explicative</span>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: 'white', letterSpacing: '-1px', marginTop: 8 }}>Voyez ProBoost en action</h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 20, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 24px rgba(168,85,247,0.45)' }}>
              <span style={{ fontSize: 24, marginLeft: 5 }}>▶</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: 14 }}>Vidéo de présentation — à venir</p>
          </div>
        </section>

        {/* Q&A */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>02 — Questions & Réponses</span>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: 'white', letterSpacing: '-1px', marginTop: 8 }}>Vos questions, nos réponses</h2>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { q: 'Comment fonctionne la commission ?', r: 'La commission est prélevée uniquement sur les factures effectivement recouvrées. Si la facture n\'est pas payée, vous ne payez rien en plus de votre abonnement.' },
                { q: 'Quels types de fichiers puis-je importer ?', r: 'ProBoost accepte les fichiers CSV et PDF. Notre IA extrait automatiquement les informations client, le montant et la date d\'échéance.' },
                { q: 'Puis-je changer de plan ?', r: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace client. Le changement est effectif immédiatement.' },
                { q: 'Les SMS sont-ils inclus dans tous les plans ?', r: 'Les SMS sont disponibles uniquement dans le plan Pro. Les plans Starter et Premium incluent les relances par email uniquement.' },
                { q: 'Qu\'est-ce que la commission minimum de 5 € ?', r: 'Pour les petites factures, la commission ne peut pas être inférieure à 5 €. Cela garantit la viabilité du service même sur de petits montants.' },
                { q: 'Mes données sont-elles sécurisées ?', r: 'Oui. Toutes vos données sont chiffrées et hébergées en Europe. Nous ne partageons jamais vos informations avec des tiers.' },
              ].map((faq, i) => (
                <div key={i} className="faq-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '24px 28px' }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 8 }}>{faq.q}</p>
                  <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.7 }}>{faq.r}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>03 — Témoignages</span>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: 'white', letterSpacing: '-1px', marginTop: 8 }}>Ils nous font confiance</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { nom: 'Marie L.', role: 'Gérante TPE', texte: '« En 2 semaines, ProBoost a récupéré 3 factures que je pensais perdues. Bluffant. »', initiale: 'M' },
                { nom: 'Thomas R.', role: 'Directeur PME', texte: '« Fini les relances manuelles. Je gagne 5h par semaine et mon taux de recouvrement a doublé. »', initiale: 'T' },
                { nom: 'Sophie K.', role: 'Comptable indépendante', texte: '« Simple, efficace, et je ne paye que si ça fonctionne. Je recommande à tous mes clients. »', initiale: 'S' },
              ].map((t, i) => (
                <div key={i} className="temoignage-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '28px 24px' }}>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{t.texte}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{t.initiale}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{t.nom}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '80px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 20 }}>Prêt à démarrer ?</p>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 36, color: 'white', letterSpacing: '-1.5px', marginBottom: 16 }}>
            Récupérez vos impayés<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dès aujourd'hui.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 15, marginBottom: 32 }}>Commission uniquement sur les factures recouvrées.</p>
          <button className="btn-cta" onClick={() => router.push('/souscrire')}>
            Souscrire un abonnement →
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 15, color: 'white' }}>ProBoost</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2025 ProBoost — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['CGU', 'Confidentialité', 'Contact'].map(l => (
              <span key={l} className="nav-a" style={{ fontSize: 12, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}
