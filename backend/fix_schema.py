import os
import glob
import pandas as pd
import json

data_dir = "./data"
sql_file = "./sql_scripts/04_fix_failed_tables.sql"

failed_tables = [
  "races_constructor_standings",
  "races_driver_standings",
  "races_fastest_laps",
  "races_pre_qualifying_results",
  "races_qualifying_1_results",
  "races_qualifying_2_results",
  "races_qualifying_results",
  "races_race_results",
  "races_starting_grid_positions",
  "races_warming_up_results",
  "seasons_constructor_standings",
  "seasons_constructors",
  "seasons_driver_standings",
  "seasons_drivers",
  "seasons_engine_manufacturers"
]

def type_mapping(dtype):
    # Safe fallback: if pandas says it's object or string, it's TEXT
    if pd.api.types.is_object_dtype(dtype) or pd.api.types.is_string_dtype(dtype):
        return 'TEXT'
    if pd.api.types.is_integer_dtype(dtype):
        return 'INTEGER'
    elif pd.api.types.is_float_dtype(dtype):
        return 'NUMERIC'
    elif pd.api.types.is_bool_dtype(dtype):
        return 'BOOLEAN'
    else:
        return 'TEXT'

sql_statements = []
reseed_list = []

for table_name in failed_tables:
    file = os.path.join(data_dir, f"f1db-{table_name.replace('_', '-')}.csv")
    if not os.path.exists(file):
        print(f"File {file} not found.")
        continue
        
    print(f"Corrigindo DDL para {table_name}...")
    try:
        # Read the ENTIRE file to ensure no type mismatch later
        df = pd.read_csv(file, low_memory=False)
    except Exception as e:
        print(f"Erro lendo {file}: {e}")
        continue
        
    columns = []
    for col_name, dtype in df.dtypes.items():
        col_sql_name = col_name.lower()
        col_type = type_mapping(dtype)
        columns.append(f'    "{col_sql_name}" {col_type}')
        
    drop_stmt = f"DROP TABLE IF EXISTS public.{table_name} CASCADE;"
    create_stmt = f"CREATE TABLE public.{table_name} (\n" + ",\n".join(columns) + "\n);"
    
    sql_statements.append(f"{drop_stmt}\n{create_stmt}")
    reseed_list.append({"csv": os.path.basename(file), "table": table_name})

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- Gerado para recriar as tabelas que falharam com tipagem mais segura\n\n")
    f.write("\n\n".join(sql_statements))
    
with open("tables_list_reseed.json", "w") as f:
    json.dump(reseed_list, f, indent=4)

print(f"✅ Arquivo {sql_file} gerado para consertar {len(failed_tables)} tabelas.")
