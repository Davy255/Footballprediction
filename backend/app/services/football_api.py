import logging
import asyncio
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("football_api")

BASE_URL = settings.FOOTBALL_DATA_BASE_URL
HEADERS = {"X-Auth-Token": settings.FOOTBALL_DATA_API_KEY}

# Shared async client pool with bounded connections and realistic timeouts
_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(8.0, connect=3.0),
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
            headers=HEADERS,
        )
    return _client


async def _get(path: str, params: dict = None, max_retries: int = 2) -> dict:
    """
    Resilient HTTP GET with controlled retry and exponential backoff.
    Protects against transient 5xx provider failures, rate limits, and network hiccups.
    """
    client = _get_client()
    url = f"{BASE_URL}{path}"
    delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            resp = await client.get(url, params=params)

            # Success
            if resp.status_code == 200:
                return resp.json()

            # Handle 429 Rate Limit
            if resp.status_code == 429:
                retry_after = float(resp.headers.get("Retry-After", delay))
                logger.warning(f"Rate limited (429) by football-data.org on {path}. Backing off {retry_after}s...")
                if attempt < max_retries:
                    await asyncio.sleep(min(retry_after, 2.0))
                    delay *= 2
                    continue
                else:
                    logger.error(f"Rate limit retry exhausted on {path}")
                    return {}

            # Handle Transient Server Errors (500, 502, 503, 504)
            if resp.status_code in (500, 502, 503, 504):
                logger.warning(f"Transient {resp.status_code} error from football provider on {path} (Attempt {attempt+1}/{max_retries+1})")
                if attempt < max_retries:
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                else:
                    logger.error(f"Server error retries exhausted for {path}: HTTP {resp.status_code}")
                    return {}

            # Permanent 4xx Client Errors (400, 401, 403, 404) - Do not retry
            if 400 <= resp.status_code < 500:
                logger.error(f"Client error from football provider on {path}: HTTP {resp.status_code} - {resp.text[:100]}")
                return {}

        except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError) as e:
            logger.warning(f"Network exception on {path}: {type(e).__name__} (Attempt {attempt+1}/{max_retries+1})")
            if attempt < max_retries:
                await asyncio.sleep(delay)
                delay *= 2
                continue
            else:
                logger.error(f"Network error retries exhausted for {path}: {e}")
                return {}
        except Exception as e:
            logger.error(f"Unexpected error in football_api._get for {path}: {e}")
            return {}

    return {}


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


async def get_season_matches(competition_code: str, season_year: int = None) -> dict:
    params = {"season": str(season_year)} if season_year else {}
    try:
        return await _get(f"/competitions/{competition_code}/matches", params=params)
    except Exception as e:
        logger.warning(f"Season {season_year} query failed for {competition_code}, trying active season fallback: {e}")
        return await _get(f"/competitions/{competition_code}/matches")


async def get_match(match_id: int) -> dict:
    return await _get(f"/matches/{match_id}")


async def get_live_matches() -> dict:
    return await _get("/matches", params={"status": "IN_PLAY,PAUSED"})


async def get_todays_matches() -> dict:
    from datetime import date
    today = date.today().isoformat()
    return await _get("/matches", params={"dateFrom": today, "dateTo": today})


async def get_global_matches_window(date_from: str, date_to: str) -> dict:
    """Fetch all matches across all supported competitions in a single API call."""
    return await _get("/matches", params={"dateFrom": date_from, "dateTo": date_to})


async def get_team(team_id: int) -> dict:
    return await _get(f"/teams/{team_id}")
