# Deployment Checklist (Render + Vercel)

Use this checklist to deploy the backend on Render and the frontend on Vercel.

## Pre-Deployment
- Default branch set to `clean-main` (GitHub → Settings → Branches)
- Secrets removed from code; env vars documented
- Health endpoint exists: `/health`
- Swagger available: `/docs`
- CORS acceptable (default `*` or restrict via `COATVISION_CORS_ORIGINS`)

## Push to GitHub
```bash
# From local workspace
git push origin clean-main
```
Then set default branch to `clean-main`.

## Render Backend
- Create Blueprint from repo; `render.yaml` will configure the Web Service
- Environment variables:
  - `ADMIN_TOKEN` (required for admin endpoints)
  - `OPENAI_API_KEY` (optional)
  - `OPENAI_MODEL` (e.g., `gpt-4o-mini`, optional)
  - `DATABASE_URL` (optional; otherwise SQLite)
  - `COATVISION_CORS_ORIGINS` (e.g., `*`)
  - `PERSIST_BASE` (e.g., `/data`)
  - `PYTHON_VERSION` (e.g., `3.11`)

## Vercel Frontend (coatvision-app)
- Create project from the `coatvision-app` folder
- Environment variables:
  - `VITE_BACKEND_URL` = `https://<your-render-service>.onrender.com`
  - `VITE_COATVISION_USE_REMOTE` = `1`
- Build and deploy

## Mobile (Expo)
- Use `mobile/.env` (see `mobile/.env.example`)
```
EXPO_PUBLIC_COATVISION_API_BASE_URL=https://<your-render-service>.onrender.com
EXPO_PUBLIC_COATVISION_USE_REMOTE=1
```

## Verification
```bash
python backend/scripts/verify_prod.py https://<your-render-service>.onrender.com <optional_admin_token>
```
- Visit `/docs` and try:
  - `POST /v1/coatvision/analyze-image`
  - `POST /v1/coatvision/analyze-live`
- Admin endpoints require header `X-Admin-Token: <ADMIN_TOKEN>`
