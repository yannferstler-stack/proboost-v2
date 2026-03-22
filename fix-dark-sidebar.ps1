$files = @(
  "app\dashboard\page.tsx",
  "app\dashboard\facturation\page.tsx",
  "app\dashboard\settings\page.tsx",
  "app\dashboard\importer\page.tsx",
  "app\dashboard\pricing\page.tsx"
)

foreach ($f in $files) {
  $path = Join-Path $PSScriptRoot $f
  if (-not (Test-Path $path)) { Write-Host "NOT FOUND: $path"; continue }
  $c = Get-Content $path -Raw -Encoding UTF8

  # 1. Desktop aside: white → dark gradient (width 240)
  $c = $c -replace "width: 240, background: 'white', borderRight: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh'",
    "width: 240, background: 'linear-gradient(180deg, #0d0620 0%, #150a30 60%, #0f0a2e 100%)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh'"

  # 1b. Desktop aside className variant (settings/importer): flexDirection after className
  $c = $c -replace "width: 240, background: 'white', borderRight: '1px solid #EAECEF', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh'",
    "width: 240, background: 'linear-gradient(180deg, #0d0620 0%, #150a30 60%, #0f0a2e 100%)', borderRight: '1px solid rgba(255,255,255,0.07)', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh'"

  # 1c. pricing sidebar (width 230)
  $c = $c -replace "width: 230, background: 'white', borderRight: '1px solid #EAECEF'",
    "width: 230, background: 'linear-gradient(180deg, #0d0620 0%, #150a30 60%, #0f0a2e 100%)', borderRight: '1px solid rgba(255,255,255,0.07)'"

  # 2. Mobile sidebar CSS class
  $c = $c -replace "background: white; animation: slideIn 0\.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid #EAECEF; \}",
    "background: linear-gradient(180deg, #0d0620 0%, #0f0a2e 100%); animation: slideIn 0.25s ease; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.07); }"

  # 3. Logo glow (height 44)
  $c = $c -replace "src=""/logo\.png"" style=\{\{ height: 44, width: 'auto', objectFit: 'contain' \}\}",
    'src="/logo.png" style={{ height: 44, width: "auto", objectFit: "contain", filter: "drop-shadow(0 0 14px rgba(236,72,153,0.6)) drop-shadow(0 0 4px rgba(168,85,247,0.4))" }}'

  # 3b. Logo glow (height 32) - pricing
  $c = $c -replace "src=""/logo\.png"" style=\{\{ height: 32, width: 'auto', objectFit: 'contain' \}\}",
    'src="/logo.png" style={{ height: 32, width: "auto", objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(236,72,153,0.6)) drop-shadow(0 0 4px rgba(168,85,247,0.4))" }}'

  # 4. Logo text color dark → white (sidebar context, near logo)
  # dashboard/page.tsx pattern
  $c = $c -replace "onClick=\{\(\) => window\.location\.href = '/'\} style=\{\{ fontSize: 22, color: '#111', cursor: 'pointer' \}\}",
    "onClick={() => window.location.href = '/'} style={{ fontSize: 22, color: 'white', cursor: 'pointer' }}"
  # pricing pattern
  $c = $c -replace "onClick=\{\(\) => window\.location\.href = '/'\}>\s*<img src=""/logo\.png""",
    "onClick={() => window.location.href = '/'}><img src=""/logo.png"""

  # 4b. Logo text in sidebar div (facturation/settings/importer)
  $c = $c -replace "style=\{\{ fontSize: 22, color: '#111' \}\}><span style=\{\{ fontFamily: ""'Yeseva One', serif"", fontWeight: 700 \}\}",
    "style={{ fontSize: 22, color: 'white' }}><span style={{ fontFamily: ""'Yeseva One', serif"", fontWeight: 700 }}"

  # 4c. pricing sidebar logo text
  $c = $c -replace "style=\{\{ fontSize: 18, color: '#111' \}\}",
    "style={{ fontSize: 18, color: 'white' }}"

  # 5. Sidebar link hover CSS: purple tint → white tint
  $c = $c -replace "\.sidebar-link:hover \{ background: rgba\(168,85,247,0\.08\) !important; color: #a855f7 !important; \}",
    ".sidebar-link:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }"

  # 6. Nav link active colors: #a855f7 → white, #6B7280 → rgba(255,255,255,0.55)
  $c = $c -replace "color: pathname === item\.href \? '#a855f7' : '#6B7280'",
    "color: pathname === item.href ? 'white' : 'rgba(255,255,255,0.55)'"
  $c = $c -replace "color: pathname === item\.href \? '#7C3AED' : '#555'",
    "color: pathname === item.href ? 'white' : 'rgba(255,255,255,0.55)'"

  # 7. Nav active background: purple tint → white tint
  $c = $c -replace "background: pathname === item\.href \? 'rgba\(168,85,247,0\.08\)' : 'transparent'",
    "background: pathname === item.href ? 'rgba(255,255,255,0.10)' : 'transparent'"
  $c = $c -replace "background: pathname === item\.href \? 'rgba\(124,58,237,0\.08\)' : 'transparent'",
    "background: pathname === item.href ? 'rgba(255,255,255,0.10)' : 'transparent'"

  # 8. Blog/Aide link colors
  $c = $c -replace "padding: '9px 12px', color: '#9CA3AF', fontSize: 13",
    "padding: '9px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 13"
  $c = $c -replace "padding: '8px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 13, color: '#9CA3AF'",
    "padding: '8px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.45)'"

  # 9. User section border top
  $c = $c -replace "borderTop: '1px solid #EAECEF', paddingTop: 16",
    "borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16"
  $c = $c -replace "borderTop: '1px solid #F3F4F6', paddingTop: 12, marginBottom: 8",
    "borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginBottom: 8"

  # 10. User email color
  $c = $c -replace "fontSize: 12, fontWeight: 600, color: '#111', whiteSpace: 'nowrap'",
    "fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap'"

  # 11. Déconnexion button
  $c = $c -replace "fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif'",
    "fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif'"
  $c = $c -replace "display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF'",
    "display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.45)'"

  # 12. Mobile sidebar links color (settings/importer)
  $c = $c -replace "color: pathname === item\.href \? '#a855f7' : '#374151'",
    "color: pathname === item.href ? 'white' : 'rgba(255,255,255,0.6)'"

  Set-Content $path $c -Encoding UTF8
  Write-Host "Done: $f"
}
Write-Host "All done."
