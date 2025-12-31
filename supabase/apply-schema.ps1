param(
  [string]$SchemaPath = "$PSScriptRoot\schema.sql"
)

Write-Host "Applying Supabase schema from: $SchemaPath"

if (-not (Test-Path $SchemaPath)) {
  Write-Error "Schema file not found: $SchemaPath"
  exit 1
}

$dbUrl = $env:SUPABASE_DB_URL
if (-not $dbUrl) {
  Write-Warning "SUPABASE_DB_URL is not set."
  Write-Host "Set it like: postgres://postgres:<password>@db.<project>.supabase.co:5432/postgres"
  exit 2
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Warning "psql not found. Install Postgres client or use Supabase SQL Editor to run schema.sql."
  exit 3
}

Write-Host "Using psql at: $($psql.Source)"
Write-Host "Connecting to: $dbUrl"

try {
  & $psql.Source $dbUrl -f $SchemaPath
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema applied successfully." -ForegroundColor Green
    exit 0
  } else {
    Write-Error "psql exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
  }
}
catch {
  Write-Error "Failed to apply schema: $($_.Exception.Message)"
  exit 1
}