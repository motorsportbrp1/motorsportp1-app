import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

# Naive in-memory job store
# In production, this should be replaced by Redis to support multiple uvicorn workers.
_JOBS_STORE: Dict[str, Dict[str, Any]] = {}

def create_job() -> str:
    """Creates a new job in the store and returns its ID."""
    job_id = str(uuid.uuid4())
    _JOBS_STORE[job_id] = {
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "result": None,
        "error": None
    }
    return job_id

def get_job_status(job_id: str) -> Dict[str, Any]:
    """Retrieves the status of a job."""
    if job_id not in _JOBS_STORE:
        return {"status": "not_found"}
    return _JOBS_STORE[job_id]

async def run_async_job(job_id: str, func: Callable, *args, **kwargs):
    """
    Executes a synchronous function (like Pandas/FastF1 processing)
    in a separate thread to avoid blocking the main FastAPI event loop.
    """
    _JOBS_STORE[job_id]["status"] = "processing"
    try:
        # Run blocking synchronous code in threadpool
        result = await asyncio.to_thread(func, *args, **kwargs)
        _JOBS_STORE[job_id]["status"] = "completed"
        _JOBS_STORE[job_id]["result"] = result
    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        _JOBS_STORE[job_id]["status"] = "failed"
        _JOBS_STORE[job_id]["error"] = str(e)
