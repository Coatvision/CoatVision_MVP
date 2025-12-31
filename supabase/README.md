# Supabase Setup for CoatVision

This folder contains the schema and RPCs needed for the backend to store analysis metadata and power dashboard queries.

## Apply the schema

Option A — SQL Editor (recommended):
1. Open your Supabase project → SQL Editor.
2. Paste the contents of `supabase/schema.sql`.
3. Click Run. You can re-run safely; it uses `IF NOT EXISTS` and `CREATE OR REPLACE`.
4. Optional: paste and run `supabase/seed.sql` to insert sample data and ensure everything is wired.

Option B — `psql` (requires Postgres client):
```bash
# Set SUPABASE_DB_URL like: postgres://postgres:<password>@db.<project>.supabase.co:5432/postgres
export SUPABASE_DB_URL="postgres://..."
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql # optional
```

## Environment variables
Set these in Render (backend) and locally:

- `SUPABASE_URL` — e.g., `https://<project>.supabase.co`
- `SUPABASE_SERVICE_KEY` — service role key (server-only; never expose to frontend)
- `DATABASE_URL` — use Supabase Postgres for production; SQLite is fine locally

Example backend `.env` (see `backend/.env.example`):
```
DATABASE_URL=sqlite:///./coatvision.db
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=...
```

## Verification
Use the existing `verify_and_cleanup.ps1` at repo root to validate RPCs and bucket:
```powershell
$env:SUPABASE_URL = "https://<project>.supabase.co"
$env:SUPABASE_SERVICE_KEY = "<service_role_key>"
PowerShell -ExecutionPolicy Bypass -File .\verify_and_cleanup.ps1
```
This writes `verify_output.json` with results.

## Notes
- Frontend/mobile must use `anon` key, never the service role.
- Backend functions call the RPCs defined here and should use the service role for writes.
- Storage bucket `outputs` is created by the schema; confirm in the Supabase Storage UI.

## Env example
See [supabase/.env.example](supabase/.env.example) for variables to set locally when applying via `psql`.
