import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# The Bucket Name inside your Supabase project
BUCKET_NAME = "f1-media"

# Local directory where your images are stored, e.g.:
# ./media/drivers/lewis-hamilton/2024.png
# ./media/drivers/lewis-hamilton/2025.png
# ./media/cars/ferrari/2025.png
MEDIA_DIR = "./media"

def init_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

def upload_images():
    supabase = init_supabase()

    if not os.path.exists(MEDIA_DIR):
        print(f"Pasta '{MEDIA_DIR}' nao encontrada.")
        return

    # Loop over all files in the MEDIA_DIR recursively
    uploaded = 0
    for root, dirs, files in os.walk(MEDIA_DIR):
        for file in files:
            # We only care about images
            if not file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')):
                continue

            local_path = os.path.join(root, file)
            # Make the storage path relative to the media folder
            # So ./media/drivers/lewis-hamilton/2025.png => drivers/lewis-hamilton/2025.png
            relative_path = os.path.relpath(local_path, MEDIA_DIR).replace("\\", "/")
            
            print(f"Subindo {relative_path}...")
            
            with open(local_path, "rb") as f:
                # Upsert is True so if you update an image, it replaces it
                try:
                    # Tenta upload (sem upsert) para pular se já existir
                    res = supabase.storage.from_(BUCKET_NAME).upload(
                        path=relative_path,
                        file=f,
                        file_options={"cacheControl": "3600", "upsert": "false"}
                    )
                    uploaded += 1
                    print(f"✅ {relative_path} salvo com sucesso!")
                except Exception as e:
                    # Se o erro for de arquivo já existente, ignoramos e não mostramos erro crítico
                    if "already exists" in str(e).lower() or "duplicado" in str(e).lower():
                        print(f"Skipping {relative_path} - ja existe no banco.")
                    else:
                        print(f"❌ Erro ao subir {relative_path}: {e}")

    print(f"\nFinalizado! {uploaded} novas imagens foram enviadas para o bucket '{BUCKET_NAME}'.")

if __name__ == "__main__":
    upload_images()
