# Bootstraps local dev: builds Docker, applies Supabase schema (optional), verifies RPCs
[CmdletBinding()] param(
  [switch]$ApplySchema
)

$ErrorActionPreference = 'Stop'

function New-SecretKey {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

# Repo paths
$repo = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $repo 'backend'
$schema = Join-Path $repo 'supabase/schema.sql'
$compose = Join-Path $repo 'docker-compose.yml'

Write-Info "Repo: $repo"

# Ensure backend/.env exists (copy example if missing)
$backendEnv = Join-Path $backend '.env'
if (-not (Test-Path $backendEnv)) {
  $example = Join-Path $backend '.env.example'
  if (Test-Path $example) {
    Copy-Item $example $backendEnv
    Write-Ok "Created backend/.env from .env.example (fill values as needed)."
  } else {
    Set-Content -Path $backendEnv -Value @"
NODE_ENV=development
PERSIST_BASE=../local_data
DATABASE_URL=sqlite:///./coatvision.db
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
"@
    Write-Warn "Created minimal backend/.env; update values before production."
  }
}

# Generate a SECRET_KEY for Render (print only; do not commit)
$secretKey = New-SecretKey
Write-Info "Generated SECRET_KEY (copy to Render): $secretKey"

# Check Docker
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) { Write-Err "Docker not found. Install Docker Desktop and rerun."; exit 1 }

# Build and start backend via docker compose
if (-not (Test-Path $compose)) { Write-Err "docker-compose.yml missing at $compose"; exit 1 }
Push-Location $repo
Write-Info "Running: docker compose up --build -d"
docker compose up --build -d

# Wait for backend health
$ok = $false
for ($i=0; $i -lt 20; $i++) {
  try {
    $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 5
    if ($res.StatusCode -eq 200) { $ok = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if ($ok) { Write-Ok "Backend health OK at http://127.0.0.1:8000/health" } else { Write-Warn "Backend health not responding yet." }

# Optionally apply Supabase schema via Docker psql if SUPABASE_DB_URL is set
if ($ApplySchema -or $env:SUPABASE_DB_URL) {
  if (-not (Test-Path $schema)) { Write-Err "Schema file missing: $schema" } else {
    if (-not $env:SUPABASE_DB_URL -or $env:SUPABASE_DB_URL -like '*<*') {
      Write-Warn "SUPABASE_DB_URL is not set to a real value; skipping schema apply."
    } else {
      Write-Info "Applying schema to: $env:SUPABASE_DB_URL"
      $env:SUPABASE_DB_URL = "postgres://postgres:<password>@db.<project>.supabase.co:5432/postgres"
      Get-Content supabase\schema.sql -Raw | docker run --rm -i `
        -e SUPABASE_DB_URL="$env:SUPABASE_DB_URL" `
        postgres:16-alpine `
        sh -c 'psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f -'
      Write-Ok "Schema apply attempt finished. Check Supabase tables and RPCs."
    }
  }
}

# Run verification script if Supabase URL + service key present
if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
  Write-Info "Running Supabase verification script..."
  try {
    PowerShell -ExecutionPolicy Bypass -File (Join-Path $repo 'verify_and_cleanup.ps1')
    Write-Ok "Verification complete. See verify_output.json"
  } catch { Write-Warn "Verification script failed: $($_.Exception.Message)" }
} else {
  Write-Warn "Set SUPABASE_URL and SUPABASE_SERVICE_KEY to run verification."
}

Pop-Location

Write-Info "Next steps:"
Write-Host "- Render backend envs: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, NODE_ENV=production, SECRET_KEY (above)."
Write-Host "- Manual Deploy backend and check /health."
