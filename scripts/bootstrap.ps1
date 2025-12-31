[CmdletBinding()]
param(
  [string]$SchemaPath = "supabase/schema.sql",
  [switch]$ApplySchema
)

$ErrorActionPreference = 'Stop'

function Write-Info($m){ Write-Host $m -ForegroundColor Cyan }
function Write-Ok($m){ Write-Host $m -ForegroundColor Green }
function Write-Warn($m){ Write-Host $m -ForegroundColor Yellow }
function Write-Err($m){ Write-Host $m -ForegroundColor Red }

function New-SecretKey {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
}

$repo = Get-Location
Write-Info "Repo: $repo"

# 1) Write/Update essential files (idempotent)
$dockerfilePath = Join-Path $repo "backend/Dockerfile"
$dockerfile = @'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p uploads outputs
EXPOSE 8000
CMD ["sh","-c","uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
'@
Set-Content -Path $dockerfilePath -Value $dockerfile -Encoding UTF8
Write-Ok "Wrote backend/Dockerfile"

$composePath = Join-Path $repo "docker-compose.yml"
$compose = @'
version: "3.8"
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      PORT: 8000
      NODE_ENV: development
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - ./outputs:/app/outputs
      - ./uploads:/app/uploads
    ports:
      - "8000:8000"
    command: sh -c "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
'@
Set-Content -Path $composePath -Value $compose -Encoding UTF8
Write-Ok "Wrote docker-compose.yml"

$launchPath = Join-Path $repo ".vscode/launch.json"
New-Item -ItemType Directory -Force -Path (Split-Path $launchPath) | Out-Null
$launch = @'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run CoatVision Backend (reload)",
      "type": "python",
      "request": "launch",
      "program": "-m",
      "args": [
        "uvicorn",
        "--reload",
        "--reload-dir",
        "backend/app",
        "backend.app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
      ],
      "env": { "PERSIST_BASE": "${workspaceFolder}\\local_data" },
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "Run CoatVision Backend (no reload)",
      "type": "python",
      "request": "launch",
      "program": "-m",
      "args": [
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
      ],
      "env": { "PERSIST_BASE": "${workspaceFolder}\\local_data" },
      "cwd": "${workspaceFolder}"
    }
  ]
}
'@
Set-Content -Path $launchPath -Value $launch -Encoding UTF8
Write-Ok "Wrote .vscode/launch.json"

$workflowPath = Join-Path $repo ".github/workflows/ci.yml"
New-Item -ItemType Directory -Force -Path (Split-Path $workflowPath) | Out-Null
$workflow = @'
name: CI
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
permissions:
  contents: read
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - run: pip install -r requirements.txt
      - run: python -m py_compile $(git ls-files '*.py' | tr '\n' ' ')
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: if [ -f package-lock.json ]; then npm ci; else npm install; fi
      - run: npm run build
'@
Set-Content -Path $workflowPath -Value $workflow -Encoding UTF8
Write-Ok "Wrote .github/workflows/ci.yml"

$ignorePath = Join-Path $repo ".gitignore"
$ignore = @'
.env
.env.local
backend/.env
*.pyc
__pycache__/
coatvision.db
data/
local_data/
outputs/
uploads/
node_modules/
dist/
.vscode/
.DS_Store
Thumbs.db
'@
Set-Content -Path $ignorePath -Value $ignore -Encoding UTF8
Write-Ok "Wrote .gitignore"

# Ensure backend/.env exists
$backendEnv = Join-Path $repo "backend/.env"
if (-not (Test-Path $backendEnv)) {
  $envSample = @'
NODE_ENV=development
PERSIST_BASE=../local_data
DATABASE_URL=sqlite:///./coatvision.db
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
'@
  Set-Content -Path $backendEnv -Value $envSample -Encoding UTF8
  Write-Ok "Created backend/.env (fill values as needed)"
}

# 2) Generate a SECRET_KEY (print only)
$secret = New-SecretKey
Write-Info "Generated SECRET_KEY (copy to Render): $secret"

# 3) Commit changes
try {
  git add -A
  git commit -m "chore: quickstart bootstrap (Docker, CI, VSCode)"
  Write-Ok "Committed bootstrap files."
} catch {
  Write-Warn "Git commit skipped or failed: $($_.Exception.Message)"
}

# 4) Build & run backend via Docker Compose (skipped to avoid port conflicts)
Write-Warn "Skipping docker compose up (avoid port 8000 conflicts)."

# 5) Health check
$healthy = $false
for ($i=0; $i -lt 5; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) { $healthy = $true; break }
  } catch {}
  Start-Sleep -Seconds 2
}
if ($healthy) { Write-Ok "Backend healthy at http://127.0.0.1:8000/health" } else { Write-Warn "Backend health not responding yet." }

# 6) Optional: Apply Supabase schema via Docker psql
if ($ApplySchema -or (Test-Path $SchemaPath)) {
  if (-not (Test-Path $SchemaPath)) {
    Write-Warn "SchemaPath not found; skipping schema apply."
  } elseif (-not $env:SUPABASE_DB_URL -or $env:SUPABASE_DB_URL -like "*<*") {
    Write-Warn "SUPABASE_DB_URL not set to a real value; skipping schema apply."
  } else {
    $hasDocker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $hasDocker) { Write-Warn "Docker not found; cannot run psql container." }
    else {
      Write-Info "Applying schema to: $env:SUPABASE_DB_URL"
      Get-Content $SchemaPath -Raw | docker run --rm -i -e SUPABASE_DB_URL="$env:SUPABASE_DB_URL" postgres:16-alpine sh -c 'psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f -'
      Write-Ok "Schema apply finished (check Supabase tables/RPCs)."
    }
  }
}

# 7) Verification RPCs (if env present)
if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
  try {
    Write-Info "Running verify_and_cleanup.ps1..."
    PowerShell -ExecutionPolicy Bypass -File (Join-Path $repo "verify_and_cleanup.ps1")
    Write-Ok "Verification complete. See verify_output.json"
  } catch {
    Write-Warn "Verification failed: $($_.Exception.Message)"
  }
} else {
  Write-Warn "Set SUPABASE_URL and SUPABASE_SERVICE_KEY to verify RPCs."
}

Write-Info "Next: set Render backend envs:"
Write-Host "- DATABASE_URL (Supabase Postgres URI)"
Write-Host "- SUPABASE_URL (https://<project>.supabase.co)"
Write-Host "- SUPABASE_SERVICE_KEY (service role)"
Write-Host "- NODE_ENV=production"
Write-Host "- SECRET_KEY (the generated value above)"
Write-Host "Then Manual Deploy and check /health."