from fastapi import APIRouter

router = APIRouter(prefix="/api/core", tags=["core"])


@router.get("/status")
async def core_status():
    return {"status": "ok", "version": "mvp"}
