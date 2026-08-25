import time
from typing import Optional, Dict, Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.cache import league_cache, standings_cache
from app.models.match import League, Match, Team
from app.schemas.schemas import LeagueOut, StandingsOut, StandingEntry, TeamOut
from app.services import football_api

router = APIRouter(prefix="/api/leagues", tags=["leagues"])


@router.get("/", response_model=list[LeagueOut])
def get_leagues(response: Response, db: Session = Depends(get_db)):
    cached = league_cache.get("all_leagues")
    if cached is not None:
        response.headers["Cache-Control"] = "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
        return cached

    res = db.query(League).filter(League.is_active == True).all()
    league_cache.set("all_leagues", res, ttl=180.0)
    response.headers["Cache-Control"] = "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
    return res


@router.get("/{code}", response_model=LeagueOut)
def get_league(code: str, db: Session = Depends(get_db)):
    cached = league_cache.get(f"league_{code.upper()}")
    if cached is not None:
        return cached

    league = db.query(League).filter(League.code == code.upper()).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    league_cache.set(f"league_{code.upper()}", league, ttl=300.0)
    return league


@router.get("/{code}/standings")
async def get_standings(code: str, response: Response):
    """Proxy standings with bounded in-memory caching."""
    cache_key = f"standings_{code.upper()}"
    cached = standings_cache.get(cache_key)
    if cached is not None:
        response.headers["Cache-Control"] = "public, max-age=120, s-maxage=300, stale-while-revalidate=600"
        return cached

    try:
        data = await football_api.get_standings(code.upper())
        if data and not data.get("error"):
            standings_cache.set(cache_key, data, ttl=300.0)
            response.headers["Cache-Control"] = "public, max-age=120, s-maxage=300, stale-while-revalidate=600"
        return data
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch standings: {e}")


@router.get("/{code}/matches")
def get_league_matches(
    code: str,
    status: str = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.code == code.upper()).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    q = db.query(Match).filter(Match.league_id == league.id)
    if status:
        q = q.filter(Match.status == status)
    q = q.order_by(Match.utc_date.asc())
    return q.offset(skip).limit(min(limit, 50)).all()
