from fastapi import APIRouter, Depends
from backend.app.security import admin_guard

router = APIRouter(prefix="/api/training", tags=["training"])


@router.post("/start")
async def start_training(_=Depends(admin_guard)):
    return {"status": "started", "message": "Training process queued"}


@router.get("/status")
async def training_status():
    return {"status": "idle", "last_run": None}
