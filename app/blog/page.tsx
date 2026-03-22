'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const ARTICLES = [
  {
    id: 'facturation-electronique',
    titre: 'Facturation électronique : une échéance à anticiper',
    resume: 'La facturation électronique va bientôt devenir une obligation pour toutes les entreprises françaises. Une échéance à ne pas prendre à la légère.',
    image: null,
    contenu: [
      `La facturation électronique va bientôt devenir une obligation pour les entreprises françaises. Cette réforme vise à moderniser les échanges commerciaux et à simplifier la transmission des informations fiscales. Concrètement, toutes les entreprises devront être capables de recevoir des factures électroniques dès le 1er septembre 2026, et les TPE et PME devront également en émettre à partir du 1er septembre 2027.`,
      `Mais attention : une facture électronique ne sera plus un simple PDF envoyé par email. Elle devra être émise dans un format structuré et transiter par une plateforme de dématérialisation agréée, permettant le traitement automatisé des données.`,
      `Dans ce nouveau contexte, avoir des factures correctement émises et suivies devient essentiel. Une facture au bon format facilite non seulement la conformité réglementaire, mais aussi le suivi des paiements et la gestion de la trésorerie.`,
      `Car pour beaucoup d'entreprises, une partie du chiffre d'affaires reste encore trop longtemps "dehors", sous forme de factures en attente de règlement. Cet argent existe déjà… mais il ne travaille pas pour l'entreprise.`,
      `Avec la généralisation de la facturation électronique et des outils de gestion adaptés, les entreprises pourront mieux suivre leurs factures, relancer plus efficacement et réduire les délais de paiement.`,
      `Dans un environnement où la trésorerie est un levier clé de stabilité et de croissance, bien gérer ses factures n'est plus seulement une obligation administrative : c'est un véritable enjeu stratégique.`,
    ],
  },
  {
    id: 'sylvain',
    titre: 'Sylvain, 59 ans — Agence de communication',
    resume: 'Près de 10 % de son chiffre d\'affaires est en retard de paiement. À un âge où il pourrait envisager une retraite bien méritée, cette trésorerie manquante l\'oblige à continuer.',
    image: '/blog/sylvain.jpg',
    objectPosition: 'center',
    contenu: [
      `Sylvain a fondé son agence de communication au début des années 2000 dans une petite ville de France. À l'époque, il était seul avec ses idées et une passion immense pour la créativité. Avec les années, les projets se sont multipliés et son agence a grandi jusqu'à compter une dizaine de collaborateurs.`,
      `Ses clients ne sont jamais devenus de simples lignes dans un fichier. Sylvain les connaît par leur prénom. Beaucoup sont, comme lui, des entrepreneurs. Des relations construites avec le temps et la confiance.`,
      `Mais ces dernières années, la réalité économique s'est durcie. Les loyers augmentent, les outils nécessaires au métier d'agence coûtent toujours plus cher. Pour rester à flot, Sylvain a dû réduire son équipe. Aujourd'hui, il gère presque tout lui-même : devis, factures, administratif.`,
      `Relancer les paiements ? Ce n'est pas dans son tempérament. Quand il prend enfin le temps d'appeler un client, la discussion mène souvent vers un nouveau projet… et parfois une nouvelle facture en attente.`,
      `Pourtant, près de 10 % de son chiffre d'affaires est aujourd'hui en retard de paiement. À un âge où il pourrait envisager une retraite bien méritée, cette trésorerie manquante l'oblige à continuer. Avec de simples relances structurées, jusqu'à 80 % de ces impayés pourraient être récupérés.`,
    ],
  },
  {
    id: 'laurent',
    titre: 'Laurent, 34 ans — Chauffagiste indépendant',
    resume: 'Les clients appellent souvent en urgence quand la chaudière tombe en panne. Mais quand vient le moment de faire un virement, l\'urgence disparaît.',
    image: '/blog/laurent.jpg',
    objectPosition: 'top',
    contenu: [
      `Laurent a 34 ans et il est chauffagiste dans l'Est de la France. Au départ, il avait suivi un parcours scolaire assez classique. Puis, presque naturellement, il a choisi un métier manuel, comme son père avant lui. Aujourd'hui, il ne regrette absolument rien.`,
      `Quand il s'est installé, il a tout de suite adopté une solution digitale simple pour éditer ses devis et ses factures directement depuis son téléphone. En quelques minutes, tout est envoyé au client. Le problème arrive après.`,
      `Les clients appellent souvent en urgence quand la chaudière tombe en panne. Mais quand vient le moment de faire un virement, l'urgence disparaît. Les paiements prennent du temps, et Laurent doit relancer régulièrement. Mais ces relances lui prennent du temps. Du temps qu'il préférerait consacrer à ses clients… ou à sa famille.`,
      `Et Laurent est loin d'être un cas isolé : les dirigeants de TPE et indépendants passent en moyenne 25 à 40 % de leur temps de travail sur des tâches administratives, soit 52 à 90 heures par mois.`,
    ],
  },
  {
    id: 'lisa',
    titre: 'Lisa — Fleuriste',
    resume: 'Entre la boutique, les mariages et les saisons des fleurs, Lisa reste avant tout une artiste passionnée. Récupérer ses factures en attente lui permettrait de financer un projet qui lui tient à cœur.',
    image: '/blog/lisa.jpg',
    objectPosition: 'center',
    contenu: [
      `Lisa est fleuriste. Dans sa boutique, au cœur d'une petite ville de l'Est de la France, les journées commencent tôt et sentent toujours un peu la rose, l'eucalyptus ou la pivoine. Mais une grande partie de son travail se passe aussi ailleurs : sur les lieux de mariage. Les bouquets, les centres de table, les arches fleuries… Lisa partage avec eux des moments chargés d'émotion. Mais une fois la fête passée, elle redevient parfois… une facture parmi d'autres.`,
      `Lisa envoie pourtant ses factures depuis son ordinateur, parfois tard le soir après une journée passée à composer des bouquets. L'administratif n'est pas ce qui la fait vibrer. Elle le fait comme elle peut, souvent entre deux commandes.`,
      `Entre la boutique, les mariages et les saisons des fleurs, Lisa reste avant tout une artiste passionnée. Mais récupérer ses factures en attente lui permettrait de financer un projet qui lui tient à cœur : organiser des ateliers pour transmettre son amour des fleurs.`,
      `Parce que parfois, quelques paiements récupérés suffisent à faire éclore une nouvelle idée.`,
    ],
  },
  {
    id: 'christophe-sarah',
    titre: 'Christophe & Sarah — Traiteurs',
    resume: 'Avec une gestion simple et efficace de leurs factures, leur projet pourrait changer d\'échelle : ouvrir un local, améliorer leurs packagings, acheter une voiture de société.',
    image: '/blog/christophe-sarah.jpg',
    objectPosition: 'center',
    contenu: [
      `Au départ, c'était simplement pour la famille et les amis. Des repas d'anniversaire, des baptêmes, quelques fêtes improvisées où tout le monde disait la même chose : "Vous devriez en faire votre métier." Petit à petit, leur activité de traiteur a pris de la place. Lui s'occupe des livraisons, des courses et des stocks. Elle est en cuisine, mais aussi au téléphone avec les clients.`,
      `L'activité se professionnalise… mais cette nouvelle dimension peut donner le vertige. Pourtant, elle connaît très bien l'administratif. Elle est comptable de formation. Mais justement : dans leur activité de traiteur, elle rêve de faire autre chose. Créer, cuisiner, recevoir. Pas courir après les paiements.`,
      `Alors les relances passent souvent au second plan.`,
      `Et pourtant, avec une gestion simple et efficace de leurs factures, leur projet pourrait changer d'échelle : ouvrir un petit local, améliorer leurs packagings, et même acheter une voiture de société pour les livraisons. Parfois, bien gérer ses factures, c'est simplement donner à une passion les moyens de grandir.`,
    ],
  },
]

