# backend/routers/logs.py
"""
Log management router for admin dashboard.
Provides endpoints to fetch and manage system logs.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from core.logger import LogLevel
from core.supabase_client import get_client, is_supabase_configured

router = APIRouter(prefix="/api/logs", tags=["logs"])


class LogEntry(BaseModel):
    """Log entry model."""
    id: Optional[str] = None
    endpoint: str
    level: str
    message: str
    details: Optional[dict] = None
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    created_at: str


class LogsResponse(BaseModel):
    """Response model for logs endpoint."""
    logs: List[LogEntry]
    total: int
    page: int
    per_page: int


@router.get("/status")
async def logs_status():
    """Check logging system status."""
    return {
        "status": "ok",
        "supabase_configured": is_supabase_configured(),
        "levels": [level.value for level in LogLevel]
    }


@router.get("/")
async def get_logs(
    endpoint: Optional[str] = Query(None, description="Filter by endpoint"),
    level: Optional[str] = Query(None, description="Filter by log level"),
    since: Optional[str] = Query(None, description="ISO timestamp to filter logs from"),
    limit: int = Query(50, ge=1, le=500, description="Number of logs to return"),
    page: int = Query(1, ge=1, description="Page number")
):
    """
    Retrieve system logs.
    Returns logs from Supabase if configured, otherwise returns mock data.
    """
    if not is_supabase_configured():
        # Return demo logs when Supabase is not configured
        demo_logs = generate_demo_logs()
        return {
            "logs": demo_logs,
            "total": len(demo_logs),
            "page": page,
            "per_page": limit,
            "note": "Demo logs - Supabase not configured"
        }
    
    client = get_client()
    if not client:
        raise HTTPException(
            status_code=503,
            detail="Supabase client not available"
        )
    
    try:
        # Build query
        query = client.table("analyze_logs").select("*")
        
        if endpoint:
            query = query.eq("endpoint", endpoint)
        if level:
            query = query.eq("level", level)
        if since:
            query = query.gte("created_at", since)
        
        # Order and paginate
        offset = (page - 1) * limit
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        logs = result.data or []
        
        return {
            "logs": logs,
            "total": len(logs),
            "page": page,
            "per_page": limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch logs: {str(e)}"
        )


@router.get("/summary")
async def get_logs_summary():
    """
    Get a summary of recent log activity.
    Useful for dashboard overview.
    """
    if not is_supabase_configured():
        # Return demo summary
        return {
            "total_logs_24h": 156,
            "errors_24h": 3,
            "warnings_24h": 12,
            "by_endpoint": {
                "analyze": 85,
                "wash": 32,
                "lyxbot": 24,
                "reports": 15
            },
            "note": "Demo data - Supabase not configured"
        }
    
    client = get_client()
    if not client:
        raise HTTPException(
            status_code=503,
            detail="Supabase client not available"
        )
    
    try:
        since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        
        # Get counts by level
        result = client.table("analyze_logs").select("level, endpoint").gte(
            "created_at", since
        ).execute()
        logs = result.data or []
        
        # Calculate summary
        summary = {
            "total_logs_24h": len(logs),
            "errors_24h": sum(1 for log in logs if log.get("level") == "error"),
            "warnings_24h": sum(1 for log in logs if log.get("level") == "warning"),
            "by_endpoint": {}
        }
        
        for log in logs:
            endpoint = log.get("endpoint", "unknown")
            summary["by_endpoint"][endpoint] = summary["by_endpoint"].get(endpoint, 0) + 1
        
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch log summary: {str(e)}"
        )


def generate_demo_logs() -> List[dict]:
    """Generate demo log entries for testing."""
    now = datetime.now(timezone.utc)
    demo_logs = [
        {
            "id": "1",
            "endpoint": "analyze",
            "level": "info",
            "message": "Image analysis completed successfully",
            "details": {"filename": "sample.jpg", "cvi": 85.5, "cqi": 92.3},
            "request_id": "abc123",
            "created_at": (now - timedelta(minutes=5)).isoformat()
        },
        {
            "id": "2",
            "endpoint": "wash",
            "level": "info",
            "message": "Wash analysis completed",
            "details": {"wash_count": 5, "durability_score": 90},
            "request_id": "def456",
            "created_at": (now - timedelta(minutes=15)).isoformat()
        },
        {
            "id": "3",
            "endpoint": "lyxbot",
            "level": "info",
            "message": "LYXbot command received",
            "details": {"command": "status"},
            "request_id": "ghi789",
            "created_at": (now - timedelta(minutes=30)).isoformat()
        },
        {
            "id": "4",
            "endpoint": "analyze",
            "level": "warning",
            "message": "Low image quality detected",
            "details": {"filename": "blurry.jpg", "quality_score": 45},
            "request_id": "jkl012",
            "created_at": (now - timedelta(hours=1)).isoformat()
        },
        {
            "id": "5",
            "endpoint": "analyze",
            "level": "error",
            "message": "Image analysis failed",
            "details": {"filename": "corrupt.jpg", "error": "Invalid image format"},
            "request_id": "mno345",
            "created_at": (now - timedelta(hours=2)).isoformat()
        }
    ]
    return demo_logs
