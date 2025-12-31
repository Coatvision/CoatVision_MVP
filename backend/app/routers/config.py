from fastapi import APIRouter

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("/status")
async def config_status():
    return {"status": "ok"}
