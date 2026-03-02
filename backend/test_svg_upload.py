import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = "f1-media"
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

local_path = "./media/tires/pirelli-inter.svg"
relative_path = "tires/pirelli-inter.svg"

with open(local_path, "rb") as f:
    try:
        # Try update first
        res = supabase.storage.from_(BUCKET_NAME).update(
            path=relative_path,
            file=f,
            file_options={
                "cacheControl": "3600", 
                "upsert": "true",
                "content-type": "image/svg+xml",
                "contentType": "image/svg+xml"
            }
        )
        print("Update response:", res)
    except Exception as e:
        print(f"Error updating: {e}")
