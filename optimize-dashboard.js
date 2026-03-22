const fs = require('fs')
const path = require('path')

const ROOT = __dirname

// ─── Helper ────────────────────────────────────────────────────────────────
function edit(file, fn) {
  const p = path.join(ROOT, file)
  let c = fs.readFileSync(p, 'utf8')
  c = fn(c)
  fs.writeFileSync(p, c, 'utf8')
  console.log(`✓ ${file}`)
}

// ─── Regex helpers ─────────────────────────────────────────────────────────
// Remove a CSS rule block from <style> string
function removeCSSLine(c, pattern) {
  return c.replace(new RegExp(`        ${pattern}[^\n]*\n`, 'g'), '')
}
// Remove multiline CSS block
function removeCSSBlock(c, from, to) {
  const re = new RegExp(from + '[\\s\\S]*?' + to + '\n', 'g')
  return c.replace(re, '')
}

// ─── SIDEBAR HTML to replace in each file ──────────────────────────────────
// We detect the sidebar block and replace it.
// Pattern: from `/* SIDEBAR */` comment to the closing </aside>
function replaceSidebar(c, componentCall) {
  // Match the sidebar block: either an <aside> or a sidebar <div> with specific bg
  // For dashboard/page.tsx, facturation/page.tsx: /* SIDEBAR */ then <aside>
  const sidebarRegex = /\s*\{\/\* SIDEBAR \*\/\}\n\s*<aside[\s\S]*?<\/aside>\n/
  if (sidebarRegex.test(c)) {
    return c.replace(sidebarRegex, `\n        ${componentCall}\n`)
  }
  // For settings/importer: desktop + mobile sidebars + topbar (handled separately)
  return c
}

// ─── dashboard/page.tsx ─────────────────────────────────────────────────────
edit('app/dashboard/page.tsx', c => {
  // 1. Remove usePathname import (only used for sidebar now moved to component)
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')
  // 2. Add DashboardSidebar import
  c = c.replace(
    `import { getEmailContent } from '../lib/email-templates'`,
    `import { getEmailContent } from '../lib/email-templates'\nimport { DashboardSidebar } from '../components/DashboardSidebar'`
  )
  // 3. Remove pathname state
  c = c.replace(`  const pathname = usePathname()\n`, '')
  // 4. Remove duplicate CSS from style block (now in globals.css)
  c = c.replace(`        @keyframes spin { to { transform: rotate(360deg); } }\n`, '')
  c = c.replace(`        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }\n`, '')
  c = c.replace(`        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }\n`, '')
  c = c.replace(`        @keyframes modalIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }\n`, '')
  c = c.replace(`        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }\n`, '')
  c = c.replace(`        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }\n`, '')
  // 5. Replace sidebar HTML with component
  c = replaceSidebar(c, '<DashboardSidebar user={user} title="Tableau de bord" />')
  return c
})

// ─── dashboard/facturation/page.tsx ─────────────────────────────────────────
edit('app/dashboard/facturation/page.tsx', c => {
  // 1. Remove usePathname import
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')
  // 2. Add DashboardSidebar import
  c = c.replace(
    `import { createClient } from '../../lib/supabase'`,
    `import { createClient } from '../../lib/supabase'\nimport { DashboardSidebar } from '../../components/DashboardSidebar'`
  )
  // 3. Remove pathname state
  c = c.replace(`  const pathname = usePathname()\n`, '')
  // 4. Remove duplicate CSS
  c = c.replace(`        @keyframes spin { to { transform: rotate(360deg); } }\n`, '')
  c = c.replace(`        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }\n`, '')
  c = c.replace(`        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }\n`, '')
  c = c.replace(`        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }\n`, '')
  // 5. Replace sidebar HTML with component
  c = replaceSidebar(c, '<DashboardSidebar user={user} title="Facturation" />')
  return c
})

// ─── dashboard/settings/page.tsx ─────────────────────────────────────────────
edit('app/dashboard/settings/page.tsx', c => {
  // 1. Remove usePathname import (sidebar component handles it)
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')
  // 2. Add DashboardSidebar import
  c = c.replace(
    `import { createClient } from '../../lib/supabase'`,
    `import { createClient } from '../../lib/supabase'\nimport { DashboardSidebar } from '../../components/DashboardSidebar'`
  )
  // 3. Remove pathname & sidebarOpen states
  c = c.replace(`  const pathname = usePathname()\n`, '')
  c = c.replace(`  const [sidebarOpen, setSidebarOpen] = useState(false)\n`, '')
  // 4. Remove NAV_ITEMS (sidebar component has its own)
  c = c.replace(/^const NAV_ITEMS = \[[\s\S]*?\]\n\n/m, '')
  // 5. Remove duplicate CSS from style block
  c = c.replace(`        @keyframes spin { to { transform: rotate(360deg); } }\n`, '')
  c = c.replace(`        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }\n`, '')
  c = c.replace(`        @keyframes slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }\n`, '')
  c = c.replace(`        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }\n`, '')
  c = c.replace(`        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }\n`, '')
  c = c.replace(`        .desktop-sidebar { display: flex; }\n`, '')
  c = c.replace(`        .mobile-topbar { display: none; }\n`, '')
  c = c.replace(`        .sidebar-overlay { display: none; }\n`, '')
  // Remove mobile media query sidebar part (keep the page-specific parts)
  c = c.replace(`          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 299; }\n`, '')
  c = c.replace(`          .mobile-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 300; background: linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%); animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.07); }\n`, '')
  // 6. Replace SIDEBAR DESKTOP block (aside)
  const desktopSidebarRegex = /\s*\{\/\* SIDEBAR DESKTOP \*\/\}\n\s*<aside className="desktop-sidebar"[\s\S]*?<\/aside>\n/
  c = c.replace(desktopSidebarRegex, `\n        <DashboardSidebar user={user} title="Paramètres" />\n`)
  // 7. Remove mobile sidebar block
  const mobileSidebarRegex = /\s*\{\/\* SIDEBAR MOBILE \*\/\}\n\s*\{sidebarOpen[\s\S]*?<\/>\n\s*\}\n/
  c = c.replace(mobileSidebarRegex, '')
  // 8. Remove mobile topbar block
  const mobileTopbarRegex = /\s*\{\/\* TOPBAR MOBILE \*\/\}\n\s*<div className="mobile-topbar"[\s\S]*?<\/div>\n/
  c = c.replace(mobileTopbarRegex, '')
  // 9. Replace window.location.href for nav (keep Stripe redirects)
  c = c.replace(/onClick=\{\(\) => window\.location\.href = item\.href\}/g, `onClick={() => router.push(item.href)}`)
  // 10. Add useRouter import
  if (!c.includes('useRouter')) {
    c = c.replace(`import { useState, useEffect } from 'react'`, `import { useRouter } from 'next/navigation'\nimport { useState, useEffect } from 'react'`)
    // Add router usage inside component
    c = c.replace(`  const supabase = createClient()`, `  const router = useRouter()\n  const supabase = createClient()`)
  }
  return c
})

