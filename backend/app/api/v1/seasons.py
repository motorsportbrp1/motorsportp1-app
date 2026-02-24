"""
API Router — Seasons & Standings
"""

from fastapi import APIRouter, HTTPException
from app.services import season_service

router = APIRouter(prefix="/seasons", tags=["Seasons"])


@router.get("")
def list_seasons():
    """Return all F1 seasons (1950–2025)."""
    data = season_service.get_all_seasons()
    return {"seasons": data}


@router.get("/{year}/races")
def list_season_races(year: int):
    """Return all races for a given season."""
    data = season_service.get_season_races(year)
    if not data:
        raise HTTPException(status_code=404, detail=f"No races found for season {year}")
    return {"year": year, "total_races": len(data), "races": data}


@router.get("/{year}/standings/drivers")
def season_driver_standings(year: int):
    """Return final driver championship standings for a season."""
    data = season_service.get_season_driver_standings(year)
    return {"year": year, "standings": data}


@router.get("/{year}/standings/constructors")
def season_constructor_standings(year: int):
    """Return final constructor championship standings for a season."""
    data = season_service.get_season_constructor_standings(year)
    return {"year": year, "standings": data}
