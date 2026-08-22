from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.match import Match, League, Team
from app.schemas.schemas import MatchOut

router = APIRouter(prefix="/api/matches", tags=["matches"])


from app.services.ml_predictor import predict_match, get_team_manager
from app.services.sync_service import auto_finalize_expired_live_matches, auto_manage_live_matches


def ensure_match_predictions(matches: list[Match], db: Session):
    """Guarantees every returned match has the comprehensive v2 rich analysis, WhoScored data, accurate current managers, and all market odds."""
    auto_finalize_expired_live_matches(db)
    changed = False
    for m in matches:
        if not m.home_team or not m.away_team:
            continue
        if m.status == 'FINISHED':
            continue
        try:
            # Check if prediction needs full re-generation or manager fix
            if not m.prediction_description or '"analytics"' not in m.prediction_description or '"whoscored"' not in m.prediction_description:
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
                changed = True
            else:
                # Ensure managers in whoscored block are accurate
                import json
                desc = json.loads(m.prediction_description)
                ws = desc.get("whoscored", {})
                correct_hm = get_team_manager(m.home_team.name, getattr(m.home_team, "short_name", ""))
                correct_am = get_team_manager(m.away_team.name, getattr(m.away_team, "short_name", ""))
                if ws.get("home_manager") != correct_hm or ws.get("away_manager") != correct_am:
                    ws["home_manager"] = correct_hm
                    ws["away_manager"] = correct_am
                    desc["whoscored"] = ws
                    m.prediction_description = json.dumps(desc, ensure_ascii=False)
                    changed = True
        except Exception:
            pass
    if changed:
        try:
            db.commit()
        except Exception:
            db.rollback()


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
    auto_manage_live_matches(db)
    q = db.query(Match).options(
        joinedload(Match.league),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
    )

    if season:
        # Fix 3: Use proper datetime comparison instead of string comparison on DateTime column.
        # 2026/27 season starts from July 2026. Match on season string OR utc_date in the season window.
        season_start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        q = q.filter(or_(Match.season == season, Match.season == "2026", Match.utc_date >= season_start))

    if league_code:
        league = db.query(League).filter(League.code == league_code).first()
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
    return results


@router.get("/today", response_model=list[MatchOut])
def get_today_matches(db: Session = Depends(get_db)):
    auto_manage_live_matches(db)
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
        .limit(10)
        .all()
    )

    if not matches:
        matches = get_upcoming(days=30, limit=10, db=db)
    else:
        ensure_match_predictions(matches, db)

    return matches


@router.get("/live", response_model=list[MatchOut])
def get_live_matches(db: Session = Depends(get_db)):
    auto_manage_live_matches(db)
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
    return results


@router.get("/upcoming", response_model=list[MatchOut])
def get_upcoming(
    league_code: Optional[str] = None,
    days: int = Query(60, ge=1, le=180),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Returns upcoming matches (SCHEDULED and TIMED) ordered chronologically."""
    auto_manage_live_matches(db)
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
        league = db.query(League).filter(League.code == league_code).first()
        if league:
            q = q.filter(Match.league_id == league.id)

    results = q.order_by(Match.utc_date.asc()).limit(limit).all()
    ensure_match_predictions(results, db)
    return results


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
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
    return match
