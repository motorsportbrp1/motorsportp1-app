"""
Service layer for Seasons.
Queries Supabase for season data, race calendars, and standings.

NOTE: PostgreSQL lowercases all unquoted column names,
so we use lowercase identifiers in all queries.
"""

from app.db.supabase_client import get_supabase


def get_all_seasons() -> list[dict]:
    """Return all seasons ordered by year descending."""
    sb = get_supabase()
    response = sb.table("seasons").select("*").order("year", desc=True).execute()
    return response.data


def get_season_races(year: int) -> list[dict]:
    """Return all races for a given season year, ordered by round."""
    sb = get_supabase()
    response = (
        sb.table("races")
        .select("*")
        .eq("year", year)
        .order("round")
        .execute()
    )
    return response.data


def get_season_driver_standings(year: int) -> list[dict]:
    """
    Return the final driver standings for a season.
    We get the standings from the last round of that year.
    """
    sb = get_supabase()

    # First, find the last round of the season
    races_resp = (
        sb.table("races")
        .select("id, round")
        .eq("year", year)
        .order("round", desc=True)
        .limit(1)
        .execute()
    )

    if not races_resp.data:
        return []

    last_race_id = races_resp.data[0]["id"]

    # Now get driver standings for that race
    standings_resp = (
        sb.table("driver_standings")
        .select("*")
        .eq("raceid", last_race_id)
        .order("positionnumber")
        .execute()
    )
    return standings_resp.data


def get_season_constructor_standings(year: int) -> list[dict]:
    """
    Return the final constructor standings for a season.
    We get the standings from the last round of that year.
    """
    sb = get_supabase()

    # First, find the last round of the season
    races_resp = (
        sb.table("races")
        .select("id, round")
        .eq("year", year)
        .order("round", desc=True)
        .limit(1)
        .execute()
    )

    if not races_resp.data:
        return []

    last_race_id = races_resp.data[0]["id"]

    # Now get constructor standings for that race
    standings_resp = (
        sb.table("constructor_standings")
        .select("*")
        .eq("raceid", last_race_id)
        .order("positionnumber")
        .execute()
    )
    return standings_resp.data
