# Render Backend Checklist (CoatVision)

Use this checklist to keep the backend healthy and reproducible.

## Service Runtime
- Runtime: Docker
- Root dir: backend
- Dockerfile: backend/Dockerfile
- Health check path: /health

## Required Environment Variables
- DATABASE_URL: Supabase Postgres URI (production)
- SUPABASE_URL: https://<project>.supabase.co
- SUPABASE_SERVICE_KEY: Supabase service role key (server-only)
- NODE_ENV: production
- SECRET_KEY: secure random value (generate locally; do not commit)

## Deploy Steps
1. Manual Deploy the service
2. Wait for build and startup
3. Verify: open / and /health

## Supabase Schema
- Apply in Supabase SQL Editor using supabase/schema.sql
- Or locally via Docker psql (see supabase/README.md)

## Troubleshooting
- 502 Bad Gateway: confirm Docker runtime and /health works; check logs
- Import errors: ensure entrypoint is backend.app.main:app and rootDir is backend
- OpenCV issues: Dockerfile installs libgl1 and libglib2.0-0; use Docker runtime

## Frontend Integration
- Set VITE_API_URL (frontend) to the service external URL
- Redeploy frontend after backend is healthy

## Notes
- Never expose service role keys to frontend/mobile
- Local dev: scripts/bootstrap-e2e.ps1 builds backend and verifies RPCs
