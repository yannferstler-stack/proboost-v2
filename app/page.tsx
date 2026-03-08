'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .btn-primary:hover { background: #18a34a !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(29,185,84,0.35) !important; }
        .btn-primary { transition: all 0.2s; }
        .btn-secondary:hover { background: #f0fdf4 !important; border-color: #1DB954 !important; }
        .btn-secondary { transition: all 0.2s; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.10) !important; }
        .feature-card { transition: all 0.2s; }
        .nav-link:hover { color: #1DB954 !important; }
        .nav-link { transition: color 0.15s; }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: '#111', background: 'white' }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #F0F0F0', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.jpg" alt="ProBoost" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#111', letterSpacing: '-0.5px' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['Fonctionnalités', 'Tarifs', 'Contact'].map(l => (
              <span key={l} className="nav-link" style={{ fontSize: 14, color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>{l}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-secondary" onClick={() => router.push('/login')}
              style={{ background: 'white', color: '#111', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Se connecter
            </button>
            <button className="btn-primary" onClick={() => router.push('/login')}
              style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Essai gratuit →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', background: 'linear-gradient(180deg, #F0FDF4 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
                <span style={{ fontSize: 12 }}>🚀</span>
                <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Automatisation intelligente des relances</span>
              </div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 52, color: '#111', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 24 }}>
                Fini les<br/>
                <span style={{ color: '#1DB954' }}>factures impayées</span><br/>
                qui traînent.
              </h1>
              <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, marginBottom: 40, fontWeight: 300 }}>
                ProBoost envoie automatiquement vos relances par email et SMS. Vous récupérez votre argent, sans lever le petit doigt.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={() => router.push('/login')}
                  style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 12, padding: '16px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(29,185,84,0.3)' }}>
                  Commencer gratuitement →
                </button>
                <button className="btn-secondary"
                  style={{ background: 'white', color: '#111', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '16px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Voir une démo
                </button>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: '#9CA3AF' }}>✓ Sans carte bancaire &nbsp; ✓ Résultats en 48h &nbsp; ✓ Annulation libre</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeUp 0.6s ease 0.2s both' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 320, height: 320, background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(29,185,84,0.15)' }}>
                  <img src="/logo.jpg" alt="ProBoost" style={{ width: 240, height: 240, objectFit: 'contain', animation: 'float 3s ease-in-out infinite' }} />
                </div>
                <div style={{ position: 'absolute', top: 20, right: -20, background: 'white', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Taux de recouvrement</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#1DB954' }}>+87%</p>
                </div>
                <div style={{ position: 'absolute', bottom: 40, left: -30, background: 'white', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Temps économisé</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#3B82F6' }}>5h/semaine</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ background: '#111', padding: '60px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
            {[
              { value: '2 300+', label: 'TPE utilisatrices' },
              { value: '87%', label: 'Taux de recouvrement' },
              { value: '48h', label: 'Pour voir les premiers résultats' },
              { value: '5h', label: 'Économisées par semaine' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 36, color: '#1DB954', marginBottom: 8 }}>{s.value}</p>
                <p style={{ fontSize: 14, color: '#9CA3AF' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: '100px 48px', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 40, color: '#111', letterSpacing: '-1px', marginBottom: 16 }}>Tout ce dont vous avez besoin</h2>
              <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Simple, rapide, efficace. ProBoost s'occupe de tout pendant que vous gérez votre business.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { icon: '📧', title: 'Relances par email', desc: 'Des emails professionnels envoyés automatiquement à J+7, J+15, J+30 après l\'échéance.' },
                { icon: '📱', title: 'Relances par SMS', desc: 'Un SMS de rappel discret mais efficace pour les clients difficiles à joindre par email.' },
                { icon: '📊', title: 'Tableau de bord', desc: 'Visualisez en un coup d\'œil toutes vos factures, leur statut et l\'historique des relances.' },
                { icon: '📥', title: 'Import CSV simple', desc: 'Importez toutes vos factures en une fois depuis Excel, Google Sheets ou votre logiciel comptable.' },
                { icon: '⚡', title: 'Résultats en 48h', desc: 'Dès la première relance envoyée, constatez une amélioration de votre trésorerie.' },
                { icon: '🔒', title: 'Données sécurisées', desc: 'Vos données sont hébergées en Europe et protégées selon les normes RGPD.' },
              ].map((f, i) => (
                <div key={i} className="feature-card" style={{ background: '#F9FAFB', borderRadius: 16, padding: '28px 24px', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: '100px 48px', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <img src="/logo.jpg" alt="ProBoost" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 24, animation: 'float 3s ease-in-out infinite' }} />
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 42, color: '#111', letterSpacing: '-1.5px', marginBottom: 20 }}>Prêt à récupérer<br/>votre argent ?</h2>
            <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 40, lineHeight: 1.7 }}>Rejoignez les TPE qui font confiance à ProBoost pour automatiser leurs relances.</p>
            <button className="btn-primary" onClick={() => router.push('/login')}
              style={{ background: '#1DB954', color: 'white', border: 'none', borderRadius: 14, padding: '18px 40px', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 24px rgba(29,185,84,0.35)' }}>
              Commencer gratuitement →
            </button>
            <p style={{ marginTop: 16, fontSize: 13, color: '#9CA3AF' }}>✓ Sans carte bancaire &nbsp; ✓ 14 jours offerts &nbsp; ✓ Annulation libre</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#111', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.jpg" alt="ProBoost" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: 'white' }}>ProBoost</span>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280' }}>© 2025 ProBoost — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['CGU', 'Confidentialité', 'Contact'].map(l => (
              <span key={l} className="nav-link" style={{ fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}