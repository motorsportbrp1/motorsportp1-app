"""
Service layer for Circuits.
Queries Supabase for circuit listings and details.
"""

from app.db.supabase_client import get_supabase


def get_all_circuits() -> list[dict]:
    """Return all circuits ordered by name."""
    sb = get_supabase()
    response = sb.table("circuits").select("*").order("name").execute()
    return response.data


def get_circuit_by_id(circuit_id: str) -> dict | None:
    """Return a single circuit by id."""
    sb = get_supabase()
    response = (
        sb.table("circuits")
        .select("*")
        .eq("id", circuit_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None
