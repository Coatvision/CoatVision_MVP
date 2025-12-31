from fastapi import APIRouter

router = APIRouter(prefix="/api/producers", tags=["producers"])


@router.get("/")
async def list_producers():
    return {"producers": []}
