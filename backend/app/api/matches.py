import time
import json
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.match import Match, League, Team
from app.schemas.schemas import MatchOut, LeagueOut
from app.services.ml_predictor import predict_match, get_team_manager

router = APIRouter(prefix="/api/matches", tags=["matches"])

# High-Performance In-Memory Cache with TTL
_cache_store: Dict[str, Tuple[float, Any]] = {}
_PREDICTION_MEM_CACHE: Dict[Tuple[int, int], dict] = {}


def get_from_cache(key: str, ttl_seconds: float = 20.0) -> Optional[Any]:
    if key in _cache_store:
        timestamp, data = _cache_store[key]
        if time.time() - timestamp < ttl_seconds:
            return data
    return None


def set_in_cache(key: str, data: Any):
    _cache_store[key] = (time.time(), data)


def ensure_match_predictions(matches: list[Match], db: Session):
    """Ensures returned matches have AI prediction fields populated with sub-millisecond memory caching."""
    for m in matches:
        if not m.home_team or not m.away_team or m.status == "FINISHED":
            continue
        try:
            if not m.prediction_description or '"analytics"' not in m.prediction_description:
                pair_key = (m.home_team.id, m.away_team.id)
                if pair_key in _PREDICTION_MEM_CACHE:
                    pred = _PREDICTION_MEM_CACHE[pair_key]
                else:
                    pred = predict_match(m.home_team, m.away_team, db)
                    _PREDICTION_MEM_CACHE[pair_key] = pred

                m.ai_home_prob = pred["ai_home_prob"]
                m.ai_draw_prob = pred["ai_draw_prob"]
                m.ai_away_prob = pred["ai_away_prob"]
                m.ai_predicted_home = pred["ai_predicted_home"]
                m.ai_predicted_away = pred["ai_predicted_away"]
                m.ai_confidence = pred["ai_confidence"]
                m.prediction_description = pred["prediction_description"]
                m.odds_home = pred["odds_home"]
                m.odds_draw = pred["odds_draw"]
                m.odds_away = pred["odds_away"]
                m.odds_over25 = pred.get("odds_over25", 1.85)
                m.odds_under25 = pred.get("odds_under25", 1.95)
                m.odds_btts_yes = pred.get("odds_btts_yes", 1.80)
                m.odds_btts_no = pred.get("odds_btts_no", 2.00)
                m.odds_dc_1x = pred.get("odds_dc_1x", 1.30)
                m.odds_dc_x2 = pred.get("odds_dc_x2", 1.45)
                m.odds_dc_12 = pred.get("odds_dc_12", 1.25)
        except Exception:
            pass


