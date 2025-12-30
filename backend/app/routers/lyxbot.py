# backend/app/routers/lyxbot.py
from fastapi import APIRouter, Depends
from backend.app.security import admin_guard

router = APIRouter(prefix="/api/lyxbot", tags=["lyxbot"])


@router.get("/status")
async def lyxbot_status():
    return {"status": "ok", "agent": "LYXbot", "version": "1.0.0", "active": True}


@router.post("/command")
async def lyxbot_command(payload: dict, _=Depends(admin_guard)):
    command = payload.get("command", "")
    return {
        "status": "received",
        "command": command,
        "message": "LYXbot command processing not yet implemented",
    }
