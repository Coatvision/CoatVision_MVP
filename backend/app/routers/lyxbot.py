# backend/app/routers/lyxbot.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/lyxbot", tags=["lyxbot"])


@router.get("/status")
async def lyxbot_status():
    return {"status": "ok", "agent": "LYXbot", "version": "1.0.0", "active": True}


@router.post("/command")
async def lyxbot_command(payload: dict):
    command = payload.get("command", "")
    return {
        "status": "received",
        "command": command,
        "message": "LYXbot command processing not yet implemented",
    }
