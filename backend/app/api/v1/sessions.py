from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.session_service import get_stints, get_all_laps, get_speed_traps, get_minisectors, get_best_sectors, get_fastf1_summary_data
from app.core.job_manager import create_job, run_async_job

router = APIRouter(prefix="/sessions", tags=["FastF1 Sessions"])

@router.get("/{year}/{round}/{session_name}/stints")
def get_session_stints(year: int, round: int, session_name: str):
    """
    Get all tyre stints and Long Run Pace for a specific session.
    session_name supports: 'FP1', 'FP2', 'FP3', 'Q', 'S', 'SQ', 'R'
    """
    try:
        stints = get_stints(year, round, session_name)
        return {"stints": stints}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{year}/{round}/{session_name}/stints/job")
def get_session_stints_job(year: int, round: int, session_name: str, bg_tasks: BackgroundTasks):
    """Async background execution for get_session_stints."""
    job_id = create_job()
    bg_tasks.add_task(run_async_job, job_id, get_stints, year, round, session_name)
    return {"job_id": job_id, "status": "pending"}

@router.get("/{year}/{round}/{session_name}/laps")
def get_session_laps(year: int, round: int, session_name: str):
    """
    Get all laps for all drivers in a session.
    Useful for scatter plots.
    """
    try:
        laps = get_all_laps(year, round, session_name)
        return {"laps": laps}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{year}/{round}/{session_name}/laps/job")
def get_session_laps_job(year: int, round: int, session_name: str, bg_tasks: BackgroundTasks):
    job_id = create_job()
    bg_tasks.add_task(run_async_job, job_id, get_all_laps, year, round, session_name)
    return {"job_id": job_id, "status": "pending"}

@router.get("/{year}/{round}/{session_name}/speed-traps")
def get_session_speed_traps(year: int, round: int, session_name: str):
    """
    Get max speeds per driver per sector and speed trap.
    """
    try:
        traps = get_speed_traps(year, round, session_name)
        return {"speed_traps": traps}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{year}/{round}/{session_name}/minisectors")
def get_session_minisectors(year: int, round: int, session_name: str, num: int = 25):
    """
    Get the fastest driver for track segments (minisectors) based on telemetry.
    """
    try:
        segments = get_minisectors(year, round, session_name, num)
        return {"minisectors": segments}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{year}/{round}/{session_name}/speed-traps/job")
def get_session_speed_traps_job(year: int, round: int, session_name: str, bg_tasks: BackgroundTasks):
    job_id = create_job()
    bg_tasks.add_task(run_async_job, job_id, get_speed_traps, year, round, session_name)
    return {"job_id": job_id, "status": "pending"}

@router.get("/{year}/{round}/{session_name}/best-sectors")
def get_session_best_sectors(year: int, round: int, session_name: str):
    """
    Get the fastest driver for each sector and judge personal performance.
    """
    try:
        sectors = get_best_sectors(year, round, session_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{year}/{round}/{session_name}/fastf1-summary")
def get_fastf1_summary(year: int, round: int, session_name: str):
    """
    Get stints, speed traps, minisectors, and best sectors in a single request,
    parsing the FastF1 session exactly once.
    """
    try:
        summary_data = get_fastf1_summary_data(year, round, session_name)
        return summary_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

