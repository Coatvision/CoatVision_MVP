# CoatVision MVP

Public API endpoints are served by FastAPI with Swagger UI at `/docs` and OpenAPI at `/openapi.json`.

Key routers exposed:
- Analyze: `/api/analyze` (file and base64)
- LYXbot: `/api/lyxbot`
- Calibration: `/api/calibration`
- Jobs: `/api/jobs`
- Wash: `/api/wash`
- Reports: `/api/report`

Deploy targets:
- Backend (Render): see render.yaml. Set `OPENAI_API_KEY`, `OPENAI_MODEL`, `DATABASE_URL`, `COATVISION_CORS_ORIGINS`, `PERSIST_BASE`.
- Admin (Vercel): see vercel.json. Set `VITE_BACKEND_URL` to your Render URL.
