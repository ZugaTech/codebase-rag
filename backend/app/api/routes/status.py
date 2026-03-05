from fastapi import APIRouter, HTTPException
from app.services.indexer import get_job_status
import dataclasses

router = APIRouter()

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    job = get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return dataclasses.asdict(job)
