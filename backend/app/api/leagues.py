from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.match import League, Match, Team
from app.schemas.schemas import LeagueOut, StandingsOut, StandingEntry, TeamOut
from app.services import football_api
import asyncio

router = APIRouter(prefix="/api/leagues", tags=["leagues"])


@router.get("/", response_model=list[LeagueOut])
def get_leagues(db: Session = Depends(get_db)):
    return db.query(League).filter(League.is_active == True).all()


@router.get("/{code}", response_model=LeagueOut)
def get_league(code: str, db: Session = Depends(get_db)):
    league = db.query(League).filter(League.code == code.upper()).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    return league


@router.get("/{code}/standings")
def get_standings(code: str):
    """Proxy standings from football-data.org."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        data = loop.run_until_complete(football_api.get_standings(code.upper()))
        loop.close()
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
        q = q.filter(Match.status.in_(status.split(",")))

    return q.order_by(Match.utc_date.desc()).offset(skip).limit(limit).all()