// ─── dashboard/importer/page.tsx ─────────────────────────────────────────────
edit('app/dashboard/importer/page.tsx', c => {
  // 1. Remove usePathname import
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')
  // 2. Add DashboardSidebar import
  c = c.replace(
    `import { createClient } from '../../lib/supabase'`,
    `import { createClient } from '../../lib/supabase'\nimport { DashboardSidebar } from '../../components/DashboardSidebar'`
  )
  // 3. Remove pathname & sidebarOpen states
  c = c.replace(`  const pathname = usePathname()\n`, '')
  c = c.replace(`  const [sidebarOpen, setSidebarOpen] = useState(false)\n`, '')
  // 4. Remove NAV_ITEMS
  c = c.replace(/^const NAV_ITEMS = \[[\s\S]*?\]\n\n/m, '')
  // 5. Remove duplicate CSS
  c = c.replace(`        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }\n`, '')
  c = c.replace(`        @keyframes slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }\n`, '')
  c = c.replace(`        .sidebar-link { transition: all 0.15s; border-radius: 8px; cursor: pointer; }\n`, '')
  c = c.replace(`        .sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }\n`, '')
  c = c.replace(`        .desktop-sidebar { display: flex; }\n`, '')
  c = c.replace(`        .mobile-topbar { display: none; }\n`, '')
  c = c.replace(`        .sidebar-overlay { display: none; }\n`, '')
  c = c.replace(`          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 299; }\n`, '')
  c = c.replace(`          .mobile-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 300; background: linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%); animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.07); }\n`, '')
  // 6. Replace SIDEBAR DESKTOP block
  const desktopSidebarRegex = /\s*\{\/\* SIDEBAR DESKTOP \*\/\}\n\s*<aside className="desktop-sidebar"[\s\S]*?<\/aside>\n/
  c = c.replace(desktopSidebarRegex, `\n        <DashboardSidebar user={user} title="Importer" />\n`)
  // 7. Remove mobile sidebar block
  const mobileSidebarRegex = /\s*\{\/\* SIDEBAR MOBILE \*\/\}\n\s*\{sidebarOpen[\s\S]*?<\/>\n\s*\}\n/
  c = c.replace(mobileSidebarRegex, '')
  // 8. Remove mobile topbar block (keep topbar buttons for export CSV which are in topbar)
  // For importer, the topbar has extra buttons - we need to handle differently
  // Let's only remove the sidebar part of the topbar
  const mobileTopbarRegex = /\s*\{\/\* TOPBAR MOBILE \*\/\}\n\s*<div className="mobile-topbar"[\s\S]*?<\/div>\n/
  c = c.replace(mobileTopbarRegex, '')
  return c
})

// ─── dashboard/pricing/page.tsx ──────────────────────────────────────────────
edit('app/dashboard/pricing/page.tsx', c => {
  // 1. Remove usePathname import
  c = c.replace(`import { usePathname } from 'next/navigation'\n`, '')
  // 2. Add DashboardSidebar import
  c = c.replace(
    `import { createClient } from '../../lib/supabase'`,
    `import { createClient } from '../../lib/supabase'\nimport { DashboardSidebar } from '../../components/DashboardSidebar'`
  )
  // 3. Remove pathname state
  c = c.replace(`  const pathname = usePathname()\n`, '')
  // 4. Remove NAV_ITEMS (sidebar component has its own)
  c = c.replace(/^const NAV_ITEMS = \[[\s\S]*?\]\n\n/m, '')
  // 5. Remove duplicate CSS
  c = c.replace(`        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n`, '')
  c = c.replace(`        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; margin-bottom: 2px; }\n`, '')
  c = c.replace(`        .nav-item:hover { background: rgba(0,0,0,0.04); }\n`, '')
  // 6. Replace sidebar <div> block with component
  // The pricing sidebar is a <div> not <aside>
  const pricingSidebarRegex = /\s*\{\/\* Sidebar \*\/\}\n\s*<div style=\{\{ width: 230[\s\S]*?<\/div>\n\s*\{\/\* Main \*\/\}/
  c = c.replace(pricingSidebarRegex, `\n        <DashboardSidebar user={user} title="Plans" />\n\n        {/* Main */}`)
  return c
})

console.log('\n✅ All dashboard pages optimized!')
