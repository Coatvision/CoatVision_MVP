# backend/routers/jobs.py
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class Job(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "pending"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# In-memory job storage (placeholder - should use database)
jobs_db: List[dict] = []


@router.get("/")
async def list_jobs():
    """List all jobs."""
    return {"jobs": jobs_db}


@router.post("/")
async def create_job(job: Job):
    """Create a new job."""
    job_dict = job.model_dump()
    job_dict["id"] = f"job_{len(jobs_db) + 1}"
    job_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    jobs_db.append(job_dict)
    return {"status": "created", "job": job_dict}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get a specific job by ID."""
    for job in jobs_db:
        if job.get("id") == job_id:
            return job
    return {"error": "Job not found"}
