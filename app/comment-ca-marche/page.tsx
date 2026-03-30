'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function TimelineStep({ step, index, isMobile }: { step: any; index: number; isMobile: boolean }) {
  const { ref, visible } = useInView(0.15)
  const isRight = index % 2 === 0

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexDirection: isMobile ? 'row' : (isRight ? 'row' : 'row-reverse'),
      alignItems: 'flex-start',
      gap: isMobile ? 20 : 40,
      position: 'relative',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
      transitionDelay: `${index * 0.08}s`,
    }}>

      {/* Node sur la ligne */}
      <div style={{
        position: isMobile ? 'relative' : 'absolute',
        left: isMobile ? undefined : '50%',
        transform: isMobile ? undefined : 'translateX(-50%)',
        zIndex: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: isMobile ? 4 : 0,
      }}>
        <div style={{
          width: isMobile ? 48 : 64,
          height: isMobile ? 48 : 64,
          borderRadius: '50%',
          background: step.bg,
          border: `2px solid ${step.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 24px ${step.color}44`,
          transition: 'box-shadow 0.4s ease',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: isMobile ? 14 : 16, color: step.color }}>{step.num}</span>
        </div>
      </div>

      {/* Card (side) */}
      <div style={{
        flex: isMobile ? 1 : undefined,
        width: isMobile ? undefined : 'calc(50% - 52px)',
        marginLeft: isMobile ? 0 : (isRight ? 0 : 'auto'),
        marginRight: isMobile ? 0 : (isRight ? 0 : undefined),
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${step.color}30`,
        borderRadius: 20,
        padding: isMobile ? '20px 20px' : '28px 32px',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow corner */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: 14,
            background: step.bg,
            border: `1px solid ${step.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {step.icon}
          </div>
          <h3 style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: isMobile ? 17 : 20, color: 'white' }}>{step.title}</h3>
        </div>
        <p style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, position: 'relative', zIndex: 1 }}>{step.desc}</p>
      </div>

      {/* Spacer côté vide (desktop seulement) */}
      {!isMobile && <div style={{ width: 'calc(50% - 52px)', flexShrink: 0 }} />}
    </div>
  )
}

