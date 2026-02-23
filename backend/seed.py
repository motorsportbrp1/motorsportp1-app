import os
import urllib.request
import zipfile
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Configurações iniciais
DATA_DIR = "./data"
ZIP_URL = "https://github.com/f1db/f1db/releases/download/v2026.0.0/f1db-csv.zip"
ZIP_PATH = os.path.join(DATA_DIR, "f1db-csv.zip")

# Ordem de inserção para respeitar as chaves estrangeiras (Foreign Keys)
TABLES_ORDER = [
    {"csv": "f1db-circuits.csv", "table": "circuits"},
    {"csv": "f1db-constructors.csv", "table": "constructors"},
    {"csv": "f1db-drivers.csv", "table": "drivers"},
    {"csv": "f1db-seasons.csv", "table": "seasons"},
    {"csv": "f1db-races.csv", "table": "races"},
    {"csv": "f1db-races-qualifying-results.csv", "table": "qualifying"},
    {"csv": "f1db-races-race-results.csv", "table": "results"},
    {"csv": "f1db-races-sprint-race-results.csv", "table": "sprint_results"},
    {"csv": "f1db-races-constructor-standings.csv", "table": "constructor_standings"},
    {"csv": "f1db-races-driver-standings.csv", "table": "driver_standings"},
    {"csv": "f1db-races-fastest-laps.csv", "table": "lap_times"},
    {"csv": "f1db-races-pit-stops.csv", "table": "pit_stops"}
]

def init_supabase() -> Client:
    load_dotenv()
    url: str = os.getenv("SUPABASE_URL")
    key: str = os.getenv("SUPABASE_KEY")
    if not url or not key:
        print("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY não encontrados no arquivo .env")
        exit(1)
    return create_client(url, key)

def download_and_extract_data():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    if not os.path.exists(ZIP_PATH):
        print(f"📥 Baixando base de dados F1 de {ZIP_URL}...")
        urllib.request.urlretrieve(ZIP_URL, ZIP_PATH)
        print("✅ Download concluído.")
    
    print("📦 Extraindo arquivos...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
        zip_ref.extractall(DATA_DIR)
    print("✅ Extração concluída.")

def process_and_upload(supabase: Client):
    for item in TABLES_ORDER:
        csv_file = os.path.join(DATA_DIR, item["csv"])
        table_name = item["table"]
        
        if not os.path.exists(csv_file):
            print(f"⚠️ Atenção: {csv_file} não encontrado. Pulando...")
            continue
            
        print(f"🚀 Iniciando upload para tabela: {table_name}")
        
        # Lê o CSV padrão (F1DB usa campos vazios em vez de \N). low_memory evita warnings de mixed types.
        df = pd.read_csv(csv_file, low_memory=False)
        
        # Converte para minúsculo pois no PostgreSQL as colunas não-entre-aspas viram lowercase
        df.columns = df.columns.str.lower()
        
        # Converte para os melhores tipos (o Int64 permite inteiros com valores vazios, evitando virar float 469.0)
        df = df.convert_dtypes()
        
        # Substitui pd.NA e NaN por None real para o JSON aceitar campos nulos
        df = df.replace({pd.NA: None, float('nan'): None})
        
        records = df.to_dict(orient="records")
        total_records = len(records)
        print(f"📊 {total_records} registros carregados do CSV. Subindo para o Supabase em pedaços...")
        
        # Envia em chunks para evitar timeout na API do Supabase
        chunk_size = 1000
        for i in range(0, total_records, chunk_size):
            chunk = records[i:i+chunk_size]
            try:
                # Usa upsert para não dar erro se tentar rodar novamente
                supabase.table(table_name).upsert(chunk).execute()
                print(f"   ⏳ {min(i+chunk_size, total_records)}/{total_records} inseridos...")
            except Exception as e:
                print(f"   ❌ Erro no bloco {i} a {i+chunk_size} na tabela {table_name}: {e}")
                
        print(f"✅ Tabela {table_name} finalizada!\n")

def main():
    print("🏎️  Motorsport P1 - Inicializando Carga Histórica da F1  🏎️\n")
    supabase = init_supabase()
    # download_and_extract_data() # Already downloaded
    process_and_upload(supabase)
    print("🎉 Setup e Extração Finalizados!")

if __name__ == "__main__":
    main()
