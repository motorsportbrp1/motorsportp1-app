"""Pydantic schemas for Circuit-related API responses."""

from pydantic import BaseModel
from typing import Optional


class CircuitOut(BaseModel):
    """Circuit response model matching the f1db circuits table."""
    id: str
    name: Optional[str] = None
    fullName: Optional[str] = None
    type: Optional[str] = None
    direction: Optional[str] = None
    placeName: Optional[str] = None
    countryId: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    length: Optional[float] = None
    turns: Optional[int] = None
    totalRacesHeld: Optional[int] = None
