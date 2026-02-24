import asyncio
from app.core.fastf1_client import get_fastf1_session
from app.services.session_service import clean_data
import pandas as pd

def get_best_sectors(year, round, session_name):
    session = get_fastf1_session(year, round, session_name)
    laps = session.laps
    if laps.empty: return []
    
    # overall bests
    best_s1 = laps['Sector1Time'].dt.total_seconds().min()
    best_s2 = laps['Sector2Time'].dt.total_seconds().min()
    best_s3 = laps['Sector3Time'].dt.total_seconds().min()
    
    results = []
    drivers = pd.unique(laps['Driver'])
    
    for drv in drivers:
        drv_laps = laps.pick_drivers(drv)
        fastest = drv_laps.pick_fastest()
        if getattr(fastest, "isna", lambda: True)().all() or pd.isna(fastest['LapTime']):
            continue
            
        # Get personal bests
        pb_s1 = drv_laps['Sector1Time'].dt.total_seconds().min()
        pb_s2 = drv_laps['Sector2Time'].dt.total_seconds().min()
        pb_s3 = drv_laps['Sector3Time'].dt.total_seconds().min()
        
        # Current lap sectors
        s1 = fastest['Sector1Time'].total_seconds() if pd.notna(fastest['Sector1Time']) else None
        s2 = fastest['Sector2Time'].total_seconds() if pd.notna(fastest['Sector2Time']) else None
        s3 = fastest['Sector3Time'].total_seconds() if pd.notna(fastest['Sector3Time']) else None
        
        def get_color(val, pb, overall):
            if not val: return 0 # No data (gray/yellow)
            if round(val, 3) <= round(overall, 3): return 2 # Purple
            if round(val, 3) <= round(pb, 3): return 1 # Green (PB)
            return 0 # Yellow (slower)
            
        results.append({
            "driver": drv,
            "s1": s1,
            "s1_color": get_color(s1, pb_s1, best_s1),
            "s2": s2,
            "s2_color": get_color(s2, pb_s2, best_s2),
            "s3": s3,
            "s3_color": get_color(s3, pb_s3, best_s3),
        })
        
    return clean_data(results)

res = get_best_sectors(2021, 22, "Q")
for r in res[:5]:
    print(r['driver'], "S1:", r['s1_color'], "S2:", r['s2_color'], "S3:", r['s3_color'])
