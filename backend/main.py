# backend/main.py
# v2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze, lyxbot, jobs, calibration, wash, reports

app = FastAPI(
    title="CoatVision API",
    description="CoatVision coating analysis backend API",
    version="2.0.0"
)

# CORS middleware - open for development, tighten for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router)
app.include_router(lyxbot.router)
app.include_router(jobs.router)
app.include_router(calibration.router)
app.include_router(wash.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "ok",
        "name": "CoatVision API",
        "version": "2.0.0",
        "endpoints": {
            "analyze": "/api/analyze",
            "lyxbot": "/api/lyxbot",
            "jobs": "/api/jobs",
            "calibration": "/api/calibration",
            "wash": "/api/wash",
            "reports": "/api/report"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
