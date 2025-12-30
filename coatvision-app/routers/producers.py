from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from .. import db_models as models   # 👈 ÉN underscore her
from .. import schemas


router = APIRouter(prefix="/api", tags=["producers"])


@router.post("/producers", response_model=schemas.ProducerRead)
def create_producer(
    producer: schemas.ProducerCreate, db: Session = Depends(get_db)
):
    db_producer = models.Producer(**producer.dict())
    db.add(db_producer)
    db.commit()
    db.refresh(db_producer)
    return db_producer


@router.get("/producers", response_model=List[schemas.ProducerRead])
def list_producers(db: Session = Depends(get_db)):
    return (
        db.query(models.Producer)
        .order_by(models.Producer.created_at.desc())
        .all()
    )


@router.post("/products", response_model=schemas.ProductRead)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    producer = (
        db.query(models.Producer)
        .filter(models.Producer.id == product.producer_id)
        .first()
    )
    if not producer:
        raise HTTPException(status_code=404, detail="Producer not found")

    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/products", response_model=List[schemas.ProductRead])
def list_products(
    producer_id: Optional[int] = None, db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    if producer_id is not None:
        query = query.filter(models.Product.producer_id == producer_id)
    return query.order_by(models.Product.created_at.desc()).all()
