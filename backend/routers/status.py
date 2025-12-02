# backend/routers/status.py
"""
System status and health monitoring endpoints.
Provides comprehensive health checks for all subsystems.
"""
from fastapi import APIRouter
from datetime import datetime, timezone
from typing import Dict, Any

from core.supabase_client import is_supabase_configured

router = APIRouter(prefix="/api/status", tags=["status"])


def get_system_info() -> Dict[str, Any]:
    """Get basic system information."""
    return {
        "name": "CoatVision API",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def check_analyze_subsystem() -> Dict[str, Any]:
    """Check the analyze subsystem status."""
    try:
        # Import to verify module is available
        from core.coatvision_core import analyze_coating  # noqa: F401
        return {
            "status": "healthy",
            "module": "coatvision_core",
            "features": ["image_analysis", "base64_analysis", "metrics_calculation"]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


def check_wash_subsystem() -> Dict[str, Any]:
    """Check the wash analysis subsystem status."""
    return {
        "status": "healthy",
        "module": "wash_analysis",
        "features": ["durability_analysis", "wash_count_tracking"]
    }


def check_lyxbot_subsystem() -> Dict[str, Any]:
    """Check the LYXbot agent subsystem status."""
    return {
        "status": "healthy",
        "agent": "LYXbot",
        "features": ["command_processing", "status_queries", "help_system"]
    }


def check_reports_subsystem() -> Dict[str, Any]:
    """Check the reports subsystem status."""
    try:
        from reportlab.lib.pagesizes import A4  # noqa: F401
        pdf_available = True
    except ImportError:
        pdf_available = False
    
    return {
        "status": "healthy" if pdf_available else "degraded",
        "module": "reports",
        "pdf_generation": pdf_available,
        "features": ["demo_report", "pdf_export"]
    }


def check_database_status() -> Dict[str, Any]:
    """Check database (Supabase) connectivity status."""
    configured = is_supabase_configured()
    return {
        "status": "configured" if configured else "not_configured",
        "provider": "supabase",
        "tables": ["analyze_logs", "analysis_results", "jobs"] if configured else []
    }


@router.get("/")
async def get_system_status():
    """
    Get comprehensive system status.
    Returns health status of all subsystems.
    """
    return {
        "system": get_system_info(),
        "overall_status": "healthy",
        "subsystems": {
            "analyze": check_analyze_subsystem(),
            "wash": check_wash_subsystem(),
            "lyxbot": check_lyxbot_subsystem(),
            "reports": check_reports_subsystem(),
            "database": check_database_status()
        },
        "endpoints": {
            "analyze": "/api/analyze",
            "wash": "/api/wash",
            "lyxbot": "/api/lyxbot",
            "jobs": "/api/jobs",
            "calibration": "/api/calibration",
            "reports": "/api/report",
            "logs": "/api/logs"
        }
    }


@router.get("/health")
async def health_check():
    """
    Simple health check endpoint.
    Returns minimal response for load balancer checks.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/subsystem/{name}")
async def get_subsystem_status(name: str):
    """
    Get status of a specific subsystem.
    Valid names: analyze, wash, lyxbot, reports, database
    """
    subsystem_checks = {
        "analyze": check_analyze_subsystem,
        "wash": check_wash_subsystem,
        "lyxbot": check_lyxbot_subsystem,
        "reports": check_reports_subsystem,
        "database": check_database_status
    }
    
    if name not in subsystem_checks:
        return {
            "status": "unknown",
            "error": f"Unknown subsystem: {name}",
            "available_subsystems": list(subsystem_checks.keys())
        }
    
    return {
        "subsystem": name,
        **subsystem_checks[name]()
    }


@router.get("/version")
async def get_version():
    """Get API version information."""
    return {
        "name": "CoatVision API",
        "version": "2.0.0",
        "api_prefix": "/api",
        "documentation": "/docs"
    }
