const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, 'app', 'dashboard')

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function fixSettings() {
  const file = path.join(base, 'settings', 'page.tsx')
  let c = fs.readFileSync(file, 'utf8')

  // 1) Fusionne les deux imports next/navigation en un seul
  c = c.replace(
    `import { usePathname } from 'next/navigation'\nimport { useRouter } from 'next/navigation'`,
    `import { useRouter } from 'next/navigation'`
  )

  // 2) Supprime NAV_ITEMS
  c = c.replace(
    /\nconst NAV_ITEMS = \[[\s\S]*?\]\n\n/,
    '\n'
  )

  // 3) Supprime pathname
  c = c.replace(`  const pathname = usePathname()\n`, '')

  // 4) Supprime sidebarOpen
  c = c.replace(`  const [sidebarOpen, setSidebarOpen] = useState(false)\n`, '')

  // 5) Remplace les 3 blocs sidebar (desktop + mobile + topbar) par le composant
  const sidebarStart = `        {/* SIDEBAR DESKTOP */}`
  const sidebarEnd = `        </div>\n\n        {/* MAIN */}`
  const idx1 = c.indexOf(sidebarStart)
  const idx2 = c.indexOf('{/* MAIN */}')
  if (idx1 !== -1 && idx2 !== -1) {
    c = c.slice(0, idx1) +
      `        <DashboardSidebar user={user} title="Paramètres" />\n\n        {/* MAIN */}` +
      c.slice(idx2 + '{/* MAIN */}'.length)
  } else {
    console.error('settings: SIDEBAR DESKTOP block not found! idx1=%d idx2=%d', idx1, idx2)
  }

  fs.writeFileSync(file, c)
  console.log('✅ settings/page.tsx updated')
}

// ── IMPORTER ──────────────────────────────────────────────────────────────────
function fixImporter() {
  const file = path.join(base, 'importer', 'page.tsx')
  let c = fs.readFileSync(file, 'utf8')

  // 1) Supprime import usePathname
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')

  // 2) Supprime NAV_ITEMS
  c = c.replace(
    /\nconst NAV_ITEMS = \[[\s\S]*?\]\n\n/,
    '\n'
  )

  // 3) Supprime pathname
  c = c.replace(`  const pathname = usePathname()\n`, '')

  // 4) Supprime sidebarOpen
  c = c.replace(`  const [sidebarOpen, setSidebarOpen] = useState(false)\n`, '')

  // 5) Remplace les 3 blocs sidebar
  const sidebarStart = `        {/* SIDEBAR DESKTOP */}`
  const idx1 = c.indexOf(sidebarStart)
  const idx2 = c.indexOf('{/* MAIN */}')
  if (idx1 !== -1 && idx2 !== -1) {
    c = c.slice(0, idx1) +
      `        <DashboardSidebar user={user} title="Importer" />\n\n        {/* MAIN */}` +
      c.slice(idx2 + '{/* MAIN */}'.length)
  } else {
    console.error('importer: SIDEBAR DESKTOP block not found! idx1=%d idx2=%d', idx1, idx2)
  }

  // 6) Supprime les refs à user.email non définies — importer n'a pas de `user`, il a `profile`
  // On ne touche pas à la logique existante

  fs.writeFileSync(file, c)
  console.log('✅ importer/page.tsx updated')
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function fixPricing() {
  const file = path.join(base, 'pricing', 'page.tsx')
  let c = fs.readFileSync(file, 'utf8')

  // Repérer le début du sidebar div et la fin
  const sidebarStart = `        {/* Sidebar */}`
  const idx1 = c.indexOf(sidebarStart)
  // Le sidebar se termine avant {/* Main */}
  const idx2 = c.indexOf('{/* Main */}')
  if (idx1 !== -1 && idx2 !== -1) {
    c = c.slice(0, idx1) +
      `        <DashboardSidebar user={user} title="Plans" />\n\n        {/* Main */}` +
      c.slice(idx2 + '{/* Main */}'.length)
    console.log('✅ pricing/page.tsx updated')
  } else {
    console.error('pricing: Sidebar block not found! idx1=%d idx2=%d', idx1, idx2)
    // Essayons avec NAV_ITEMS comme délimiteur alternatif
    const alt1 = `        {/* sidebar */}`
    const idx1b = c.toLowerCase().indexOf('        {/* sidebar */}')
    console.log('  alt search lowercase idx:', idx1b)
  }

  fs.writeFileSync(file, c)
}

fixSettings()
fixImporter()
fixPricing()
console.log('Done.')
