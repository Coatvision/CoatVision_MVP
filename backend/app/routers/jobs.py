# backend/app/routers/jobs.py
from fastapi import APIRouter, Depends
from backend.app.security import admin_guard
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class Job(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "pending"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


jobs_db: List[dict] = []


@router.get("/")
async def list_jobs():
    return {"jobs": jobs_db}


@router.post("/")
async def create_job(job: Job, _=Depends(admin_guard)):
    job_dict = job.dict()
    job_dict["id"] = f"job_{len(jobs_db) + 1}"
    job_dict["created_at"] = datetime.utcnow().isoformat()
    jobs_db.append(job_dict)
    return {"status": "created", "job": job_dict}


@router.get("/{job_id}")
async def get_job(job_id: str):
    for job in jobs_db:
        if job.get("id") == job_id:
            return job
    return {"error": "Job not found"}
