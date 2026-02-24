"""
Aggregates all v1 routers into a single router for the main app.
"""

from fastapi import APIRouter
from app.api.v1.seasons import router as seasons_router
from app.api.v1.drivers import router as drivers_router
from app.api.v1.circuits import router as circuits_router
from app.api.v1.constructors import router as constructors_router
from app.api.v1.races import router as races_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.jobs import router as jobs_router

v1_router = APIRouter()

v1_router.include_router(seasons_router)
v1_router.include_router(drivers_router)
v1_router.include_router(circuits_router)
v1_router.include_router(constructors_router)
v1_router.include_router(races_router)
v1_router.include_router(sessions_router)
v1_router.include_router(telemetry_router)
v1_router.include_router(jobs_router)
