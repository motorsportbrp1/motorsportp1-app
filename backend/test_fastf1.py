import fastf1
import os

# Set cache
cache_dir = "./fastf1_cache"
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)
fastf1.Cache.enable_cache(cache_dir)

print("Loading session 2024 Round 1 FP2...")
try:
    session = fastf1.get_session(2024, 1, 'FP2')
    session.load(telemetry=True, laps=True, weather=True)
    print("Session loaded successfully!")
    print(f"Total laps loaded: {len(session.laps)}")
except Exception as e:
    print(f"Error loading session: {e}")