function FacturationVisuel({ size }: { size: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: 12,
      background: 'linear-gradient(135deg, #1a0533 0%, #0d0620 100%)',
      border: '1px solid rgba(168,85,247,0.25)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', gap: 0,
    }}>
      {/* Orbe déco */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Date */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: size < 120 ? 9 : 11, color: '#ec4899', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
          Obligatoire
        </div>
        <div style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: size < 120 ? 18 : 26, color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>
          Sept.
        </div>
        <div style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 900, fontSize: size < 120 ? 22 : 32, color: '#a855f7', lineHeight: 1, letterSpacing: '-1px' }}>
          2026
        </div>
        {/* Barre d'alerte */}
        <div style={{ marginTop: size < 120 ? 6 : 8, background: 'rgba(236,72,153,0.20)', border: '1px solid rgba(236,72,153,0.35)', borderRadius: 4, padding: size < 120 ? '2px 6px' : '3px 8px', display: 'inline-block' }}>
          <span style={{ fontSize: size < 120 ? 8 : 10, color: '#f472b6', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>⚠ Anticipez dès maintenant</span>
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [storyNom, setStoryNom] = useState('')
  const [storyActivite, setStoryActivite] = useState('')
  const [storyMessage, setStoryMessage] = useState('')
  const [storySending, setStorySending] = useState(false)
  const [storySent, setStorySent] = useState(false)
  const [storyError, setStoryError] = useState('')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const imgSize = isMobile ? 90 : 140

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyNom.trim() || !storyMessage.trim()) return
    setStorySending(true)
    setStoryError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: storyNom,
          email: storyActivite || 'Non renseigné',
          sujet: `[Blog] Histoire de TPE — ${storyNom}`,
          message: `Activité : ${storyActivite || 'Non renseignée'}\n\n${storyMessage}`,
        }),
      })
      if (res.ok) {
        setStorySent(true)
        setStoryNom(''); setStoryActivite(''); setStoryMessage('')
      } else {
        setStoryError('Une erreur est survenue, veuillez réessayer.')
      }
    } catch {
      setStoryError('Une erreur est survenue, veuillez réessayer.')
    } finally {
      setStorySending(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comfortaa:wght@300;400;700&family=Yeseva+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        .nav-a { cursor: pointer; transition: color 0.15s; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .article-row { transition: background 0.2s; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .article-row:hover { background: rgba(168,85,247,0.03) !important; }
        .article-row:hover .arrow-circle { border-color: rgba(168,85,247,0.5); background: rgba(168,85,247,0.08); }
        .arrow-circle { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.18); background: transparent; display: flex; align-items: center; justify-content: center; transition: all 0.25s; flex-shrink: 0; }
        .arrow-circle.open { border-color: #a855f7; background: rgba(168,85,247,0.12); }
        .expanded-content { animation: fadeUp 0.3s ease both; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .mobile-menu { animation: slideDown 0.2s ease; }
        .btn-back-art { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); border-radius: 10px; padding: 8px 16px; font-size: 13px; font-family: Inter, sans-serif; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-back-art:hover { background: rgba(168,85,247,0.10); border-color: rgba(168,85,247,0.3); color: #c084fc; }
        .story-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); borderRadius: 10px; color: white; font-family: Inter, sans-serif; font-size: 14px; padding: 12px 14px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .story-input:focus { border-color: rgba(168,85,247,0.5); }
        .story-input::placeholder { color: rgba(255,255,255,0.3); }
        .story-btn { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 13px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; box-shadow: 0 4px 16px rgba(168,85,247,0.35); }
        .story-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(168,85,247,0.50); }
        .story-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', fontFamily: 'Inter, sans-serif', color: 'white' }}>

        {/* NAV */}
        <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,6,32,0.92)', backdropFilter: 'blur(20px)' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <img src="/logo.png" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>Mana</span><span style={{ fontFamily: "'Yeseva One', serif", fontWeight: 400 }}>flow</span></span>
            </div>
            <div className="nav-links">
              <span className="nav-a" onClick={() => router.push('/')} style={{ fontSize: 14 }}>Accueil</span>
              <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 600 }}>Blog</span>
              <button onClick={() => router.push('/login')} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Connexion
              </button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
          {menuOpen && (
            <div className="mobile-menu" style={{ padding: '8px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => { router.push('/'); setMenuOpen(false) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.80)', fontSize: 15, fontWeight: 500, padding: '12px 8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}>Accueil</button>
              <button onClick={() => router.push('/login')} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>Connexion</button>
            </div>
          )}
        </nav>

        {/* HEADER */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '40px 20px 32px' : '56px 24px 40px', animation: 'fadeUp 0.4s ease both' }}>
          <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Blog</span>
          <h1 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 26 : 38, color: 'white', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Des histoires qui vous ressemblent
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 680 }}>
            Les histoires que vous allez lire sont inspirées de situations bien réelles que nous avons rencontrées. Si elles vous parlent, ce n&apos;est pas un hasard : elles pourraient être les vôtres. Notre objectif est simple — vous accompagner pour affronter les défis quotidiens des TPE françaises et favoriser votre développement, avec une solution simple.
          </p>
        </div>

        {/* LISTE */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '0 16px 60px' : '0 24px 80px' }}>
          {ARTICLES.map((article) => {
            const isOpen = expanded === article.id
            return (
              <div key={article.id}>
                {/* LIGNE */}
                <div
                  className="article-row"
                  onClick={() => setExpanded(isOpen ? null : article.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 24, padding: isMobile ? '20px 0' : '28px 0' }}
                >
                  {/* VISUEL */}
                  {article.id === 'facturation-electronique' ? (
                    <FacturationVisuel size={imgSize} />
                  ) : article.image ? (
                    <img
                      src={article.image}
                      alt={article.titre}
                      style={{
                        width: imgSize, height: imgSize,
                        objectFit: 'cover',
                        objectPosition: (article as any).objectPosition || 'center',
                        borderRadius: 12, flexShrink: 0, display: 'block'
                      }}
                    />
                  ) : null}

                  {/* TEXTE */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 800, fontSize: isMobile ? 15 : 20, color: 'white', letterSpacing: '-0.3px', marginBottom: 8, lineHeight: 1.25 }}>
                      {article.titre}
                    </h2>
                    <p style={{ fontSize: isMobile ? 12 : 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65 }}>
                      {article.resume}
                    </p>
                  </div>

                  {/* FLÈCHE */}
                  <div className={`arrow-circle${isOpen ? ' open' : ''}`}>
                    <svg
                      width="16" height="16"
                      viewBox="0 0 24 24" fill="none"
                      stroke={isOpen ? '#a855f7' : 'rgba(255,255,255,0.55)'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* CONTENU DÉPLIÉ */}
                {isOpen && (
                  <div
                    className="expanded-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid rgba(168,85,247,0.15)',
                      borderLeft: '2px solid rgba(168,85,247,0.30)',
                      padding: isMobile ? '24px 20px 28px' : '32px 36px 36px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                      {article.contenu.map((para, i) => (
                        <p key={i} style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, fontWeight: 300 }}>{para}</p>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button className="btn-back-art" onClick={() => setExpanded(null)}>
                        ↑ Réduire
                      </button>
                      <button
                        onClick={() => router.push('/souscrire')}
                        style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(168,85,247,0.35)', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}>
                        Commencer avec ManaFlow →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* FORMULAIRE HISTOIRES */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '48px 20px 60px' : '64px 24px 80px', background: 'rgba(168,85,247,0.04)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Partagez</span>
              <h2 style={{ fontFamily: 'Comfortaa', fontWeight: 900, fontSize: isMobile ? 22 : 30, color: 'white', letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.2 }}>
                Toutes les TPE ont une histoire,<br/>racontez-nous la vôtre.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
                Votre expérience pourrait inspirer d'autres entrepreneurs — on pourrait la publier sur notre blog, ou simplement vous recontacter.
              </p>
            </div>

            {storySent ? (
              <div style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 16, padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: 28, marginBottom: 12 }}>🙏</p>
                <p style={{ fontFamily: 'Comfortaa', fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 6 }}>Merci pour votre histoire !</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Nous l&apos;avons bien reçue. On vous recontactera peut-être très bientôt.</p>
              </div>
            ) : (
              <form onSubmit={handleStorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Votre prénom *</label>
                    <input
                      type="text" value={storyNom} onChange={e => setStoryNom(e.target.value)} required
                      placeholder="Jean-Pierre"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 14, padding: '12px 14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Votre activité</label>
                    <input
                      type="text" value={storyActivite} onChange={e => setStoryActivite(e.target.value)}
                      placeholder="Plombier, fleuriste, graphiste…"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 14, padding: '12px 14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Votre histoire *</label>
                  <textarea
                    value={storyMessage} onChange={e => setStoryMessage(e.target.value)} required rows={5}
                    placeholder="Racontez-nous votre quotidien, vos défis avec les impayés, ce qui vous a décidé à agir…"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 14, padding: '12px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                  />
                </div>
                {storyError && <p style={{ fontSize: 13, color: '#f87171' }}>{storyError}</p>}
                <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                  <button type="submit" disabled={storySending} className="story-btn" style={{ width: isMobile ? '100%' : 'auto' }}>
                    {storySending ? 'Envoi…' : 'Partager mon histoire →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
