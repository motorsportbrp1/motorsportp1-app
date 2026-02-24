"""Pydantic schemas for Race-related API responses."""

from pydantic import BaseModel
from typing import Optional


class RaceOut(BaseModel):
    """Race response model matching the f1db races table."""
    id: str
    year: Optional[int] = None
    round: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None
    grandPrixId: Optional[str] = None
    officialName: Optional[str] = None
    circuitId: Optional[str] = None
    circuitType: Optional[str] = None
    courseLength: Optional[float] = None
    laps: Optional[int] = None
    distance: Optional[float] = None
    scheduledLaps: Optional[int] = None


class RaceResultOut(BaseModel):
    """Race result for a single driver."""
    raceId: Optional[str] = None
    year: Optional[int] = None
    round: Optional[int] = None
    positionNumber: Optional[int] = None
    positionText: Optional[str] = None
    driverNumber: Optional[int] = None
    driverId: Optional[str] = None
    constructorId: Optional[str] = None
    laps: Optional[int] = None
    time: Optional[str] = None
    timeMillis: Optional[int] = None
    gap: Optional[str] = None
    gapMillis: Optional[int] = None
    points: Optional[float] = None
    gridPositionNumber: Optional[int] = None
    positionsGained: Optional[int] = None
    reasonRetired: Optional[str] = None
    fastestLap: Optional[bool] = None


class QualifyingResultOut(BaseModel):
    """Qualifying result for a single driver."""
    raceId: Optional[str] = None
    year: Optional[int] = None
    round: Optional[int] = None
    positionNumber: Optional[int] = None
    positionText: Optional[str] = None
    driverNumber: Optional[int] = None
    driverId: Optional[str] = None
    constructorId: Optional[str] = None
    time: Optional[str] = None
    timeMillis: Optional[int] = None
    q1: Optional[str] = None
    q1Millis: Optional[int] = None
    q2: Optional[str] = None
    q2Millis: Optional[int] = None
    q3: Optional[str] = None
    q3Millis: Optional[int] = None
    laps: Optional[int] = None


class DriverStandingOut(BaseModel):
    """Driver championship standing."""
    raceId: Optional[str] = None
    year: Optional[int] = None
    round: Optional[int] = None
    positionNumber: Optional[int] = None
    positionText: Optional[str] = None
    driverId: Optional[str] = None
    points: Optional[float] = None
    positionsGained: Optional[int] = None
    championshipWon: Optional[bool] = None


class ConstructorStandingOut(BaseModel):
    """Constructor championship standing."""
    raceId: Optional[str] = None
    year: Optional[int] = None
    round: Optional[int] = None
    positionNumber: Optional[int] = None
    positionText: Optional[str] = None
    constructorId: Optional[str] = None
    points: Optional[float] = None
    positionsGained: Optional[int] = None
    championshipWon: Optional[bool] = None
