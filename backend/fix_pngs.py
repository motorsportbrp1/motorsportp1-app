import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
BUCKET_NAME = "f1-media"

tires = [
    "tires/pirelli-soft.png",
    "tires/pirelli-medium.png",
    "tires/pirelli-hard.png",
    "tires/pirelli-inter.png",
    "tires/pirelli-wet.png"
]

for tire in tires:
    local_path = os.path.join(".", "media", tire)
    if not os.path.exists(local_path):
        print(f"File not found: {local_path}")
        continue

    with open(local_path, "rb") as f:
        file_bytes = f.read()

    print(f"Updaing {tire} to image/png...")
    res = supabase.storage.from_(BUCKET_NAME).update(
        tire,
        file_bytes,
        file_options={"content-type": "image/png", "contentType": "image/png"}
    )
    print(f"Updated {tire}: {res}")

print("Done updating PNG tires.")
