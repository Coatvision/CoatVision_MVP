# backend/app/routers/training.py
from pathlib import Path
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from .. import db_models as models  # kobler til backend/app/db_models.py

router = APIRouter(prefix="/api/training", tags=["training"])

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
TRAINING_DIR = BASE_DIR / "training_data"
TRAINING_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload-image")
async def upload_training_image(
    file: UploadFile = File(...),
    producer_id: Optional[int] = Form(None),
    product_id: Optional[int] = Form(None),
    purpose: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Tom fil")

    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = TRAINING_DIR / filename
    save_path.write_bytes(contents)

    img = models.TrainingImage(
        producer_id=producer_id,
        product_id=product_id,
        purpose=purpose,
        file_path=str(save_path),
        notes=notes,
    )
    db.add(img)
    db.commit()
    db.refresh(img)

    return {
        "id": img.id,
        "file_path": img.file_path,
        "producer_id": img.producer_id,
        "product_id": img.product_id,
        "purpose": img.purpose,
    }
