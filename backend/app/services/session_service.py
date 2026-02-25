import pandas as pd
import numpy as np
from app.core.fastf1_client import get_fastf1_session
from typing import List, Dict, Any
import logging
from app.db.supabase_client import get_supabase
import json

logger = logging.getLogger(__name__)


def get_cached_data(year: int, round: int, session_name: str, data_type: str):
    try:
        supabase = get_supabase()
        response = supabase.table('fastf1_cache').select('data').eq('year', year).eq('round', round).eq('session_name', session_name).eq('data_type', data_type).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]['data']
    except Exception as e:
        logger.error(f"Cache read error: {e}")
    return None

def set_cached_data(year: int, round: int, session_name: str, data_type: str, data: Any):
    try:
        supabase = get_supabase()
        # Clean data before save
        clean = clean_data(data)
        supabase.table('fastf1_cache').upsert({
            'year': year,
            'round': round,
            'session_name': session_name,
            'data_type': data_type,
            'data': clean
        }, on_conflict='year, round, session_name, data_type').execute()
    except Exception as e:
        logger.error(f"Cache write error: {e}")


def clean_data(val):
    """Recursively clean NaNs/NaTs/Infs from data structures so they can be JSON serialized."""
    if isinstance(val, dict):
        return {k: clean_data(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [clean_data(v) for v in val]
    elif pd.isna(val) or val is pd.NaT:
        return None
    elif isinstance(val, float) and (np.isinf(val) or np.isnan(val)):
        return None
    elif isinstance(val, (pd.Timedelta)):
        return val.total_seconds()
    elif isinstance(val, (int, float, str, bool)):
        return val
    # Try to convert other formats
    try:
        return float(val) if 'float' in str(type(val)) else str(val)
    except:
        return str(val)

def get_stints(year: int, round: int, session_name: str, session=None) -> List[Dict[str, Any]]:
    """
    Get all tyre stints for a specific session.
    Returns: list of dicts with driver, stint number, compound, laps, and stint_time
    """
    cached = get_cached_data(year, round, session_name, 'stints')
    if cached is not None:
        return cached

    try:
        session = session or get_fastf1_session(year, round, session_name)
        laps = session.laps
        
        if laps.empty:
            return []
            
        stints = laps[["Driver", "Stint", "Compound", "TyreLife", "LapTime"]].copy()
        
        # Calculate stint average times for valid laps (filtering in/out laps or outliers)
        # Convert LapTime to seconds for averaging
        stints['LapTimeSec'] = stints['LapTime'].dt.total_seconds()
        
        results = []
        # Group by Driver and Stint
        for (driver, stint_num), group in stints.groupby(["Driver", "Stint"]):
            if group.empty:
                continue
                
            valid_laps = group.dropna(subset=['LapTimeSec'])
            avg_time = None
            if not valid_laps.empty:
                # Basic outlier removal: remove laps > 107% of the driver's fastest valid lap in this stint
                min_lap = valid_laps['LapTimeSec'].min()
                filtered_laps = valid_laps[valid_laps['LapTimeSec'] <= min_lap * 1.07]
                
                # Only calculate pace for stints longer than 3 laps (Long Run Pace)
                if len(filtered_laps) > 3:
                    avg_time = filtered_laps['LapTimeSec'].mean()
            
            compound = group['Compound'].iloc[0] if not pd.isna(group['Compound'].iloc[0]) else "UNKNOWN"
            total_laps = len(group)
            
            results.append({
                "driver": driver,
                "stint": int(stint_num) if not pd.isna(stint_num) else 1,
                "compound": str(compound),
                "laps": total_laps,
                "avg_lap_time": float(avg_time) if avg_time else None
            })
            
        clean_res = clean_data(results)
        set_cached_data(year, round, session_name, 'stints', clean_res)
        return clean_res
    except Exception as e:
        logger.error(f"Error in get_stints for {year} R{round} {session_name}: {e}")
        return []

def get_all_laps(year: int, round: int, session_name: str) -> List[Dict[str, Any]]:
    """
    Get all laps for all drivers to plot on a Scatter chart (LapTime vs LapNumber).
    """
    cached = get_cached_data(year, round, session_name, 'all_laps')
    if cached is not None:
        return cached

    try:
        session = get_fastf1_session(year, round, session_name)
        laps = session.laps
        
        if laps.empty:
            return []
            
        # Select required columns
        df = laps[["Driver", "LapNumber", "LapTime", "Compound", "Stint", "IsPersonalBest"]].copy()
        
        # Convert Timedelta to seconds
        df['LapTimeSec'] = df['LapTime'].dt.total_seconds()
        
        # Drop rows with NaT LapTime
        df = df.dropna(subset=['LapTimeSec'])
        
        # Convert to list of dicts
        records = df.to_dict(orient="records")
        clean_res = clean_data(records)
        set_cached_data(year, round, session_name, 'all_laps', clean_res)
        return clean_res
    except Exception as e:
        logger.error(f"Error in get_all_laps for {year} R{round} {session_name}: {e}")
        return []

def get_speed_traps(year: int, round: int, session_name: str, session=None) -> List[Dict[str, Any]]:
    """
    Get the top speeds for all drivers in S1, S2, S3, and SpeedTrap.
    Returns: max speeds per driver
    """
    cached = get_cached_data(year, round, session_name, 'speed_traps')
    if cached is not None:
        return cached

    try:
        session = session or get_fastf1_session(year, round, session_name)
        laps = session.laps
        
        if laps.empty:
            return []
            
        results = []
        for driver in laps['Driver'].unique():
            driver_laps = laps.pick_drivers(driver)
            
            # FastF1 lap data has: SpeedI1, SpeedI2, SpeedFL, SpeedST (Speed Trap)
            max_st = float(driver_laps['SpeedST'].max()) if 'SpeedST' in driver_laps and not driver_laps['SpeedST'].isna().all() else None
            max_s1 = float(driver_laps['SpeedI1'].max()) if 'SpeedI1' in driver_laps and not driver_laps['SpeedI1'].isna().all() else None
            max_s2 = float(driver_laps['SpeedI2'].max()) if 'SpeedI2' in driver_laps and not driver_laps['SpeedI2'].isna().all() else None
            max_fl = float(driver_laps['SpeedFL'].max()) if 'SpeedFL' in driver_laps and not driver_laps['SpeedFL'].isna().all() else None
            
            # Find the best valid lap time to order them
            best_lap = driver_laps.pick_fastest()
            top_speed = max_st or max_fl or max_s2 or max_s1
            
            if top_speed:
                results.append({
                    "driver": driver,
                    "top_speed": top_speed,
                    "SpeedST": max_st,
                    "SpeedI1": max_s1,
                    "SpeedI2": max_s2,
                    "SpeedFL": max_fl
                })
                
        # Sort by top_speed descending
        results = sorted([r for r in results if r['top_speed']], key=lambda x: x['top_speed'], reverse=True)
        clean_res = clean_data(results)
        set_cached_data(year, round, session_name, 'speed_traps', clean_res)
        return clean_res
    except Exception as e:
        logger.error(f"Error in get_speed_traps for {year} R{round} {session_name}: {e}")
        return []

def get_minisectors(year: int, round: int, session_name: str, num_minisectors: int = 3, session=None) -> List[Dict[str, Any]]:
    """
    Get the fastest driver for S1, S2, and S3 track segments based on telemetry and best sectors.
    Returns: list of 3 sectors with X, Y points and fastest driver abbreviation.
    """
    cached = get_cached_data(year, round, session_name, 'minisectors')
    if cached is not None:
        return cached

    try:
        session = session or get_fastf1_session(year, round, session_name)
        laps = session.laps
        if laps.empty:
            return []

        # Find fastest driver per sector using get_best_sectors
        best_sectors = get_best_sectors(year, round, session_name, session=session)
        if not best_sectors:
            return []
            
        valid_s1 = [d for d in best_sectors if d['s1'] is not None]
        valid_s2 = [d for d in best_sectors if d['s2'] is not None]
        valid_s3 = [d for d in best_sectors if d['s3'] is not None]
        
        fastest_s1 = min(valid_s1, key=lambda x: x['s1'])['driver'] if valid_s1 else 'Unknown'
        fastest_s2 = min(valid_s2, key=lambda x: x['s2'])['driver'] if valid_s2 else 'Unknown'
        fastest_s3 = min(valid_s3, key=lambda x: x['s3'])['driver'] if valid_s3 else 'Unknown'
        
        fastest_drivers_map = {1: fastest_s1, 2: fastest_s2, 3: fastest_s3}
        
        # Get track geometry from absolute fastest lap
        abs_fastest = laps.pick_fastest()
        if abs_fastest is None or pd.isna(abs_fastest.get('LapTime')):
            return []
            
        ref_tel = abs_fastest.get_telemetry()
        
        s1_time = abs_fastest['Sector1SessionTime']
        s2_time = abs_fastest['Sector2SessionTime']
        
        def assign_sector(t):
            if pd.isna(s1_time) or t <= s1_time: return 1
            if pd.isna(s2_time) or t <= s2_time: return 2
            return 3
            
        ref_tel['Minisector'] = ref_tel['SessionTime'].apply(assign_sector)
        
        segments = []
        for sector_id in [1, 2, 3]:
            fastest_driver = fastest_drivers_map.get(sector_id)
            if not fastest_driver or fastest_driver == 'Unknown':
                continue
                
            ms_tel = ref_tel[ref_tel['Minisector'] == sector_id]
            if ms_tel.empty:
                continue
                
            # Convert X,Y to points array
            points = ms_tel[['X', 'Y']].values.tolist()
            
            segments.append({
                "minisector": int(sector_id),
                "fastest_driver": str(fastest_driver),
                "points": points
            })
            
        clean_res = clean_data(segments)
        set_cached_data(year, round, session_name, 'minisectors', clean_res)
        return clean_res
        
    except Exception as e:
        logger.error(f"Error in get_minisectors for {year} R{round} {session_name}: {e}")
        return []

def get_best_sectors(year: int, round_num: int, session_name: str, session=None) -> List[Dict[str, Any]]:
    """
    Get the fastest driver for each sector and judge personal performance.
    Colors: 2 = Purple (Fastest in Session), 1 = Green (Personal Best), 0 = Yellow (Slower).
    """
    cached = get_cached_data(year, round_num, session_name, 'best_sectors')
    if cached is not None:
        return cached

    try:
        session = session or get_fastf1_session(year, round_num, session_name)
        laps = session.laps
        if laps.empty:
            return []

        # Overall session bests (Purple)
        best_s1 = laps['Sector1Time'].dt.total_seconds().min()
        best_s2 = laps['Sector2Time'].dt.total_seconds().min()
        best_s3 = laps['Sector3Time'].dt.total_seconds().min()

        results = []
        drivers = pd.unique(laps['Driver'])

        for drv in drivers:
            drv_laps = laps.pick_drivers(drv)
            fastest_lap = drv_laps.pick_fastest()
            
            # Check if lap has a valid time
            if fastest_lap is None or pd.isna(fastest_lap.get('LapTime')):
                continue

            # Personal bests for this driver in this session (Green)
            pb_s1 = drv_laps['Sector1Time'].dt.total_seconds().min()
            pb_s2 = drv_laps['Sector2Time'].dt.total_seconds().min()
            pb_s3 = drv_laps['Sector3Time'].dt.total_seconds().min()

            # Sectors on their specific fastest lap
            s1 = fastest_lap['Sector1Time'].total_seconds() if pd.notna(fastest_lap['Sector1Time']) else None
            s2 = fastest_lap['Sector2Time'].total_seconds() if pd.notna(fastest_lap['Sector2Time']) else None
            s3 = fastest_lap['Sector3Time'].total_seconds() if pd.notna(fastest_lap['Sector3Time']) else None

            def classify_sector(val, pb, overall):
                if val is None or pd.isna(val): return 0
                # Compare with a small epsilon for float precision
                if val <= overall + 0.001: return 2 # Purple
                if val <= pb + 0.001: return 1     # Green
                return 0                            # Yellow

            results.append({
                "driver": drv,
                "s1": s1,
                "s1_color": classify_sector(s1, pb_s1, best_s1),
                "s2": s2,
                "s2_color": classify_sector(s2, pb_s2, best_s2),
                "s3": s3,
                "s3_color": classify_sector(s3, pb_s3, best_s3),
            })

        clean_res = clean_data(results)
        set_cached_data(year, round_num, session_name, 'best_sectors', clean_res)
        return clean_res
    except Exception as e:
        logger.error(f"Error in get_best_sectors for {year} R{round_num} {session_name}: {e}")
        return []

def get_fastf1_summary_data(year: int, round_num: int, session_name: str) -> Dict[str, Any]:
    """
    Unified method to load FastF1 session ONCE, and calculate all 4 widget data sets.
    """
    # Check if we have all 4 in cache first to skip loading
    stints_cached = get_cached_data(year, round_num, session_name, 'stints')
    speeds_cached = get_cached_data(year, round_num, session_name, 'speed_traps')
    minis_cached = get_cached_data(year, round_num, session_name, 'minisectors')
    best_cached = get_cached_data(year, round_num, session_name, 'best_sectors')
    
    if all(x is not None for x in [stints_cached, speeds_cached, minis_cached, best_cached]):
        return {
            "stints": stints_cached,
            "speed_traps": speeds_cached,
            "minisectors": minis_cached,
            "best_sectors": best_cached
        }
        
    try:
        # Load exactly once
        session = get_fastf1_session(year, round_num, session_name)
        
        # Calculate with the same session
        stints = get_stints(year, round_num, session_name, session=session)
        speeds = get_speed_traps(year, round_num, session_name, session=session)
        minis = get_minisectors(year, round_num, session_name, session=session)
        best = get_best_sectors(year, round_num, session_name, session=session)
        
        return {
            "stints": stints,
            "speed_traps": speeds,
            "minisectors": minis,
            "best_sectors": best
        }
    except Exception as e:
        logger.error(f"Error generating fastf1 summary for {year} R{round_num} {session_name}: {e}")
        return {
            "stints": [],
            "speed_traps": [],
            "minisectors": [],
            "best_sectors": []
        }

