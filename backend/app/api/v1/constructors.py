"""
API Router — Constructors
"""

from fastapi import APIRouter, HTTPException, Query
from app.services import constructor_service

router = APIRouter(prefix="/constructors", tags=["Constructors"])


@router.get("")
def list_constructors(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return a paginated list of F1 constructors."""
    data = constructor_service.get_all_constructors(limit=limit, offset=offset)
    return {"total": len(data), "limit": limit, "offset": offset, "constructors": data}


@router.get("/{constructor_id}")
def get_constructor(constructor_id: str):
    """Return details for a single constructor."""
    data = constructor_service.get_constructor_by_id(constructor_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Constructor '{constructor_id}' not found")
    return data
