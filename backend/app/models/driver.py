"""Pydantic schemas for Driver-related API responses."""

from pydantic import BaseModel
from typing import Optional


class DriverOut(BaseModel):
    """Driver response model matching the f1db drivers table."""
    id: str
    name: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    fullName: Optional[str] = None
    abbreviation: Optional[str] = None
    permanentNumber: Optional[int] = None
    gender: Optional[str] = None
    dateOfBirth: Optional[str] = None
    dateOfDeath: Optional[str] = None
    placeOfBirth: Optional[str] = None
    nationalityCountryId: Optional[str] = None
    headshot_url: Optional[str] = None
    helmet_url: Optional[str] = None

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


class DriverSummaryOut(BaseModel):
    """Lightweight driver for listings."""
    id: str
    name: Optional[str] = None
    fullName: Optional[str] = None
    abbreviation: Optional[str] = None
    permanentNumber: Optional[int] = None
    nationalityCountryId: Optional[str] = None
    headshot_url: Optional[str] = None
    totalRaceWins: Optional[int] = None
    totalChampionshipWins: Optional[int] = None
    totalPodiums: Optional[int] = None
