# Deploy Now - Quick Steps

## 1. Render Backend Environment Variables

In your Render Environment Group, set these **exact** variable names and values:

### Required Variables
```
ADMIN_TOKEN=<your-chosen-admin-token>
OPENAI_API_KEY=<your-openai-key>
DATABASE_URL=sqlite:////data/coatvision.db
COATVISION_CORS_ORIGINS=*
PERSIST_BASE=/data
PYTHON_VERSION=3.11
```

### Optional Variables
```
OPENAI_MODEL=gpt-4o-mini
```

**Important:** Use `OPENAI_API_KEY` not `OPEN_AI_KEY`

## 2. Attach Environment Group to Service

1. Go to your backend service in Render
2. Click "Environment" tab
3. Click "Environment Groups"
4. Select the group you just created
5. Save changes

## 3. Switch GitHub Default Branch

1. Go to https://github.com/Coatvision/CoatVision_MVP/settings/branches
2. Click the pencil icon next to "Default branch"
3. Select `clean-main`
4. Confirm the switch

## 4. Deploy Backend

- Render will auto-deploy when you attach the env group
- Wait for "Live" status
- Note your service URL: `https://<service-name>.onrender.com`

## 5. Vercel Frontend

1. In your Vercel project for `coatvision-app`
2. Go to Settings → Environment Variables
3. Set:
   - `VITE_BACKEND_URL` = `https://<your-render-service>.onrender.com`
   - `VITE_COATVISION_USE_REMOTE` = `1`
4. **DO NOT** add `OPENAI_API_KEY` to Vercel
5. Redeploy

## 6. Mobile (Expo)

Create `mobile/.env` file:
```
EXPO_PUBLIC_COATVISION_API_BASE_URL=https://<your-render-service>.onrender.com
EXPO_PUBLIC_COATVISION_USE_REMOTE=1
```

## 7. Verify Deployment

```powershell
# Quick health check
Invoke-WebRequest -Uri https://<your-render-service>.onrender.com/health -UseBasicParsing

# Check Swagger
Invoke-WebRequest -Uri https://<your-render-service>.onrender.com/docs -UseBasicParsing

# Full verification
python backend/scripts/verify_prod.py https://<your-render-service>.onrender.com <your-admin-token>
```

## Expected Results

- `/health` returns 200 OK with `{"status":"ok"}`
- `/docs` shows Swagger UI with these tags:
  - lyxbot
  - analyze
  - calibration
  - jobs
  - wash
  - reports
  - coatvision-v1
- v1 endpoints available:
  - `POST /v1/coatvision/analyze-image`
  - `POST /v1/coatvision/analyze-live`

## Troubleshooting

- If routes missing: Check Render logs for "[routers] Included: backend.app.routers.coatvision_v1"
- If 500 errors: Check `OPENAI_API_KEY` is set correctly (not `OPEN_AI_KEY`)
- If CORS errors: Verify `COATVISION_CORS_ORIGINS=*`
- If DB errors: Use `sqlite:////data/coatvision.db` (note 4 slashes for absolute path)

## Security Notes

- Rotate your OpenAI key if it was ever in Vercel client envs
- Keep `ADMIN_TOKEN` secret; it protects write endpoints
- After testing, restrict CORS from `*` to your actual domains
