"""
API Router — Races
"""

from fastapi import APIRouter, HTTPException
from app.services import race_service

router = APIRouter(prefix="/races", tags=["Races"])


@router.get("/{year}/{round_num}")
def get_race(year: int, round_num: int):
    """Return details for a specific race."""
    data = race_service.get_race(year, round_num)
    if not data:
        raise HTTPException(status_code=404, detail=f"Race {year} Round {round_num} not found")
    return data


@router.get("/{year}/{round_num}/results")
def get_race_results(year: int, round_num: int):
    """Return race results for a specific Grand Prix."""
    data = race_service.get_race_results(year, round_num)
    if not data:
        raise HTTPException(status_code=404, detail=f"No results found for {year} Round {round_num}")
    return {"year": year, "round": round_num, "total": len(data), "results": data}


@router.get("/{year}/{round_num}/qualifying")
def get_qualifying_results(year: int, round_num: int):
    """Return qualifying results for a specific Grand Prix."""
    data = race_service.get_qualifying_results(year, round_num)
    if not data:
        raise HTTPException(status_code=404, detail=f"No qualifying data for {year} Round {round_num}")
    return {"year": year, "round": round_num, "total": len(data), "qualifying": data}
