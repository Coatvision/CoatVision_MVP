# Environment Variables & Branch Switch Guide

This guide lists the environment variables needed for deployments and how to set the default branch to `clean-main`.

## GitHub Default Branch
- Go to GitHub → Repository → Settings → Branches
- Change Default branch to `clean-main`
- (Optional) Add protection rules to require PRs and restrict who can push

## Render Backend Env Vars
- `ADMIN_TOKEN`: Required. Token for admin-protected endpoints (`X-Admin-Token` header).
- `OPENAI_API_KEY`: Optional. Needed if analysis uses OpenAI.
- `OPENAI_MODEL`: Optional. Example: `gpt-4o-mini`.
- `DATABASE_URL`: Optional. If omitted, SQLite is used (Windows-safe path).
- `COATVISION_CORS_ORIGINS`: Recommended `*` during testing; restrict later.
- `PERSIST_BASE`: Path for persisted data. On Render, use `/data`.
- `PYTHON_VERSION`: Example `3.11`.

## Vercel Frontend Env Vars (coatvision-app)
- `VITE_BACKEND_URL`: Base URL of the Render backend, e.g., `https://<service>.onrender.com`.
- `VITE_COATVISION_USE_REMOTE`: `1` to force remote API usage.

## Expo Mobile Env Vars (mobile)
- `EXPO_PUBLIC_COATVISION_API_BASE_URL`: Base URL of the Render backend.
- `EXPO_PUBLIC_COATVISION_USE_REMOTE`: `1` to force remote API usage.

## Verification
Use the helper script after deploy:
```
python backend/scripts/verify_prod.py https://<service>.onrender.com <optional_admin_token>
```
Checks `/health`, `/docs`, and v1 analyze endpoints.