@router.get("/feed")
def get_unified_matches_feed(response: Response, db: Session = Depends(get_db)):
    """
    High-Speed Unified Feed Endpoint.
    Returns all active fixtures (Upcoming, Live, Finished) + Leagues in a single, ultra-fast response.
    """
    # Cache for 20 seconds in server memory
    cached = get_from_cache("unified_matches_feed", ttl_seconds=20.0)
    if cached is not None:
        response.headers["Cache-Control"] = "public, max-age=15, s-maxage=30, stale-while-revalidate=60"
        return cached

    now = datetime.now(timezone.utc)
    # Fetch dedicated sets for each category to guarantee balanced feed
    opts = [
        joinedload(Match.league),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
    ]

    # 1. Live Matches
    live_matches = (
        db.query(Match)
        .options(*opts)
        .filter(Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME"]))
        .order_by(Match.utc_date.asc())
        .all()
    )

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # 2. Upcoming Scheduled Matches (strictly from today forward, active only)
    upcoming_matches = (
        db.query(Match)
        .options(*opts)
        .filter(
            Match.status.in_(["SCHEDULED", "TIMED"]),
            Match.utc_date >= today_start,
        )
        .order_by(Match.utc_date.asc())
        .limit(60)
        .all()
    )

    # 3. Recently Finished Matches (most recent first)
    finished_matches = (
        db.query(Match)
        .options(*opts)
        .filter(Match.status.in_(["FINISHED", "AWARDED"]))
        .order_by(Match.utc_date.desc())
        .limit(120)
        .all()
    )

    # Merge into deduplicated list
    match_map = {}
    for m in (live_matches + upcoming_matches + finished_matches):
        if m.id not in match_map:
            match_map[m.id] = m

    matches = list(match_map.values())

    # 4. Fetch all active leagues
    leagues = db.query(League).all()

    ensure_match_predictions(matches, db)

    result = {
        "matches": matches,
        "leagues": leagues,
        "timestamp": now.isoformat(),
        "total": len(matches),
    }

    set_in_cache("unified_matches_feed", result)
    response.headers["Cache-Control"] = "public, max-age=15, s-maxage=30, stale-while-revalidate=60"
    return result


@router.get("/", response_model=list[MatchOut])
def get_matches(
    league_code: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    season: Optional[str] = "2026/2027",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    cache_key = f"matches_{league_code}_{status}_{date}_{season}_{skip}_{limit}"
    cached = get_from_cache(cache_key, ttl_seconds=20.0)
    if cached is not None:
        return cached

    q = db.query(Match).options(
        joinedload(Match.league),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
    )

    if season:
        season_start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        q = q.filter(or_(Match.season == season, Match.season == "2026", Match.utc_date >= season_start))

    if league_code:
        league = db.query(League).filter(League.code == league_code.upper()).first()
        if league:
            q = q.filter(Match.league_id == league.id)

    if status:
        statuses = status.split(",")
        if "SCHEDULED" in statuses and "TIMED" not in statuses:
            statuses.append("TIMED")
        if "LIVE" in statuses:
            for s in ["IN_PLAY", "PAUSED", "HALFTIME", "1H", "2H", "HT"]:
                if s not in statuses:
                    statuses.append(s)
        q = q.filter(Match.status.in_(statuses))

    if date:
        try:
            dt = datetime.fromisoformat(date)
            start = dt.replace(hour=0, minute=0, second=0, tzinfo=timezone.utc)
            end = dt.replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            q = q.filter(Match.utc_date >= start, Match.utc_date <= end)
        except Exception:
            pass

    if status == "FINISHED":
        results = q.order_by(Match.utc_date.desc()).offset(skip).limit(limit).all()
    else:
        results = q.order_by(Match.utc_date.asc()).offset(skip).limit(limit).all()

    ensure_match_predictions(results, db)
    set_in_cache(cache_key, results)
    return results


@router.get("/today", response_model=list[MatchOut])
def get_today_matches(db: Session = Depends(get_db)):
    cache_key = "matches_today"
    cached = get_from_cache(cache_key, ttl_seconds=15.0)
    if cached is not None:
        return cached

    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=3)

    matches = (
        db.query(Match)
        .options(
            joinedload(Match.league),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
        .filter(Match.utc_date >= start, Match.utc_date <= end)
        .order_by(Match.utc_date.asc())
        .limit(30)
        .all()
    )

    if not matches:
        matches = get_upcoming(days=30, limit=20, db=db)
    else:
        ensure_match_predictions(matches, db)

    set_in_cache(cache_key, matches)
    return matches


@router.get("/live", response_model=list[MatchOut])
def get_live_matches(db: Session = Depends(get_db)):
    cache_key = "matches_live"
    cached = get_from_cache(cache_key, ttl_seconds=5.0)
    if cached is not None:
        return cached

    results = (
        db.query(Match)
        .options(
            joinedload(Match.league),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
        .filter(Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME"]))
        .order_by(Match.utc_date.asc())
        .all()
    )
    ensure_match_predictions(results, db)
    set_in_cache(cache_key, results)
    return results


@router.get("/upcoming", response_model=list[MatchOut])
def get_upcoming(
    league_code: Optional[str] = None,
    days: int = Query(60, ge=1, le=180),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    cache_key = f"matches_upcoming_{league_code}_{days}_{limit}"
    cached = get_from_cache(cache_key, ttl_seconds=20.0)
    if cached is not None:
        return cached

    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)

    q = (
        db.query(Match)
        .options(
            joinedload(Match.league),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
        .filter(
            Match.status.in_(["SCHEDULED", "TIMED"]),
            Match.utc_date >= now,
            Match.utc_date <= end,
        )
    )

    if league_code:
        league = db.query(League).filter(League.code == league_code.upper()).first()
        if league:
            q = q.filter(Match.league_id == league.id)

    results = q.order_by(Match.utc_date.asc()).limit(limit).all()
    ensure_match_predictions(results, db)
    set_in_cache(cache_key, results)
    return results


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException

    cache_key = f"match_detail_{match_id}"
    cached = get_from_cache(cache_key, ttl_seconds=30.0)
    if cached is not None:
        return cached

    match = (
        db.query(Match)
        .options(
            joinedload(Match.league),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
        .filter(Match.id == match_id)
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    ensure_match_predictions([match], db)
    set_in_cache(cache_key, match)
    return match


@router.get("/search")
def search_football_entities(
    q: str = Query(..., min_length=2),
    limit: int = Query(15, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """
    Categorized Fast Search Endpoint:
    Searches across Teams, Competitions, and Matches with strict limit bounds.
    """
    clean_q = f"%{q.strip()}%"

    # 1. Matching Teams
    teams = (
        db.query(Team)
        .filter(or_(Team.name.ilike(clean_q), Team.short_name.ilike(clean_q)))
        .limit(limit)
        .all()
    )

    # 2. Matching Leagues
    leagues = (
        db.query(League)
        .filter(or_(League.name.ilike(clean_q), League.code.ilike(clean_q)))
        .limit(limit)
        .all()
    )

    # 3. Matching Matches
    HomeTeam = Team
    matches = (
        db.query(Match)
        .join(HomeTeam, Match.home_team_id == HomeTeam.id)
        .options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.league),
        )
        .filter(or_(HomeTeam.name.ilike(clean_q), HomeTeam.short_name.ilike(clean_q)))
        .order_by(Match.utc_date.desc())
        .limit(limit)
        .all()
    )
    ensure_match_predictions(matches, db)

    return {
        "query": q,
        "teams": [
            {
                "id": t.id,
                "name": t.name,
                "short_name": t.short_name,
                "crest": t.crest,
                "elo_rating": t.elo_rating,
            }
            for t in teams
        ],
        "leagues": [
            {
                "id": l.id,
                "name": l.name,
                "code": l.code,
                "country": l.country,
                "flag": l.flag,
            }
            for l in leagues
        ],
        "matches": matches,
    }
