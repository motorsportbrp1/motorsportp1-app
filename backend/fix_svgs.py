import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = "f1-media"
MEDIA_DIR = "./media"

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

for root, dirs, files in os.walk(MEDIA_DIR):
    for file in files:
        if file.lower().endswith('.svg'):
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, MEDIA_DIR).replace("\\", "/")
            
            content_type = "image/svg+xml"
            print(f"Re-uploading {relative_path} with type {content_type}...")
            
            with open(local_path, "rb") as f:
                try:
                    res = supabase.storage.from_(BUCKET_NAME).update(
                        path=relative_path,
                        file=f,
                        file_options={
                            "cacheControl": "3600", 
                            "upsert": "true",
                            "content-type": content_type,
                            "contentType": content_type
                        }
                    )
                    print(f"✅ {relative_path} salvo com Content-Type corrigido!")
                except Exception as e:
                    print(f"❌ Erro ao subir {relative_path}: {e}")
