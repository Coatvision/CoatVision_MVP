# backend/app/routers/calibration.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/calibration", tags=["calibration"])


@router.get("/status")
async def calibration_status():
    return {
        "status": "ok",
        "calibrated": True,
        "last_calibration": "2024-01-01T00:00:00Z",
        "next_recommended": "2024-07-01T00:00:00Z",
    }


@router.post("/run")
async def run_calibration():
    return {
        "status": "started",
        "message": "Calibration process initiated",
        "estimated_time_seconds": 60,
    }


@router.get("/parameters")
async def get_calibration_parameters():
    return {
        "brightness_offset": 0,
        "contrast_factor": 1.0,
        "color_correction": [1.0, 1.0, 1.0],
        "white_balance": "auto",
    }
