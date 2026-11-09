$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrok) {
  $wingetLink = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\ngrok.exe'
  if (Test-Path $wingetLink) {
    $ngrokPath = $wingetLink
  } else {
    throw 'ngrok was not found. Install it with: winget install --id Ngrok.Ngrok --exact'
  }
} else {
  $ngrokPath = $ngrok.Source
}

& $ngrokPath http 3000
exit $LASTEXITCODE
