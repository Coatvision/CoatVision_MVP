param(
  [string]$SchemaPath = "$PSScriptRoot\schema.sql",
  [string]$SeedPath   = "$PSScriptRoot\seed.sql",
  [switch]$ApplySeed,
  [string]$DotEnvPath = "$PSScriptRoot\.env"
)

Write-Host "Applying Supabase schema from: $SchemaPath"
if ($ApplySeed) { Write-Host "Seed file: $SeedPath" }

if (-not (Test-Path $SchemaPath)) {
  Write-Error "Schema file not found: $SchemaPath"
  exit 1
}

$dbUrl = $env:SUPABASE_DB_URL
if (-not $dbUrl -and (Test-Path $DotEnvPath)) {
  Write-Host "Loading environment from: $DotEnvPath"
  Get-Content $DotEnvPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
      $key, $val = $line.Split('=',2)
      $key = $key.Trim()
      $val = $val.Trim()
      if ($key -and $val) {
        Set-Item -Path Env:$key -Value $val
      }
    }
  }
  $dbUrl = $env:SUPABASE_DB_URL
}
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
    if ($ApplySeed -and (Test-Path $SeedPath)) {
      Write-Host "Applying seed data..."
      & $psql.Source $dbUrl -f $SeedPath
      if ($LASTEXITCODE -eq 0) {
        Write-Host "Seed applied successfully." -ForegroundColor Green
      } else {
        Write-Warning "Seed application returned exit code $LASTEXITCODE"
      }
    }
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