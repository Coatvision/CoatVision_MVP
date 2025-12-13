# backend/routers/analyze.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
import uuid

from core.coatvision_core import process_image_file, analyze_coating
from core.logger import create_api_logger

router = APIRouter(prefix="/api/analyze", tags=["analyze"])
logger = create_api_logger("analyze")


@router.post("/")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image for coating quality.
    Returns CVI, CQI, coverage and other metrics.
    """
    request_id = str(uuid.uuid4())[:8]
    await logger.info(
        "Image analysis request received",
        {"filename": file.filename, "request_id": request_id}
    )
    
    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        # Save uploaded file
        temp_path = os.path.join(temp_dir, file.filename or "upload.jpg")
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        try:
            # Run analysis
            metrics = process_image_file(temp_path, temp_dir)
            await logger.info(
                "Image analysis completed successfully",
                {"filename": file.filename, "cvi": metrics.get("cvi"), "cqi": metrics.get("cqi")},
                request_id=request_id
            )
            return {
                "status": "success",
                "filename": file.filename,
                "metrics": metrics
            }
        except Exception as e:
            await logger.error(
                "Image analysis failed",
                {"filename": file.filename, "error": str(e)},
                request_id=request_id
            )
            raise HTTPException(status_code=400, detail=str(e))


@router.post("/base64")
async def analyze_base64(payload: dict):
    """
    Analyze a base64-encoded image.
    Expects {"image": "<base64_string>"}
    """
    from core.coatvision_core import decode_base64_image
    
    request_id = str(uuid.uuid4())[:8]
    await logger.info("Base64 image analysis request received", {"request_id": request_id})
    
    image_data = payload.get("image")
    if not image_data:
        await logger.warning("Missing image field in request", {"request_id": request_id})
        raise HTTPException(status_code=400, detail="Missing 'image' field")
    
    try:
        image = decode_base64_image(image_data)
        metrics = analyze_coating(image)
        await logger.info(
            "Base64 image analysis completed",
            {"cvi": metrics.get("cvi"), "cqi": metrics.get("cqi")},
            request_id=request_id
        )
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        await logger.error(
            "Base64 image analysis failed",
            {"error": str(e)},
            request_id=request_id
        )
        raise HTTPException(status_code=400, detail=str(e))
