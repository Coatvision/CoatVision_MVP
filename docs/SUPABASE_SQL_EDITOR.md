# Supabase SQL Editor — Apply Schema

Apply the CoatVision schema and RPCs using the Supabase SQL Editor.

## Steps
1. Open your Supabase project → SQL Editor.
2. Copy the contents of [supabase/schema.sql](supabase/schema.sql).
3. Paste and Run. You can re-run safely; the script uses `IF NOT EXISTS` and `CREATE OR REPLACE`.

## Verify
- Run the repo script locally:
  ```powershell
  $env:SUPABASE_URL = "https://<project>.supabase.co"
  $env:SUPABASE_SERVICE_KEY = "<service_role_key>"
  PowerShell -ExecutionPolicy Bypass -File .\verify_and_cleanup.ps1
  ```
- See `verify_output.json` for results.

## Optional (no local psql)
Use Docker client to apply:
```powershell
$env:SUPABASE_DB_URL = "postgres://postgres:<password>@db.<project>.supabase.co:5432/postgres"
Get-Content supabase\schema.sql -Raw | docker run --rm -i `
  -e SUPABASE_DB_URL="$env:SUPABASE_DB_URL" `
  postgres:16-alpine `
  sh -c 'psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f -'
```
