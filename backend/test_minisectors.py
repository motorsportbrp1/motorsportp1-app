import asyncio
from app.services.session_service import clean_data
from app.core.fastf1_client import get_fastf1_session
import pandas as pd
import numpy as np

def get_minisectors(year: int, round: int, session_name: str, num_minisectors: int = 25):
    import logging
    logger = logging.getLogger(__name__)
    try:
        session = get_fastf1_session(year, round, session_name)
        
        # Load telemetry
        laps = session.laps
        if laps.empty:
            return []

        drivers = pd.unique(laps['Driver'])
        
        telemetry_list = []
        for drv in drivers:
            drv_laps = laps.pick_drivers(drv)
            fastest_lap = drv_laps.pick_fastest()
            if getattr(fastest_lap, "isna", lambda: True)().all():
                continue
            
            try:
                tel = fastest_lap.get_telemetry()
                tel['Driver'] = drv
                telemetry_list.append(tel)
            except Exception as e:
                logger.warning(f"Could not load telemetry for {drv}: {e}")
                
        if not telemetry_list:
            return []
            
        telemetry = pd.concat(telemetry_list)
        
        total_distance = telemetry['Distance'].max()
        minisector_length = total_distance / num_minisectors
        
        telemetry['Minisector'] = telemetry['Distance'].apply(
            lambda dist: int((dist // minisector_length) + 1)
        )
        
        # Calculate max average speed
        tel_data = telemetry[['Driver', 'Minisector', 'Speed', 'X', 'Y']]
        pace = tel_data.groupby(['Minisector', 'Driver'])['Speed'].mean().reset_index()
        
        fastest_drivers = pace.loc[pace.groupby('Minisector')['Speed'].idxmax()]
        fastest_drivers_map = fastest_drivers.set_index('Minisector')['Driver'].to_dict()
        
        abs_fastest = laps.pick_fastest()
        ref_tel = abs_fastest.get_telemetry()
        ref_tel['Minisector'] = ref_tel['Distance'].apply(
             lambda dist: int((dist // minisector_length) + 1)
        )
        
        segments = []
        for minisector_id in sorted(ref_tel['Minisector'].unique()):
            fastest_driver = fastest_drivers_map.get(minisector_id)
            if not fastest_driver:
                continue
                
            ms_tel = ref_tel[ref_tel['Minisector'] == minisector_id]
            # Convert X,Y to points array
            points = ms_tel[['X', 'Y']].values.tolist()
            
            segments.append({
                "minisector": int(minisector_id),
                "fastest_driver": str(fastest_driver),
                "points": points
            })
            
        return clean_data(segments)
        
    except Exception as e:
        logger.error(f"Error in get_minisectors for {year} R{round} {session_name}: {e}")
        return []

def run():
    print("Fetching minisectors...")
    res = get_minisectors(2021, 22, "R")
    print(f"Got {len(res)} minisectors.")
    if len(res) > 0:
        print("M1:", res[0]['minisector'], "Driver:", res[0]['fastest_driver'], "Pts:", len(res[0]['points']))
        print("M2:", res[1]['minisector'], "Driver:", res[1]['fastest_driver'], "Pts:", len(res[1]['points']))

run()
