import time
import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.match import Match, League, Team
from app.schemas.schemas import MatchOut
from app.services.ml_predictor import predict_match, get_team_manager

router = APIRouter(prefix="/api/matches", tags=["matches"])

# High-Performance In-Memory Cache with TTL
_cache_store: Dict[str, Tuple[float, Any]] = {}


def get_from_cache(key: str, ttl_seconds: float = 10.0) -> Optional[Any]:
    if key in _cache_store:
        timestamp, data = _cache_store[key]
        if time.time() - timestamp < ttl_seconds:
            return data
    return None


def set_in_cache(key: str, data: Any):
    _cache_store[key] = (time.time(), data)


def ensure_match_predictions(matches: list[Match], db: Session):
    """Ensures returned matches have AI prediction fields populated with zero blocking overhead."""
    for m in matches:
        if not m.home_team or not m.away_team or m.status == "FINISHED":
            continue
        try:
            if not m.prediction_description or '"analytics"' not in m.prediction_description:
                pred = predict_match(m.home_team, m.away_team, db)
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
    cached = get_from_cache(cache_key, ttl_seconds=15.0)
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
    cached = get_from_cache(cache_key, ttl_seconds=10.0)
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
        .limit(20)
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
    cached = get_from_cache(cache_key, ttl_seconds=3.0)
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
    """Returns upcoming matches (SCHEDULED and TIMED) ordered chronologically with sub-millisecond caching."""
    cache_key = f"matches_upcoming_{league_code}_{days}_{limit}"
    cached = get_from_cache(cache_key, ttl_seconds=15.0)
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
    cached = get_from_cache(cache_key, ttl_seconds=20.0)
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
