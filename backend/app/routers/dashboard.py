from fastapi import APIRouter, HTTPException
from backend.app.services.supabase_client import get_dashboard_summary, get_latest_analyses

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary():
    data = get_dashboard_summary()
    if data is None:
        raise HTTPException(status_code=500, detail="Supabase not configured or unavailable")
    return data


@router.get("/latest")
async def latest(limit: int = 10):
    data = get_latest_analyses(limit)
    if data is None:
        raise HTTPException(status_code=500, detail="Supabase not configured or unavailable")
    return data
