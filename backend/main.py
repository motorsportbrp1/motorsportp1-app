from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Motorsport P1 — F1 Data API",
    description="REST API serving historical F1 data from Supabase (F1DB 1950–2025).",
    version="1.0.0",
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Motorsport P1 API is running 🏎️"}


# ── API v1 routers ───────────────────────────────────────────
from app.api.v1.router import v1_router  # noqa: E402
from fastapi.staticfiles import StaticFiles

app.include_router(v1_router, prefix="/api/v1")

# ── Static Media ──────────────────────────────────────────────
# Serve local media folder at /media
if os.path.exists("media"):
    app.mount("/media", StaticFiles(directory="media"), name="media")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
