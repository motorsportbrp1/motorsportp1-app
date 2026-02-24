import re

with open("app/services/session_service.py", "r") as f:
    code = f.read()

# Add imports
if "from app.db.supabase_client import get_supabase" not in code:
    code = code.replace("import logging", "import logging\nfrom app.db.supabase_client import get_supabase\nimport json")

# Add cache helper
cache_helper = """
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
"""

if "def get_cached_data" not in code:
    code = code.replace("def clean_data(val):", cache_helper + "\n\ndef clean_data(val):")

# Cache get_stints
stints_patt = r'(def get_stints.*?:\n\s*""".*?""")\n\s*try:'
stints_repl = r'''\1
    cached = get_cached_data(year, round, session_name, 'stints')
    if cached is not None:
        return cached

    try:'''
code = re.sub(stints_patt, stints_repl, code, flags=re.DOTALL)
code = code.replace("return clean_data(results)", "clean_res = clean_data(results)\n        set_cached_data(year, round, session_name, 'stints', clean_res)\n        return clean_res")

# Cache get_all_laps
laps_patt = r'(def get_all_laps.*?:\n\s*""".*?""")\n\s*try:'
laps_repl = r'''\1
    cached = get_cached_data(year, round, session_name, 'all_laps')
    if cached is not None:
        return cached

    try:'''
code = re.sub(laps_patt, laps_repl, code, flags=re.DOTALL)
code = code.replace("return clean_data(records)", "clean_res = clean_data(records)\n        set_cached_data(year, round, session_name, 'all_laps', clean_res)\n        return clean_res")

# Cache get_speed_traps
traps_patt = r'(def get_speed_traps.*?:\n\s*""".*?""")\n\s*try:'
traps_repl = r'''\1
    cached = get_cached_data(year, round, session_name, 'speed_traps')
    if cached is not None:
        return cached

    try:'''
code = re.sub(traps_patt, traps_repl, code, flags=re.DOTALL)
code = code.replace("results = sorted([r for r in results if r['top_speed']], key=lambda x: x['top_speed'], reverse=True)\n        return clean_data(results)", 
                    "results = sorted([r for r in results if r['top_speed']], key=lambda x: x['top_speed'], reverse=True)\n        clean_res = clean_data(results)\n        set_cached_data(year, round, session_name, 'speed_traps', clean_res)\n        return clean_res")

# Cache get_minisectors
mini_patt = r'(def get_minisectors.*?\n\s*""".*?""")\n\s*try:'
mini_repl = r'''\1
    cached = get_cached_data(year, round, session_name, 'minisectors')
    if cached is not None:
        return cached

    try:'''
code = re.sub(mini_patt, mini_repl, code, flags=re.DOTALL)
code = code.replace("return clean_data(segments)", "clean_res = clean_data(segments)\n        set_cached_data(year, round, session_name, 'minisectors', clean_res)\n        return clean_res")


with open("app/services/session_service.py", "w") as f:
    f.write(code)
    
print("Imports and cache helpers added.")
