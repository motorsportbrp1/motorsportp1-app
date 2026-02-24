"""
Application settings loaded from environment variables.
Uses pydantic-settings to validate and type-check all configuration values.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Central configuration for MotorSport P1 Backend."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # FastAPI
    CORS_ORIGINS: str = "http://localhost:3000"

    # FastF1 (Phase 2+)
    FASTF1_CACHE_DIR: str = "./fastf1_cache"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton — reads .env once and reuses the object."""
    return Settings()
