# backend/app/routers/analyze.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os

from backend.app.core.coatvision_core import process_image_file, analyze_coating

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


@router.post("/")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image for coating quality.
    Returns CVI, CQI, coverage and other metrics.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = os.path.join(temp_dir, file.filename or "upload.jpg")
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)

        try:
            metrics = process_image_file(temp_path, temp_dir)
            return {
                "status": "success",
                "filename": file.filename,
                "metrics": metrics,
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.post("/base64")
async def analyze_base64(payload: dict):
    """
    Analyze a base64-encoded image.
    Expects {"image": "<base64_string>"}
    """
    from backend.app.core.coatvision_core import decode_base64_image

    image_data = payload.get("image")
    if not image_data:
        raise HTTPException(status_code=400, detail="Missing 'image' field")

    try:
        image = decode_base64_image(image_data)
        metrics = analyze_coating(image)
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
