import os
import glob
import pandas as pd
import json

data_dir = "./data"
sql_file = "./sql_scripts/03_extended_schema.sql"
seed_file = "./seed_all.py"

# These tables already exist from 01_schema.sql and 02_results_schema.sql
existing_tables = [
    "circuits", "constructors", "drivers", "seasons", 
    "races", "qualifying", "results", "sprint_results", 
    "constructor_standings", "driver_standings", 
    "lap_times", "pit_stops"
]

def type_mapping(dtype):
    if pd.api.types.is_integer_dtype(dtype):
        return 'INTEGER'
    elif pd.api.types.is_float_dtype(dtype):
        return 'NUMERIC'
    elif pd.api.types.is_bool_dtype(dtype):
        return 'BOOLEAN'
    else:
        return 'TEXT'

sql_statements = []
new_tables_order = []

# Process all csvs
csv_files = glob.glob(os.path.join(data_dir, "f1db-*.csv"))
for file in csv_files:
    filename = os.path.basename(file)
    # The table name is usually derived from the filename: f1db-something.csv -> something
    table_name = filename.replace('f1db-', '').replace('.csv', '').replace('-', '_')
    
    if table_name in existing_tables:
        continue
        
    print(f"Gerando DDL para {table_name}...")
    try:
        df = pd.read_csv(file, low_memory=False, nrows=100)
    except Exception as e:
        print(f"Erro lendo {file}: {e}")
        continue
        
    columns = []
    # Identify a primary key if possible. If 'id' is present, it's a PK.
    # Otherwise, we don't strictly need a PK for simple bulk uploads, but Supabase prefers one.
    
    for col_name, dtype in df.dtypes.items():
        col_sql_name = col_name.lower()
        col_type = type_mapping(dtype)
        
        # If the column is named 'id' or ends with 'id', we make it text generally if it contains strings
        # In F1DB, IDs are mostly string representations like 'monza', 'ferrari'.
        
        columns.append(f'    "{col_sql_name}" {col_type}')
        
    create_stmt = f"CREATE TABLE IF NOT EXISTS public.{table_name} (\n" + ",\n".join(columns) + "\n);"
    sql_statements.append(create_stmt)
    
    new_tables_order.append({"csv": filename, "table": table_name})

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- Gerado automaticamente para as tabelas faltantes do F1DB\n\n")
    f.write("\n\n".join(sql_statements))
    
print(f"✅ {len(new_tables_order)} esquemas gerados em {sql_file}")

# Generate a new seed script snippet that includes all tables
with open("tables_list.json", "w") as f:
    json.dump(new_tables_order, f, indent=4)
