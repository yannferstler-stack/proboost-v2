const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, 'app', 'dashboard')

const files = [
  { file: path.join(base, 'page.tsx'), component: 'Dashboard', addRouterImport: true },
  { file: path.join(base, 'facturation', 'page.tsx'), component: 'FacturationPage', addRouterImport: true },
  { file: path.join(base, 'pricing', 'page.tsx'), component: 'DashboardPricingPage', addRouterImport: true },
  { file: path.join(base, 'importer', 'page.tsx'), component: 'ImporterPage', addRouterImport: true },
  { file: path.join(base, 'settings', 'page.tsx'), component: 'SettingsPage', addRouterImport: false }, // already has router
]

for (const { file, component, addRouterImport } of files) {
  let c = fs.readFileSync(file, 'utf8')

  // 1) Add useRouter import if missing
  if (addRouterImport && !c.includes("import { useRouter }") && !c.includes("useRouter")) {
    // Add after 'use client'
    c = c.replace("'use client'\n", "'use client'\nimport { useRouter } from 'next/navigation'\n")
  }

  // 2) Add const router = useRouter() after createClient() if not present
  if (addRouterImport && !c.includes('const router = useRouter()')) {
    c = c.replace(
      '  const supabase = createClient()\n',
      '  const supabase = createClient()\n  const router = useRouter()\n'
    )
    // If createClient pattern not found, try after useState declarations
    if (!c.includes('  const router = useRouter()')) {
      console.warn(`  ⚠ Could not auto-inject router in ${path.basename(path.dirname(file))}/${path.basename(file)} — do it manually`)
    }
  }

  // 3) Replace internal window.location.href with router.push
  // Only replace paths starting with /login, /dashboard, /souscrire (internal)
  // Keep data.url (external Stripe URL)
  c = c.replace(/window\.location\.href = '(\/[^']+)'/g, (match, p1) => {
    return `router.push('${p1}')`
  })

  // Also handle double-quoted variants
  c = c.replace(/window\.location\.href = "(\/[^"]+)"/g, (match, p1) => {
    return `router.push("${p1}")`
  })

  // Handle setTimeout(() => window.location.href = '/...', ...) pattern
  c = c.replace(/window\.location\.href = `(\/[^`]+)`/g, (match, p1) => {
    return `router.push(\`${p1}\`)`
  })

  fs.writeFileSync(file, c)
  console.log(`✅ ${path.basename(path.dirname(file))}/${path.basename(file)} updated`)
}

console.log('Done.')
