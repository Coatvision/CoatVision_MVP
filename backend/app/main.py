import os
from fastapi import Response, FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from sqlmodel import SQLModel


RequestLoggingMiddleware = None  # Middleware import skipped: module not found

# Opprett FastAPI-app her (ikke importer fra ikke-eksisterende modul)
app = FastAPI(title="CoatVision Core")
# Sørg for at tabellene finnes (bruker coatvision.db fra .env)
Base.metadata.create_all(bind=engine)
# Også opprett SQLModel-tabeller (CalibrationEvent, CalibrationWeightsProfile)
try:
    pass
    SQLModel.metadata.create_all(bind=engine)
except Exception:
    pass

# Allow CORS for admin dashboard and mobile clients during MVP.
_raw_origins = os.getenv(
    "COATVISION_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174,"
    "http://localhost:19001,http://127.0.0.1:19001,"
    "exp://127.0.0.1:19000,exp://192.168.0.0:19000,"
    "https://coatvision-mvp.onrender.com,https://www.yourdomain.no"
)
_allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if RequestLoggingMiddleware:
    app.add_middleware(RequestLoggingMiddleware)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "CoatVision backend running",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    # Return empty response to avoid 404 noise in logs.
    return Response(status_code=204)


def _include_optional_router(module_path: str, attr_name: str = "router"):
    """Safely import a router module and include it if available.
    This prevents a single failing import (e.g., heavy deps like cv2) from breaking Swagger.
    """
    try:
        module = __import__(module_path, fromlist=[attr_name])
        router = getattr(module, attr_name)
        if router:
            app.include_router(router)
            print(f"[routers] Included: {module_path}")
    except Exception as e:
        # Log and continue so OpenAPI remains populated with available routes
        print(f"[routers] Skipped {module_path}: {e}")


# Koble til routere (robust mot manglende avhengigheter i enkelte moduler)
_include_optional_router("backend.app.routers.lyxbot")
_include_optional_router("backend.app.routers.producers")
_include_optional_router("backend.app.routers.training")
_include_optional_router("backend.app.routers.analyze")
_include_optional_router("backend.app.routers.admin_mock")
_include_optional_router("backend.app.routers.core")
_include_optional_router("backend.app.routers.training_sessions")
_include_optional_router("backend.app.routers.glass_client")
_include_optional_router("backend.app.routers.auth")
_include_optional_router("backend.app.routers.config", attr_name="router")
_include_optional_router("backend.app.routers.diagnostics")
_include_optional_router("backend.app.routers.config_model")

# Serve statiske analyse-resultater (overlays) fra outputs/
try:
    try:
        try:
            from backend.app.services.config import BACKEND_DIR
            outputs_dir = (BACKEND_DIR / "outputs").resolve()
            outputs_dir.mkdir(parents=True, exist_ok=True)
            app.mount("/outputs", StaticFiles(directory=str(outputs_dir), check_dir=False), name="outputs")
        except ImportError:
            # Module not found, skip mounting outputs
            print("[warning] backend.app.services.config could not be imported; skipping /outputs mount.")
        except Exception:
            # Ikke fatal i utvikling hvis mappe mangler eller annen feil
            pass
    except ImportError:
        # Module not found, skip mounting outputs
        print("[warning] backend.app.services.config could not be imported; skipping /outputs mount.")
    except Exception:
        # Ikke fatal i utvikling hvis mappe mangler eller annen feil
        pass
        try:
            from .services.config import BACKEND_DIR
            outputs_dir = (BACKEND_DIR / "outputs").resolve()
            outputs_dir.mkdir(parents=True, exist_ok=True)
            app.mount("/outputs", StaticFiles(directory=str(outputs_dir), check_dir=False), name="outputs")
        except ImportError:
            # Module not found, skip mounting outputs
            print("[warning] backend.app.services.config could not be imported; skipping /outputs mount.")
        except Exception:
            # Ikke fatal i utvikling hvis mappe mangler eller annen feil
            pass
except Exception:
    pass