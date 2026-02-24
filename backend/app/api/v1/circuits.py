"""
API Router — Circuits
"""

from fastapi import APIRouter, HTTPException
from app.services import circuit_service

router = APIRouter(prefix="/circuits", tags=["Circuits"])


@router.get("")
def list_circuits():
    """Return all F1 circuits."""
    data = circuit_service.get_all_circuits()
    return {"total": len(data), "circuits": data}


@router.get("/{circuit_id}")
def get_circuit(circuit_id: str):
    """Return details for a single circuit."""
    data = circuit_service.get_circuit_by_id(circuit_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Circuit '{circuit_id}' not found")
    return data
