$base = 'C:\Users\yannf\Desktop\relance-auto\.claude\worktrees\nostalgic-khorana\app'
$files = Get-ChildItem -Path $base -Recurse -Filter '*.tsx'

# Marqueurs uniques incluant le contenu texte pour ne pas toucher aux autres usages de Comfortaa
$oldMana = "fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>Mana</span>"
$newMana = 'fontFamily: "' + "'Yeseva One'" + ', serif", fontWeight: 400 }}>Mana</span>'

$oldFlow = 'fontFamily: "' + "'Yeseva One'" + ', serif", fontWeight: 400 }}>flow</span>'
$newFlow = "fontFamily: 'Comfortaa, sans-serif', fontWeight: 700 }}>flow</span>"

$changed = 0
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  $newContent = $content.Replace($oldMana, $newMana).Replace($oldFlow, $newFlow)
  if ($newContent -ne $content) {
    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($file.Name)"
    $changed++
  }
}
Write-Host "`nTotal: $changed fichiers modifies"
