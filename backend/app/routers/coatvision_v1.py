from fastapi import APIRouter, HTTPException
from datetime import datetime
import tempfile
import os
from typing import Optional, Dict, Any

# Avoid importing heavy dependencies at module load; import lazily inside handlers

router = APIRouter(prefix="/v1/coatvision", tags=["coatvision-v1"])


def _result_payload(result: Dict[str, Any], mode: str) -> Dict[str, Any]:
    return {
        "id": f"res_{int(datetime.utcnow().timestamp())}",
        "mode": mode,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "result": result,
    }


@router.post("/analyze-image")
async def analyze_image(payload: Dict[str, Any]):
    image = payload.get("image") or {}
    image_url: Optional[str] = image.get("imageUrl")
    if not image_url:
        raise HTTPException(status_code=400, detail="Missing image.imageUrl")

    try:
        # Last ned bildet til temp og kjør eksisterende pipeline
        import requests
        from backend.app.core.coatvision_core import process_image_file
        with tempfile.TemporaryDirectory() as tmp:
            filename = os.path.join(tmp, "remote_image.jpg")
            resp = requests.get(image_url, timeout=15)
            resp.raise_for_status()
            with open(filename, "wb") as f:
                f.write(resp.content)

            metrics = process_image_file(filename, tmp)
        return _result_payload(metrics, mode="image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze-live")
async def analyze_live(payload: Dict[str, Any]):
    frame = payload.get("frame") or {}
    frame_b64: Optional[str] = frame.get("frameBase64")
    if not frame_b64:
        raise HTTPException(status_code=400, detail="Missing frame.frameBase64")

    try:
        from backend.app.core.coatvision_core import decode_base64_image, analyze_coating
        img = decode_base64_image(frame_b64)
        metrics = analyze_coating(img)
        return _result_payload(metrics, mode="live")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
