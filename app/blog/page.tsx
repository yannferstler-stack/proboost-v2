'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ARTICLES = [
  {
    id: 'facturation-electronique',
    titre: 'Facturation électronique : une échéance à anticiper',
    prenom: null,
    age: null,
    metier: 'Réforme & Obligations',
    tag: 'Réglementation',
    tagColor: '#ec4899',
    resume: 'La facturation électronique va bientôt devenir une obligation pour toutes les entreprises françaises. Une échéance à ne pas prendre à la légère.',
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
    prenom: 'Sylvain',
    age: 59,
    metier: 'Dirigeant d\'agence de communication',
    tag: 'Témoignage',
    tagColor: '#a855f7',
    resume: 'Près de 10 % de son chiffre d\'affaires est en retard de paiement. À un âge où il pourrait envisager une retraite bien méritée, cette trésorerie manquante l\'oblige à continuer.',
    contenu: [
      `Sylvain a fondé son agence de communication au début des années 2000 dans une petite ville de France. À l'époque, il était seul avec ses idées et une passion immense pour la créativité. Avec les années, les projets se sont multipliés et son agence a grandi jusqu'à compter une dizaine de collaborateurs.`,
      `Ses clients ne sont jamais devenus de simples lignes dans un fichier. Sylvain les connaît par leur prénom. Beaucoup sont, comme lui, des entrepreneurs. Des relations construites avec le temps et la confiance.`,
      `Mais ces dernières années, la réalité économique s'est durcie. Les loyers augmentent, les outils nécessaires au métier d'agence coûtent toujours plus cher. Pour rester à flot, Sylvain a dû réduire son équipe. Aujourd'hui, il gère presque tout lui-même : devis, factures, administratif.`,
      `Relancer les paiements ? Ce n'est pas dans son tempérament. Quand il prend enfin le temps d'appeler un client, la discussion mène souvent vers un nouveau projet… et parfois une nouvelle facture en attente.`,
      `Pourtant, près de 10 % de son chiffre d'affaires est aujourd'hui en retard de paiement. À un âge où il pourrait envisager une retraite bien méritée, cette trésorerie manquante l'oblige à continuer. Avec de simples relances structurées, jusqu'à 80 % de ces impayés pourraient être récupérés. De quoi préserver son activité, garder son employée actuelle et continuer à exercer son métier de passion… jusqu'au jour où lui décidera de prendre sa retraite.`,
    ],
  },
  {
    id: 'laurent',
    titre: 'Laurent, 34 ans — Chauffagiste indépendant',
    prenom: 'Laurent',
    age: 34,
    metier: 'Chauffagiste indépendant',
    tag: 'Témoignage',
    tagColor: '#a855f7',
    resume: 'Les clients appellent souvent en urgence quand la chaudière tombe en panne. Mais quand vient le moment de faire un virement, l\'urgence disparaît.',
    contenu: [
      `Laurent a 34 ans et il est chauffagiste dans l'Est de la France. Au départ, il avait suivi un parcours scolaire assez classique. Puis, presque naturellement, il a choisi un métier manuel, comme son père avant lui. Aujourd'hui, il ne regrette absolument rien. Être à son compte lui a permis de construire la vie qu'il voulait. Il choisit ses horaires, a développé un réseau de clients fidèles et gagne confortablement sa vie. Le métier est parfois physique, parfois dans le froid, parfois dans l'urgence… mais Laurent l'aime sincèrement.`,
      `Quand il s'est installé, il a tout de suite adopté une solution digitale simple pour éditer ses devis et ses factures directement depuis son téléphone. En quelques minutes, tout est envoyé au client. Le problème arrive après.`,
      `Les clients appellent souvent en urgence quand la chaudière tombe en panne. Mais quand vient le moment de faire un virement, l'urgence disparaît. Les paiements prennent du temps, et Laurent doit relancer régulièrement. Rien de conflictuel : en général, un message ou deux suffisent et la situation se règle rapidement. Il n'a jamais eu besoin d'engager de procédure juridique. Mais ces relances lui prennent du temps. Du temps qu'il préférerait consacrer à ses clients… ou à sa famille.`,
      `Et Laurent est loin d'être un cas isolé : les dirigeants de TPE et indépendants passent en moyenne 25 à 40 % de leur temps de travail sur des tâches administratives, soit 52 à 90 heures par mois.`,
    ],
  },
  {
    id: 'lisa',
    titre: 'Lisa — Fleuriste',
    prenom: 'Lisa',
    age: null,
    metier: 'Fleuriste',
    tag: 'Témoignage',
    tagColor: '#a855f7',
    resume: 'Entre la boutique, les mariages et les saisons des fleurs, Lisa reste avant tout une artiste passionnée. Récupérer ses factures en attente lui permettrait de financer un projet qui lui tient à cœur.',
    contenu: [
      `Lisa est fleuriste. Dans sa boutique, au cœur d'une petite ville de l'Est de la France, les journées commencent tôt et sentent toujours un peu la rose, l'eucalyptus ou la pivoine. Mais une grande partie de son travail se passe aussi ailleurs : sur les lieux de mariage. Depuis plusieurs années, elle accompagne des couples dans l'un des plus beaux jours de leur vie. Les bouquets, les centres de table, les arches fleuries… Lisa partage avec eux des moments chargés d'émotion. Mais une fois la fête passée, elle redevient parfois… une facture parmi d'autres. Dans la longue liste des prestataires d'un mariage, il arrive qu'elle soit simplement oubliée.`,
      `Lisa envoie pourtant ses factures depuis son ordinateur, parfois tard le soir après une journée passée à composer des bouquets. L'administratif n'est pas ce qui la fait vibrer. Elle le fait comme elle peut, souvent entre deux commandes. Et puis une autre réalité approche : la facturation électronique obligatoire qui va progressivement entrer en vigueur pour les entreprises en France. Une échéance qu'elle n'a pas vraiment vu arriver.`,
      `Entre la boutique, les mariages et les saisons des fleurs, Lisa reste avant tout une artiste passionnée. Mais récupérer ses factures en attente lui permettrait de financer un projet qui lui tient à cœur : organiser des ateliers pour transmettre son amour des fleurs et apprendre à composer des bouquets.`,
      `Parce que parfois, quelques paiements récupérés suffisent à faire éclore une nouvelle idée.`,
    ],
  },
  {
    id: 'christophe-sarah',
    titre: 'Christophe & Sarah — Traiteurs',
    prenom: 'Christophe & Sarah',
    age: null,
    metier: 'Traiteurs',
    tag: 'Témoignage',
    tagColor: '#a855f7',
    resume: 'Avec une gestion simple et efficace de leurs factures, leur projet pourrait changer d\'échelle : ouvrir un local, améliorer leurs packagings, acheter une voiture de société.',
    contenu: [
      `Au départ, c'était simplement pour la famille et les amis. Des repas d'anniversaire, des baptêmes, quelques fêtes improvisées où tout le monde disait la même chose : "Vous devriez en faire votre métier." Petit à petit, leur activité de traiteur a pris de la place. De plus en plus de week-ends, puis de plus en plus de soirées en semaine. Aujourd'hui, une grande partie de leur temps libre y passe. Lui s'occupe des livraisons, des courses et des stocks. Elle est en cuisine, mais aussi au téléphone avec les clients, à imaginer les menus et organiser les événements.`,
      `L'activité se professionnalise… mais cette nouvelle dimension peut donner le vertige. Il faut comprendre les règles, suivre les factures, anticiper les nouvelles obligations administratives. Parfois, tout cela ressemble à une montagne. Pourtant, elle connaît très bien l'administratif. Elle est comptable de formation et travaille encore à mi-temps dans ce domaine. Mais justement : dans leur activité de traiteur, elle rêve de faire autre chose. Créer, cuisiner, recevoir. Pas courir après les paiements.`,
      `Alors les relances passent souvent au second plan.`,
      `Et pourtant, avec une gestion simple et efficace de leurs factures et de leurs paiements, leur projet pourrait changer d'échelle : ouvrir un petit local, améliorer leurs packagings, et même acheter une voiture de société pour les livraisons. Parfois, bien gérer ses factures, c'est simplement donner à une passion les moyens de grandir.`,
    ],
  },
]

