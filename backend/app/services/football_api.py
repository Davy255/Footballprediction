import httpx
import asyncio
from typing import Optional
from app.core.config import settings

BASE_URL = settings.FOOTBALL_DATA_BASE_URL
HEADERS = {"X-Auth-Token": settings.FOOTBALL_DATA_API_KEY}


async def _get(path: str, params: dict = None) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{BASE_URL}{path}", headers=HEADERS, params=params)
        resp.raise_for_status()
        return resp.json()


async def get_competitions() -> dict:
    return await _get("/competitions")


async def get_standings(competition_code: str) -> dict:
    return await _get(f"/competitions/{competition_code}/standings")


async def get_matches(
    competition_code: str,
    status: Optional[str] = None,
    matchday: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict:
    params = {}
    if status:
        params["status"] = status
    if matchday:
        params["matchday"] = matchday
    if date_from:
        params["dateFrom"] = date_from
    if date_to:
        params["dateTo"] = date_to
    return await _get(f"/competitions/{competition_code}/matches", params=params)


async def get_season_matches(competition_code: str, season_year: int) -> dict:
    """Fetch ALL matches for a competition in a given season year (e.g. 2026 for 2026/27).
    football-data.org uses the start year of the season as the season identifier."""
    params = {"season": str(season_year)}
    return await _get(f"/competitions/{competition_code}/matches", params=params)


async def get_match(match_id: int) -> dict:
    return await _get(f"/matches/{match_id}")


# Fix 8: Use correct v4 status values. "PAUSED" is not valid in v4.
# Valid statuses: SCHEDULED, TIMED, CANCELLED, POSTPONED, SUSPENDED, IN_PLAY, PAUSED, FINISHED, AWARDED
# For live polling use: LIVE,IN_PLAY,PAUSED (PAUSED IS valid in v4 for half-time)
async def get_live_matches() -> dict:
    return await _get("/matches", params={"status": "IN_PLAY,PAUSED"})


async def get_todays_matches() -> dict:
    from datetime import date
    today = date.today().isoformat()
    return await _get("/matches", params={"dateFrom": today, "dateTo": today})


async def get_team(team_id: int) -> dict:
    return await _get(f"/teams/{team_id}")
