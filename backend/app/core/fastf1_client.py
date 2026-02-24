import os
import fastf1
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Ensure Cache Directory exists
if not os.path.exists(settings.FASTF1_CACHE_DIR):
    os.makedirs(settings.FASTF1_CACHE_DIR)

# Enable Cache
fastf1.Cache.enable_cache(settings.FASTF1_CACHE_DIR)

def get_fastf1_session(year: int, round: int, session_type: str):
    """
    Safely load a FastF1 session.
    session_type: 'FP1', 'FP2', 'FP3', 'Q', 'S', 'SQ', 'R'
    """
    if year < 2018:
        raise ValueError(f"FastF1 does not support detailed telemetry for year {year}")
    
    logger.info(f"Loading FastF1 Data: {year} R{round} {session_type}")
    
    try:
        session = fastf1.get_session(year, round, session_type)
        session.load(telemetry=True, laps=True, weather=True)
        return session
    except Exception as e:
        logger.error(f"Failed to load FastF1 session {year} R{round} {session_type}: {e}")
        raise e