export default function BlogPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const article = ARTICLES.find(a => a.id === selected)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0620; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .card-article { transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; }
        .card-article:hover { border-color: rgba(168,85,247,0.4); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(168,85,247,0.15) !important; }
        .nav-a { cursor: pointer; transition: color 0.15s; color: rgba(255,255,255,0.6); }
        .nav-a:hover { color: #c084fc !important; }
        .btn-back { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.7); border-radius: 10px; padding: 8px 16px; font-size: 13px; font-family: Inter, sans-serif; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-back:hover { background: rgba(168,85,247,0.10); border-color: rgba(168,85,247,0.3); color: #c084fc; }
        .btn-cta { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; box-shadow: 0 4px 20px rgba(168,85,247,0.35); display: inline-flex; align-items: center; gap: 8px; }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(168,85,247,0.50); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d0620 0%, #1a0533 35%, #0f0a2e 70%, #1a0320 100%)', fontFamily: 'Inter, sans-serif', color: 'white' }}>

        {/* NAV */}
        <nav style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: 'white' }}>ProBoost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="nav-a" onClick={() => { setSelected(null); router.push('/') }} style={{ fontSize: 14 }}>Accueil</span>
            <span className="nav-a" onClick={() => setSelected(null)} style={{ fontSize: 14, color: '#c084fc', fontWeight: 600 }}>Blog</span>
            <button onClick={() => router.push('/login')} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Connexion
            </button>
          </div>
        </nav>

        {/* LISTE DES ARTICLES */}
        {!selected && (
          <div style={{ maxWidth: 1060, margin: '0 auto', padding: '64px 24px', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom: 56, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Blog</span>
              <h1 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 42, color: 'white', letterSpacing: '-2px', marginBottom: 16 }}>
                Histoires & Réflexions
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Des témoignages d'entrepreneurs et des éclairages sur la gestion des impayés et la trésorerie.
              </p>
            </div>

            {/* Article vedette — facturation électronique */}
            <div className="card-article" onClick={() => setSelected('facturation-electronique')}
              style={{ background: 'rgba(236,72,153,0.08)', borderRadius: 20, padding: '40px 44px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, background: 'rgba(236,72,153,0.2)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 6, padding: '3px 10px', fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>Réglementation · À lire</span>
                <h2 style={{ fontFamily: 'Manrope', fontWeight: 900, fontSize: 28, color: 'white', letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>
                  Facturation électronique : une échéance à anticiper
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 560 }}>
                  La facturation électronique va bientôt devenir une obligation pour toutes les entreprises françaises. Une réforme à ne pas prendre à la légère.
                </p>
              </div>
              <div style={{ flexShrink: 0, width: 56, height: 56, background: 'linear-gradient(135deg, #ec4899, #a855f7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              </div>
            </div>

            {/* Grille témoignages */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {ARTICLES.filter(a => a.id !== 'facturation-electronique').map((a, i) => (
                <div key={a.id} className="card-article" onClick={() => setSelected(a.id)}
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '28px 28px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, background: `rgba(168,85,247,0.15)`, border: `1px solid rgba(168,85,247,0.25)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 14, color: '#c084fc' }}>{a.prenom?.[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{a.prenom}{a.age ? `, ${a.age} ans` : ''}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>{a.metier}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{a.tag}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 16 }}>{a.resume}</p>
                  <span style={{ fontSize: 13, color: '#a855f7', fontWeight: 600 }}>Lire l'histoire →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ARTICLE DÉTAIL */}
        {selected && article && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', animation: 'fadeUp 0.4s ease both' }}>
            <button className="btn-back" onClick={() => setSelected(null)} style={{ marginBottom: 32 }}>
              ← Retour au blog
            </button>

            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 11, background: article.id === 'facturation-electronique' ? 'rgba(236,72,153,0.2)' : 'rgba(168,85,247,0.15)', color: article.tagColor, border: `1px solid ${article.id === 'facturation-electronique' ? 'rgba(236,72,153,0.3)' : 'rgba(168,85,247,0.25)'}`, borderRadius: 6, padding: '3px 10px', fontWeight: 700, display: 'inline-block', marginBottom: 20 }}>{article.tag}</span>
              <h1 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 42px)', color: 'white', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
                {article.titre}
              </h1>
              {article.metier && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>{article.metier}</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {article.contenu.map((para, i) => (
                <p key={i} style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, fontWeight: 300 }}>{para}</p>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 56, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.20)', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>ProBoost</p>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 10 }}>Récupérez vos impayés automatiquement</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.6 }}>Relances email et SMS automatiques. Commission uniquement sur les fonds récupérés.</p>
              <button className="btn-cta" onClick={() => router.push('/souscrire')}>
                Commencer maintenant →
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
