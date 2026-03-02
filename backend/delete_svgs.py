import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = "f1-media"
MEDIA_DIR = "./media"

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

files_to_delete = []

for root, dirs, files in os.walk(MEDIA_DIR):
    for file in files:
        if file.lower().endswith('.svg'):
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, MEDIA_DIR).replace("\\", "/")
            files_to_delete.append(relative_path)

if files_to_delete:
    print(f"Buscando deletar {len(files_to_delete)} arquivos SVG do Supabase...")
    try:
        res = supabase.storage.from_(BUCKET_NAME).remove(files_to_delete)
        print("Arquivos deletados com sucesso:", res)
    except Exception as e:
        print("Erro ao tentar deletar arquivos:", e)
else:
    print("Nenhum arquivo SVG encontrado para deletar.")
