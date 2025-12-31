from fastapi import APIRouter

router = APIRouter(prefix="/api/config-model", tags=["config-model"])


@router.get("/status")
async def config_model_status():
    return {"status": "ok"}
