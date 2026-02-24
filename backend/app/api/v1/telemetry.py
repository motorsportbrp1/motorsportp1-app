from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from app.services.telemetry_service import get_driver_telemetry, compare_telemetry
from app.core.job_manager import create_job, run_async_job

router = APIRouter(prefix="/telemetry", tags=["FastF1 Telemetry"])

@router.get("/{year}/{round}/{session_name}/{driver_id}")
def get_telemetry(year: int, round: int, session_name: str, driver_id: str):
    """
    Get detailed telemetry for a driver's fastest lap in a session.
    """
    try:
        data = get_driver_telemetry(year, round, session_name, driver_id)
        if not data:
            raise HTTPException(status_code=404, detail="Telemetry not found for this driver/session")
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{year}/{round}/{session_name}/{driver_id}/job")
def start_telemetry_job(year: int, round: int, session_name: str, driver_id: str, bg_tasks: BackgroundTasks):
    """Async background execution for telemetry extraction."""
    job_id = create_job()
    bg_tasks.add_task(run_async_job, job_id, get_driver_telemetry, year, round, session_name, driver_id)
    return {"job_id": job_id, "status": "pending"}

@router.get("/{year}/{round}/{session_name}/compare")
def compare_drivers_telemetry(
    year: int, 
    round: int, 
    session_name: str, 
    driver1: str = Query(..., description="E.g., VER"), 
    driver2: str = Query(..., description="E.g., LEC")
):
    """
    Compare detailed telemetry for two drivers' fastest laps.
    """
    try:
        data = compare_telemetry(year, round, session_name, driver1, driver2)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{year}/{round}/{session_name}/compare/job")
def compare_drivers_telemetry_job(
    year: int, 
    round: int, 
    session_name: str, 
    bg_tasks: BackgroundTasks,
    driver1: str = Query(..., description="E.g., VER"), 
    driver2: str = Query(..., description="E.g., LEC")
):
    job_id = create_job()
    bg_tasks.add_task(run_async_job, job_id, compare_telemetry, year, round, session_name, driver1, driver2)
    return {"job_id": job_id, "status": "pending"}
