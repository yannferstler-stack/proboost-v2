'use client'
import { useRouter } from 'next/navigation'

export default function NousConnaitrePage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 36px; font-size: 15px; box-shadow: 0 4px 24px rgba(168,85,247,0.40); }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .profile-card { transition: all 0.2s; }
        .profile-card:hover { transform: translateY(-4px); }
        .value-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); }
        .value-card:hover { border-color: rgba(168,85,247,0.35); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.12); }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: 'white' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14 }}>Accueil</span>
            <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14 }}>Blog</span>
            <span className="nav-a" onClick={() => router.push('/comment-ca-marche')} style={{ fontSize: 14 }}>Comment ça marche ?</span>
            <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>Nous connaître</span>
            <button className="btn-connexion" onClick={() => router.push('/login')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Connexion
            </button>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '80px 20px 64px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: '#a855f7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>Notre histoire</span>
          </div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 60px)', color: 'white', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
            Nés d&apos;un paradoxe,<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>construits pour vous.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.50)', maxWidth: 520, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
            Deux parcours, une conviction commune : les TPE méritent des outils aussi puissants que ceux des grandes entreprises.
          </p>
        </div>

        {/* PROFILES */}
        <section style={{ padding: '0 40px 80px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

            {/* Yann */}
            <div className="profile-card" style={{ background: 'rgba(168,85,247,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 24, padding: '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(168,85,247,0.40)' }}>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 24, color: 'white' }}>Y</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 4 }}>Yann</h3>
                  <span style={{ fontSize: 12, background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>Finance · 10 ans d'expérience</span>
                </div>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, fontWeight: 300 }}>
                Yann a passé dix ans dans la finance. Il y a vu de grandes entreprises développer des modèles économiques extrêmement complexes et des entrepreneurs bâtir de véritables succès. Mais il a aussi observé un paradoxe étonnant : les impayés sont presque toujours procrastinés. La solution est souvent simple, mais personne n'a vraiment envie de s'en occuper.
              </p>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  « Alors une idée est née : utiliser l'intelligence artificielle pour créer un outil simple et efficace, capable de gérer ces relances sans friction. »
                </p>
              </div>
            </div>

            {/* Anne-Sophie */}
            <div className="profile-card" style={{ background: 'rgba(236,72,153,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(236,72,153,0.20)', borderRadius: 24, padding: '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #ec4899, #be185d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(236,72,153,0.40)' }}>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 24, color: 'white' }}>A</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 4 }}>Anne-Sophie</h3>
                  <span style={{ fontSize: 12, background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>Marketing & Communication · 15 ans</span>
                </div>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, fontWeight: 300 }}>
                Anne-Sophie travaille dans le marketing et la communication depuis près de quinze ans. Fille de tapissier décorateur, elle se souvient avoir aidé son père à faire ses factures sur Word lorsque les ordinateurs sont arrivés dans les foyers. Très tôt, elle a constaté l'approximation qui peut exister chez certains artisans dès qu'il s'agit d'administratif ou de relances.
              </p>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  « La relation client est précieuse et ne doit jamais être abîmée, car elle est souvent la clé de la pérennité d'une entreprise. »
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>Notre mission</span>
            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 44px)', color: 'white', lineHeight: 1.3, marginBottom: 32, letterSpacing: '-0.5px' }}>
              Contribuer, à notre échelle,<br/>à faire vivre l&apos;économie française.
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontWeight: 300, maxWidth: 640, margin: '0 auto' }}>
              Aider les TPE à mieux gérer leur trésorerie pour leur permettre de se développer et de se pérenniser.
            </p>
          </div>
        </section>

        {/* VALEURS */}
        <section style={{ padding: '0 40px 80px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { icon: '⚡', titre: 'Simplicité', texte: 'Un outil pensé pour des entrepreneurs, pas pour des équipes IT. Tout est automatisé, tout est intuitif.' },
                { icon: '🤝', titre: 'Relation client préservée', texte: 'Nos relances sont conçues pour récupérer l\'argent sans jamais abîmer la relation humaine qui a pris des années à construire.' },
                { icon: '🎯', titre: 'Alignement d\'intérêts', texte: 'Nous sommes rémunérés uniquement sur les fonds récupérés. Votre succès est littéralement le nôtre.' },
              ].map((v, i) => (
                <div key={i} className="value-card" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 18, padding: '32px 28px' }}>
                  <div style={{ width: 52, height: 52, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20 }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, color: 'white', marginBottom: 10 }}>{v.titre}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75 }}>{v.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STAT BANNER */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {[
              { value: '80%', label: 'des impayés récupérés avec des relances structurées', color: '#a855f7' },
              { value: '42j', label: 'de retard moyen de paiement chez les TPE en France', color: '#ec4899' },
              { value: '100%', label: 'alignés sur votre succès — aucun frais sans résultat', color: '#c084fc' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '20px 36px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 48, color: s.color, letterSpacing: '-2px', marginBottom: 8 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6, maxWidth: 180, margin: '0 auto' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 20 }}>Rejoignez-nous</p>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 36, color: 'white', letterSpacing: '-1.5px', marginBottom: 16 }}>
            Prêt à nous faire confiance ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 15, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            Rejoignez les entrepreneurs qui ont décidé de se concentrer sur leur métier et de nous confier leurs impayés.
          </p>
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
