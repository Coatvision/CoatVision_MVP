# Vercel Frontend Checklist (CoatVision)

Use this when deploying the dashboard to Vercel.

## Environment Variables
- `VITE_API_URL`: backend external URL (e.g., https://coatvision-mvp-lyxvision.onrender.com)
- Optional:
  - `VITE_SUPABASE_URL`: https://<project>.supabase.co
  - `VITE_SUPABASE_ANON_KEY`: Supabase anon key (frontend-safe)

## Build Settings
- Framework: Vite
- Build command: `npm ci && npm run build` (or `npm install && npm run build`)
- Output directory: `dist`

## Post-Deploy Checks
- Open the site and confirm API calls hit `VITE_API_URL`
- Check CORS on backend allows your Vercel domain

## Notes
- Do not expose service role keys
- If using preview domains, ensure backend CORS includes them
