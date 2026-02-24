"""
Service layer for Races.
Queries Supabase for race details, results, and qualifying.

NOTE: PostgreSQL lowercases all unquoted column names,
so we use lowercase identifiers in all queries.
"""

from app.db.supabase_client import get_supabase


def get_race(year: int, round_num: int) -> dict | None:
    """Return a single race by year and round."""
    sb = get_supabase()
    response = (
        sb.table("races")
        .select("*")
        .eq("year", year)
        .eq("round", round_num)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def get_race_results(year: int, round_num: int) -> list[dict]:
    """Return race results ordered by finishing position."""
    sb = get_supabase()

    # First, find the race id
    race = get_race(year, round_num)
    if not race:
        return []

    response = (
        sb.table("results")
        .select("*")
        .eq("raceid", race["id"])
        .order("positiondisplayorder")
        .execute()
    )
    return response.data


def get_qualifying_results(year: int, round_num: int) -> list[dict]:
    """Return qualifying results ordered by position."""
    sb = get_supabase()

    race = get_race(year, round_num)
    if not race:
        return []

    response = (
        sb.table("qualifying")
        .select("*")
        .eq("raceid", race["id"])
        .order("positiondisplayorder")
        .execute()
    )
    return response.data
