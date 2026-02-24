import sys
import os

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.telemetry_service import get_driver_telemetry
import time

print("Starting telemetry fetch test...")
start = time.time()
try:
    data = get_driver_telemetry(2024, 1, 'FP2', 'VER')
    print(f"Fetch completed in {time.time() - start:.2f} seconds!")
    print(f"Data keys: {list(data.keys())}")
    
    if data:
        telemetry = data.get('telemetry', {})
        print(f"Telemetry keys: {list(telemetry.keys())}")
        for k, v in telemetry.items():
            print(f" - {k}: {len(v)} records")
except Exception as e:
    import traceback
    print("Error occurred!")
    traceback.print_exc()
