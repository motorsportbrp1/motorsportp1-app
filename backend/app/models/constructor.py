"""Pydantic schemas for Constructor-related API responses."""

from pydantic import BaseModel
from typing import Optional


class ConstructorOut(BaseModel):
    """Constructor response model matching the f1db constructors table."""
    id: str
    name: Optional[str] = None
    fullName: Optional[str] = None
    countryId: Optional[str] = None
    logo_url: Optional[str] = None
    car_url: Optional[str] = None

    # Career stats
    totalChampionshipWins: Optional[int] = None
    totalRaceEntries: Optional[int] = None
    totalRaceStarts: Optional[int] = None
    totalRaceWins: Optional[int] = None
    totalPodiums: Optional[int] = None
    totalPoints: Optional[float] = None
    totalPolePositions: Optional[int] = None
    totalFastestLaps: Optional[int] = None
    bestChampionshipPosition: Optional[int] = None
    bestRaceResult: Optional[int] = None
