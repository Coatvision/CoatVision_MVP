# backend/routers/lyxbot.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid

from core.logger import create_api_logger

router = APIRouter(prefix="/api/lyxbot", tags=["lyxbot"])
logger = create_api_logger("lyxbot")


class LyxbotCommand(BaseModel):
    command: str
    parameters: Optional[Dict[str, Any]] = None


# Supported commands and their handlers
SUPPORTED_COMMANDS = {
    "status": "Get current system status",
    "analyze": "Trigger image analysis",
    "report": "Generate analysis report",
    "calibrate": "Run calibration",
    "help": "Show available commands"
}


@router.get("/status")
async def lyxbot_status():
    """Get LYXbot agent status."""
    return {
        "status": "ok",
        "agent": "LYXbot",
        "version": "1.0.0",
        "active": True,
        "supported_commands": list(SUPPORTED_COMMANDS.keys())
    }


@router.post("/command")
async def lyxbot_command(payload: dict):
    """Send a command to LYXbot agent."""
    request_id = str(uuid.uuid4())[:8]
    command = payload.get("command", "").lower().strip()
    parameters = payload.get("parameters", {})
    
    await logger.info(
        "LYXbot command received",
        {"command": command, "parameters": parameters},
        request_id=request_id
    )
    
    try:
        if not command:
            await logger.warning("Empty command received", request_id=request_id)
            return {
                "status": "error",
                "message": "No command provided",
                "available_commands": SUPPORTED_COMMANDS
            }
        
        # Handle help command
        if command == "help":
            return {
                "status": "success",
                "command": command,
                "message": "Available commands",
                "commands": SUPPORTED_COMMANDS
            }
        
        # Handle status command
        if command == "status":
            return {
                "status": "success",
                "command": command,
                "system_status": {
                    "analyze": "ready",
                    "wash": "ready",
                    "calibration": "ready",
                    "reports": "ready"
                }
            }
        
        # Handle unknown commands
        if command not in SUPPORTED_COMMANDS:
            await logger.warning(
                "Unknown command received",
                {"command": command},
                request_id=request_id
            )
            return {
                "status": "unknown_command",
                "command": command,
                "message": f"Command '{command}' not recognized",
                "available_commands": SUPPORTED_COMMANDS
            }
        
        # Placeholder for other commands
        await logger.info(
            "LYXbot command processed",
            {"command": command},
            request_id=request_id
        )
        return {
            "status": "received",
            "command": command,
            "message": f"Command '{command}' queued for processing",
            "parameters": parameters
        }
        
    except Exception as e:
        await logger.error(
            "LYXbot command failed",
            {"command": command, "error": str(e)},
            request_id=request_id
        )
        raise HTTPException(status_code=500, detail=str(e))