export default function CommentCaMarchePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = timelineRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (rect.height + windowH * 0.3)))
      setLineProgress(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const faqs = [
    { q: 'Je connais bien mes clients — est-ce que Manaflow va abîmer la relation ?', r: 'Non. Nos relances sont pensées pour rester dans le registre amiable et professionnel. Le ton est adapté, jamais agressif. L\'objectif est de récupérer l\'argent sans jamais compromettre la relation humaine que vous avez construite avec vos clients.' },
    { q: 'Je suis artisan ou indépendant — est-ce que c\'est fait pour moi ?', r: 'Absolument. Manaflow a été conçu pour les TPE, artisans, et indépendants. Vous importez vos factures en quelques clics (CSV ou PDF), et on s\'occupe du reste. Pas besoin de compétences techniques.' },
    { q: 'Comment fonctionne la commission ?', r: 'La commission est prélevée uniquement sur les factures effectivement recouvrées. Si rien n\'est récupéré, vous ne payez rien en plus de votre abonnement mensuel. Notre intérêt est donc directement aligné avec le vôtre.' },
    { q: 'Que se passe-t-il si une facture date de plusieurs mois ?', r: 'Plus une facture est ancienne, plus elle est difficile à récupérer — mais pas impossible. Manaflow calcule automatiquement la première relance en fonction de la date d\'échéance, même si celle-ci est déjà dépassée.' },
    { q: 'Quels formats de fichiers puis-je importer ?', r: 'Manaflow accepte les fichiers CSV et les PDF. Pour les PDF, notre IA extrait automatiquement les informations : nom du client, montant, date d\'échéance. Vous n\'avez rien à ressaisir.' },
    { q: 'La facturation électronique va-t-elle changer quelque chose pour moi ?', r: 'Oui. À partir de septembre 2026, toutes les entreprises françaises devront émettre et recevoir des factures électroniques dans un format structuré. Bien gérer ses factures dès maintenant, c\'est anticiper cette obligation et avoir de meilleures habitudes de trésorerie.' },
    { q: 'Puis-je personnaliser la séquence de relances ?', r: 'Oui, à partir du plan Premium. Vous choisissez les délais entre chaque relance (J+7, J+15, J+30…) et le canal utilisé. Le plan Pro ajoute les relances par SMS en plus de l\'email.' },
    { q: 'Mes données sont-elles sécurisées ?', r: 'Toutes vos données sont chiffrées et hébergées en Europe. Nous ne partageons jamais vos informations avec des tiers. Vous restez propriétaire de vos données à tout moment.' },
  ]

  const steps = [
    {
      num: '01',
      title: 'Créez votre compte',
      desc: 'Inscrivez-vous en 2 minutes. Choisissez votre plan et démarrez votre essai gratuit de 14 jours — sans rien débourser.',
      icon: <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="15" y1="3" x2="20" y2="3"/><line x1="17.5" y1="0.5" x2="17.5" y2="5.5"/></svg>,
      color: '#a855f7',
      bg: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(168,85,247,0.10))',
    },
    {
      num: '02',
      title: 'Connectez Stripe',
      desc: 'Reliez votre compte Stripe existant ou créez-en un en quelques clics. C\'est ce qui permet à vos clients de payer directement depuis l\'email de relance.',
      icon: <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
      color: '#ec4899',
      bg: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.10))',
    },
    {
      num: '03',
      title: 'Importez vos factures',
      desc: 'Glissez vos factures en CSV ou PDF. Notre IA lit et organise tout automatiquement : client, montant, échéance. En quelques secondes, votre liste est prête.',
      icon: <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
      color: '#c084fc',
      bg: 'linear-gradient(135deg, rgba(192,132,252,0.25), rgba(192,132,252,0.10))',
    },
    {
      num: '04',
      title: 'Manaflow relance',
      desc: 'Activez la séquence sur chaque facture. Les relances partent automatiquement au bon moment, avec le bon ton. Vous n\'avez plus à y penser.',
      icon: <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      color: '#f472b6',
      bg: 'linear-gradient(135deg, rgba(244,114,182,0.25), rgba(244,114,182,0.10))',
    },
    {
      num: '05',
      title: 'Vous encaissez',
      desc: 'Vos clients paient directement depuis le lien dans l\'email. L\'argent arrive sur votre compte bancaire via Stripe. On prélève uniquement sur ce qui est réellement récupéré.',
      icon: <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      color: '#4ade80',
      bg: 'linear-gradient(135deg, rgba(74,222,128,0.25), rgba(74,222,128,0.10))',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { transition: color 0.15s; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-connexion { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 600; transition: all 0.18s; border-radius: 12px; padding: 10px 22px; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 12px rgba(168,85,247,0.35); }
        .btn-connexion:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.50) !important; }
        .faq-card { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; }
        .faq-card:hover { border-color: rgba(168,85,247,0.35) !important; }
        .faq-answer { overflow: hidden; transition: max-height 0.35s ease, opacity 0.25s ease; }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.2s; border-radius: 14px; padding: 14px 36px; font-size: 15px; box-shadow: 0 4px 24px rgba(168,85,247,0.40); display: inline-flex; align-items: center; justify-content: center; }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.55) !important; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
          .btn-cta { width: 100%; }
        }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', color: 'white', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Orbes */}
        <div style={{ position: 'fixed', top: '5%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <div className="nav-links">
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14, fontWeight: 500 }}>Accueil</span>
              <span className="nav-a" onClick={() => router.push('/blog')} style={{ fontSize: 14, fontWeight: 500 }}>Blog</span>
              <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>Comment ça marche ?</span>
              <span className="nav-a" onClick={() => router.push('/nous-connaitre')} style={{ fontSize: 14, fontWeight: 500 }}>Nous connaître</span>
              <button className="btn-connexion" onClick={() => router.push('/login')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '8px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[{ label: 'Accueil', href: '/' }, { label: 'Blog', href: '/blog' }, { label: 'Nous connaître', href: '/nous-connaitre' }].map(item => (
                <button key={item.label} onClick={() => { router.push(item.href); setMenuOpen(false) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.80)', fontSize: 15, fontWeight: 500, padding: '12px 8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', borderRadius: 8 }}>
                  {item.label}
                </button>
              ))}
              <button className="btn-connexion" onClick={() => { router.push('/login'); setMenuOpen(false) }} style={{ marginTop: 8, justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </button>
            </div>
          )}
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '72px 20px 48px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Découvrez le processus</span>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 60px)', color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            5 étapes pour<br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>récupérer vos impayés</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: isMobile ? 14 : 16, maxWidth: 480, margin: '0 auto' }}>
            De l'inscription à l'encaissement — tout est automatisé.
          </p>
        </div>

        {/* TIMELINE VERTICALE */}
        <section style={{ padding: isMobile ? '0 20px 80px' : '0 40px 100px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }} ref={timelineRef}>

            {/* Ligne verticale desktop */}
            {!isMobile && (
              <>
                {/* Track gris */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 32,
                  bottom: 32,
                  width: 2,
                  background: 'rgba(255,255,255,0.08)',
                  transform: 'translateX(-50%)',
                  borderRadius: 2,
                }} />
                {/* Fill violet animé */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 32,
                  width: 2,
                  height: `calc(${lineProgress * 100}% - 64px)`,
                  background: 'linear-gradient(180deg, #a855f7, #ec4899, #4ade80)',
                  transform: 'translateX(-50%)',
                  borderRadius: 2,
                  transition: 'height 0.1s linear',
                  boxShadow: '0 0 12px rgba(168,85,247,0.6)',
                }} />
              </>
            )}

            {/* Ligne verticale mobile (gauche) */}
            {isMobile && (
              <>
                <div style={{
                  position: 'absolute',
                  left: 23,
                  top: 24,
                  bottom: 24,
                  width: 2,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 2,
                }} />
                <div style={{
                  position: 'absolute',
                  left: 23,
                  top: 24,
                  width: 2,
                  height: `calc(${lineProgress * 100}% - 48px)`,
                  background: 'linear-gradient(180deg, #a855f7, #ec4899, #4ade80)',
                  borderRadius: 2,
                  transition: 'height 0.1s linear',
                  boxShadow: '0 0 10px rgba(168,85,247,0.5)',
                }} />
              </>
            )}

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 32 : 48 }}>
              {steps.map((step, i) => (
                <TimelineStep key={i} step={step} index={i} isMobile={isMobile} />
              ))}
            </div>
          </div>
        </section>

        {/* Q&A ACCORDION */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '56px 20px' : '80px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Questions & Réponses</span>
              <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 22 : 28, color: 'white', letterSpacing: '-0.5px', marginTop: 8 }}>Vos questions, nos réponses</h2>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={i} className="faq-card"
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 14 }}
                    onClick={() => setOpenFaq(isOpen ? null : i)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: isMobile ? '18px 20px' : '20px 24px' }}>
                      <p style={{ fontFamily: 'Comfortaa', fontWeight: 700, color: 'white', fontSize: 14, lineHeight: 1.4 }}>{faq.q}</p>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: isOpen ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isOpen ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#c084fc' : 'rgba(255,255,255,0.5)'} strokeWidth="2.5" strokeLinecap="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                    <div className="faq-answer" style={{ maxHeight: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0 }}>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, padding: isMobile ? '0 20px 18px' : '0 24px 20px' }}>{faq.r}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '48px 20px' : '64px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 22 : 28, color: 'white', marginBottom: 8, position: 'relative', zIndex: 1 }}>Prêt à automatiser vos relances ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, marginBottom: 28, position: 'relative', zIndex: 1 }}>14 jours gratuits, sans engagement.</p>
          <button className="btn-cta" onClick={() => router.push('/souscrire')} style={{ width: isMobile ? '100%' : 'auto', position: 'relative', zIndex: 1 }}>
            Je me lance →
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '24px 20px' : '28px 40px', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 15, color: 'white' }}><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>Mana</span><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span></span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>© 2026 Manaflow — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="nav-a" onClick={() => router.push('/cgu')} style={{ fontSize: 12, cursor: 'pointer' }}>CGU</span>
              <span className="nav-a" onClick={() => router.push('/confidentialite')} style={{ fontSize: 12, cursor: 'pointer' }}>Confidentialité</span>
              <span className="nav-a" onClick={() => router.push('/contact')} style={{ fontSize: 12, cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
