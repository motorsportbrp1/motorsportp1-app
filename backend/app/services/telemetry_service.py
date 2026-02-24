import pandas as pd
import numpy as np
from app.core.fastf1_client import get_fastf1_session
from app.services.session_service import clean_data
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def get_driver_telemetry(year: int, round: int, session_name: str, driver_id: str) -> Dict[str, Any]:
    """
    Get telemetry for a driver's fastest lap in a session.
    Returns: Lap details + telemetry array (Time, Distance, Speed, RPM, Gear, Throttle, Brake, X, Y, Z)
    """
    try:
        session = get_fastf1_session(year, round, session_name)
        laps = session.laps
        
        if laps.empty:
            return {}
            
        driver_laps = laps.pick_drivers(driver_id)
        if driver_laps.empty:
            return {}
            
        fastest_lap = driver_laps.pick_fastest()
        if pd.isna(fastest_lap['LapTime']):
            return {}
            
        telemetry = fastest_lap.get_telemetry()
        
        # Convert Timedelta to seconds for Time
        time_seconds = telemetry['Time'].dt.total_seconds().tolist()
        
        # FastF1 uses 'nGear' instead of 'Gear' in newer versions
        gear_col = 'nGear' if 'nGear' in telemetry else 'Gear'
        
        # Build the response dict
        telemetry_data = {
            "Time": time_seconds,
            "Distance": telemetry['Distance'].tolist(),
            "Speed": telemetry['Speed'].tolist(),
            "RPM": telemetry['RPM'].tolist(),
            "Gear": telemetry[gear_col].tolist(),
            "Throttle": telemetry['Throttle'].tolist(),
            "Brake": telemetry['Brake'].tolist(),
            "X": telemetry['X'].tolist(),
            "Y": telemetry['Y'].tolist(),
            "Z": telemetry['Z'].tolist(),
        }
        
        lap_info = {
            "Driver": driver_id,
            "LapTime": fastest_lap['LapTime'].total_seconds(),
            "Compound": fastest_lap['Compound'],
            "TyreLife": fastest_lap['TyreLife'],
            "Sector1Time": fastest_lap['Sector1Time'].total_seconds() if not pd.isna(fastest_lap['Sector1Time']) else None,
            "Sector2Time": fastest_lap['Sector2Time'].total_seconds() if not pd.isna(fastest_lap['Sector2Time']) else None,
            "Sector3Time": fastest_lap['Sector3Time'].total_seconds() if not pd.isna(fastest_lap['Sector3Time']) else None,
        }
        
        return clean_data({
            "lap_info": lap_info,
            "telemetry": telemetry_data
        })
        
    except Exception as e:
        logger.error(f"Error in get_driver_telemetry for {driver_id} at {year} R{round} {session_name}: {e}")
        return {}


def compare_telemetry(year: int, round: int, session_name: str, driver_1: str, driver_2: str) -> Dict[str, Any]:
    """
    Compare telemetry between two drivers' fastest laps.
    """
    t1 = get_driver_telemetry(year, round, session_name, driver_1)
    t2 = get_driver_telemetry(year, round, session_name, driver_2)
    
    return {
        driver_1: t1,
        driver_2: t2
    }
