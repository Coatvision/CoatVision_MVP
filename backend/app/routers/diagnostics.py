from fastapi import APIRouter

router = APIRouter(prefix="/api/diagnostics", tags=["diagnostics"])


@router.get("/ping")
async def ping():
    return {"pong": True}
