"""Pydantic schemas for Season-related API responses."""

from pydantic import BaseModel
from typing import Optional


class SeasonOut(BaseModel):
    """A single F1 season."""
    year: int


class SeasonWithStatsOut(BaseModel):
    """Season enriched with race count."""
    year: int
    total_races: int = 0
