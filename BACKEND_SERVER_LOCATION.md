# CoatVision Backend Server Code Location

## GitHub Repository
**Repository:** https://github.com/Coatvision/CoatVision_MVP

## Backend Server Main Entry Point

The CoatVision backend server code is located at:

### Main File
- **File:** `backend/main.py`
- **GitHub URL:** https://github.com/Coatvision/CoatVision_MVP/blob/main/backend/main.py

This is the primary file that defines and starts the FastAPI backend server for CoatVision.

## Repository Structure

```
CoatVision_MVP/
├── backend/                    # Backend directory
│   ├── main.py                # ⭐ Main server entry point
│   ├── routers/               # API route handlers
│   │   ├── analyze.py         # Coating analysis endpoints
│   │   ├── lyxbot.py          # AI assistant endpoints
│   │   ├── jobs.py            # Job management endpoints
│   │   ├── calibration.py     # Calibration endpoints
│   │   ├── wash.py            # Wash analysis endpoints
│   │   └── reports.py         # Report generation endpoints
│   ├── app/                   # Application services
│   │   ├── services/          # Business logic services
│   │   │   ├── analyzer.py    # Image analysis service
│   │   │   └── training.py    # Training service
│   │   └── models.py          # Data models
│   ├── core/                  # Core functionality
│   │   └── coatvision_core.py # Core vision processing
│   └── requirements.txt       # Python dependencies
```

## How to Start the Backend Server

### Option 1: Direct Command (Development)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: From Repository Root
```bash
cd /path/to/CoatVision_MVP
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Docker (if available)
```bash
docker compose up -d
```

## Backend Server Details

### Framework
- **FastAPI** - Modern, fast web framework for building APIs with Python

### Main Application Object
```python
app = FastAPI(
    title="CoatVision API",
    description="CoatVision coating analysis backend API",
    version="2.0.0"
)
```

### API Endpoints
Once started, the server provides:
- **Root:** http://localhost:8000/
- **Health Check:** http://localhost:8000/health
- **API Documentation:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)

### Main API Routes
- `/api/analyze` - Coating analysis
- `/api/lyxbot` - AI assistant
- `/api/jobs` - Job management
- `/api/calibration` - Calibration
- `/api/wash` - Wash analysis
- `/api/report` - Report generation

## Quick Links

- **Main server file:** [backend/main.py](https://github.com/Coatvision/CoatVision_MVP/blob/main/backend/main.py)
- **Backend directory:** [backend/](https://github.com/Coatvision/CoatVision_MVP/tree/main/backend)
- **Full repository:** [CoatVision_MVP](https://github.com/Coatvision/CoatVision_MVP)
- **README:** [README.md](https://github.com/Coatvision/CoatVision_MVP/blob/main/README.md)

## Verification

The backend server command has been verified and tested:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Test the server:**
```bash
# Root endpoint
curl http://localhost:8000/

# Health check
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
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
```

## Additional Resources

For detailed setup instructions, see the main [README.md](https://github.com/Coatvision/CoatVision_MVP/blob/main/README.md) file in the repository root.
