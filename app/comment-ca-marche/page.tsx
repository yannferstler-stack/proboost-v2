'use client'
import { useRouter } from 'next/navigation'

export default function CommentCaMarchePage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        .nav-a { transition: color 0.15s; cursor: pointer; }
        .nav-a:hover { color: #1DB954 !important; }
        .btn-g { background: #1DB954; color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; }
        .btn-g:hover { background: #17a348 !important; transform: translateY(-1px); }
        .faq-card { transition: box-shadow 0.2s; }
        .faq-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 184, height: 184, objectFit: 'contain', borderRadius: 16 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#111' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Accueil</span>
            <span className="nav-a" style={{ fontSize: 14, color: '#1DB954', fontWeight: 700 }}>Comment ça marche ?</span>
            <button className="btn-g" onClick={() => router.push('/login')} style={{ borderRadius: 8, padding: '8px 18px', fontSize: 13 }}>
              Connexion →
            </button>
          </div>
        </nav>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', padding: '72px 20px 48px' }}>
          <span style={{ fontSize: 11, color: '#1DB954', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Comment ça marche ?</span>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 60px)', color: '#0a0a0a', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
            Tout savoir sur<br/><span style={{ color: '#1DB954' }}>ProBoost</span>
          </h1>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 480, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Une vidéo, vos questions, et des retours clients — tout ce qu'il faut pour se lancer.
          </p>
        </div>

        {/* ── PARTIE 1 : VIDÉO ── */}
        <section style={{ padding: '0 40px 80px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>01 — Vidéo explicative</span>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 30, color: '#0a0a0a', letterSpacing: '-1px', marginTop: 8 }}>Voyez ProBoost en action</h2>
          </div>
          {/* Placeholder vidéo */}
          <div style={{ background: '#0a0a0a', borderRadius: 20, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, border: '1px solid #1f1f1f' }}>
            <div style={{ width: 72, height: 72, background: '#1DB954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 28, marginLeft: 6 }}>▶</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Vidéo de présentation — à venir</p>
          </div>
        </section>

        {/* ── PARTIE 2 : Q&A ── */}
        <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '80px 40px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>02 — Questions & Réponses</span>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 30, color: '#0a0a0a', letterSpacing: '-1px', marginTop: 8 }}>Vos questions, nos réponses</h2>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { q: 'Comment fonctionne la commission ?', r: 'La commission est prélevée uniquement sur les factures effectivement recouvrées. Si la facture n\'est pas payée, vous ne payez rien en plus de votre abonnement.' },
                { q: 'Quels types de fichiers puis-je importer ?', r: 'ProBoost accepte les fichiers CSV et PDF. Notre IA extrait automatiquement les informations client, le montant et la date d\'échéance.' },
                { q: 'Puis-je changer de plan ?', r: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace client. Le changement est effectif immédiatement.' },
                { q: 'Les SMS sont-ils inclus dans tous les plans ?', r: 'Les SMS sont disponibles uniquement dans le plan Pro. Les plans Starter et Premium incluent les relances par email uniquement.' },
                { q: 'Qu\'est-ce que la commission minimum de 5€ ?', r: 'Pour les petites factures, la commission ne peut pas être inférieure à 5€. Cela garantit la viabilité du service même sur de petits montants.' },
                { q: 'Mes données sont-elles sécurisées ?', r: 'Oui. Toutes vos données sont chiffrées et hébergées en Europe. Nous ne partageons jamais vos informations avec des tiers.' },
              ].map((faq, i) => (
                <div key={i} className="faq-card" style={{ background: 'white', borderRadius: 14, padding: '24px 28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <p style={{ fontFamily: 'Manrope', fontWeight: 700, color: '#111', fontSize: 16, marginBottom: 8 }}>{faq.q}</p>
                  <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>{faq.r}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTIE 3 : TÉMOIGNAGES ── */}
        <section style={{ padding: '80px 40px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>03 — Témoignages</span>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 30, color: '#0a0a0a', letterSpacing: '-1px', marginTop: 8 }}>Ils nous font confiance</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { nom: 'Marie L.', role: 'Gérante TPE', texte: '« En 2 semaines, ProBoost a récupéré 3 factures que je pensais perdues. Bluffant. »', initiale: 'M' },
                { nom: 'Thomas R.', role: 'Directeur PME', texte: '« Fini les relances manuelles. Je gagne 5h par semaine et mon taux de recouvrement a doublé. »', initiale: 'T' },
                { nom: 'Sophie K.', role: 'Comptable indépendante', texte: '« Simple, efficace, et je ne paye que si ça fonctionne. Je recommande à tous mes clients. »', initiale: 'S' },
              ].map((t, i) => (
                <div key={i} style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 16, padding: '28px 24px' }}>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{t.texte}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1DB954, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{t.initiale}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{t.nom}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: '#0a0a0a', padding: '64px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 36, color: 'white', letterSpacing: '-1.5px', marginBottom: 16 }}>
            Prêt à récupérer vos impayés ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 32 }}>Commission uniquement sur les factures recouvrées.</p>
          <button className="btn-g" onClick={() => router.push('/login')} style={{ borderRadius: 10, padding: '14px 32px', fontSize: 15, boxShadow: '0 4px 20px rgba(29,185,84,0.3)' }}>
            Connexion →
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 5 }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 30, color: '#111' }}>ProBoost</span>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>© 2025 ProBoost — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['CGU', 'Confidentialité', 'Contact'].map(l => (
              <span key={l} className="nav-a" style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}
