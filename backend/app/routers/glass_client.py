from fastapi import APIRouter

router = APIRouter(prefix="/api/glass", tags=["glass-client"])


@router.get("/status")
async def glass_status():
    return {"status": "ok"}
