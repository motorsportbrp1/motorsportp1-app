"""
Service layer for Drivers.
Queries Supabase for driver listings, profiles and race history.
"""

from app.db.supabase_client import get_supabase


def get_all_drivers(limit: int = 50, offset: int = 0, search: str | None = None) -> list[dict]:
    """Return drivers with pagination and optional search."""
    sb = get_supabase()
    query = sb.table("drivers").select("*")

    if search:
        query = query.ilike("fullname", f"%{search}%")

    response = (
        query
        .order("fullname")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data


def get_driver_by_id(driver_id: str) -> dict | None:
    """Return a single driver by id."""
    sb = get_supabase()
    response = (
        sb.table("drivers")
        .select("*")
        .eq("id", driver_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def get_driver_results(driver_id: str, year: int | None = None) -> list[dict]:
    """Return race results for a driver, optionally filtered by year."""
    sb = get_supabase()
    query = (
        sb.table("results")
        .select("*")
        .eq("driverid", driver_id)
    )

    if year:
        query = query.eq("year", year)

    response = query.order("year", desc=True).order("round").execute()
    return response.data


def get_drivers_count(search: str | None = None) -> int:
    """Return total count of drivers (for pagination)."""
    sb = get_supabase()
    query = sb.table("drivers").select("id", count="exact")

    if search:
        query = query.ilike("fullname", f"%{search}%")

    response = query.execute()
    return response.count or 0
