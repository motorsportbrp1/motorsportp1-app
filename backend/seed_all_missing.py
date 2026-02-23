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
    if not url or not key:
        print("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY nÃ£o encontrados no .env")
        exit(1)
    return create_client(url, key)

def process_and_upload(supabase: Client):
    with open("tables_list_reseed.json", "r") as f:
        tables_order = json.load(f)
        
    print(f"Encontradas {len(tables_order)} novas tabelas baseadas nos CSVs restantes.")
    
    for item in tables_order:
        csv_file = os.path.join(DATA_DIR, item["csv"])
        table_name = item["table"]
        
        if not os.path.exists(csv_file):
            continue
            
        print(f"🚀 Subindo {table_name}...")
        
        df = pd.read_csv(csv_file, low_memory=False)
        df.columns = df.columns.str.lower()
        df = df.convert_dtypes()
        df = df.replace({pd.NA: None, float('nan'): None})
        
        records = df.to_dict(orient="records")
        total_records = len(records)
        
        chunk_size = 1000
        for i in range(0, total_records, chunk_size):
            chunk = records[i:i+chunk_size]
            try:
                supabase.table(table_name).upsert(chunk).execute()
                print(f"   ⏳ {min(i+chunk_size, total_records)}/{total_records} inseridos...")
            except Exception as e:
                print(f"   ❌ Erro na tabela {table_name}: {e}")
                
        print(f"✅ Tabela {table_name} finalizada!\n")

if __name__ == "__main__":
    supabase = init_supabase()
    process_and_upload(supabase)
