from fastapi import APIRouter

router = APIRouter(prefix="/api/training-sessions", tags=["training-sessions"])


@router.get("/")
async def list_sessions():
    return {"sessions": []}
