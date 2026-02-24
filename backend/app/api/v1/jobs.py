from fastapi import APIRouter, HTTPException
from app.core.job_manager import get_job_status

router = APIRouter(prefix="/jobs", tags=["Async Jobs"])

@router.get("/{job_id}")
def check_job(job_id: str):
    """
    Check the status and retrieve the results of a background job.
    status can be: 'pending', 'processing', 'completed', 'failed', 'not_found'
    """
    job = get_job_status(job_id)
    if job.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Job not found or expired")
    return job
