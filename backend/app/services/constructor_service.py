"""
Service layer for Constructors.
Queries Supabase for constructor listings and details.
"""

from app.db.supabase_client import get_supabase


def get_all_constructors(limit: int = 50, offset: int = 0) -> list[dict]:
    """Return constructors with pagination."""
    sb = get_supabase()
    response = (
        sb.table("constructors")
        .select("*")
        .order("name")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data


def get_constructor_by_id(constructor_id: str) -> dict | None:
    """Return a single constructor by id."""
    sb = get_supabase()
    response = (
        sb.table("constructors")
        .select("*")
        .eq("id", constructor_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None
