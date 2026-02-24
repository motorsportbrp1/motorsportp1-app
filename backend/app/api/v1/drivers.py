"""
API Router — Drivers
"""

from fastapi import APIRouter, HTTPException, Query
from app.services import driver_service

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.get("")
def list_drivers(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None, description="Search by driver name"),
):
    """Return a paginated list of all F1 drivers."""
    data = driver_service.get_all_drivers(limit=limit, offset=offset, search=search)
    total = driver_service.get_drivers_count(search=search)
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "drivers": data,
    }


@router.get("/{driver_id}")
def get_driver(driver_id: str):
    """Return full profile for a single driver."""
    data = driver_service.get_driver_by_id(driver_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Driver '{driver_id}' not found")
    return data


@router.get("/{driver_id}/results")
def get_driver_results(
    driver_id: str,
    year: int | None = Query(None, description="Filter results by season year"),
):
    """Return race results for a driver, optionally filtered by year."""
    data = driver_service.get_driver_results(driver_id, year=year)
    return {"driver_id": driver_id, "total_results": len(data), "results": data}
