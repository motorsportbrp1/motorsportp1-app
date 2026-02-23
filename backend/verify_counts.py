import os
import json
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

DATA_DIR = "./data"

def init_supabase() -> Client:
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

def verify():
    supabase = init_supabase()
    with open("tables_list.json", "r") as f:
        tables_order = json.load(f)

    report = {}
    for item in tables_order:
        csv_file = os.path.join(DATA_DIR, item["csv"])
        table_name = item["table"]
        if not os.path.exists(csv_file):
            continue
            
        df = pd.read_csv(csv_file, low_memory=False)
        csv_count = len(df)
        
        try:
            res = supabase.from_(table_name).select("*", count="exact", head=True).execute()
            db_count = res.count
            report[table_name] = {"csv": csv_count, "db": db_count, "status": "OK" if csv_count == db_count else "FAILED"}
        except Exception as e:
            report[table_name] = {"csv": csv_count, "db": 0, "status": f"ERROR: {e}"}

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    verify()
