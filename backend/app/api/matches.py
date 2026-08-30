import re
import unicodedata
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

from app.core.cache import feed_cache, prediction_mem_cache
from app.core.security import search_rate_limiter


def get_from_cache(key: str, ttl_seconds: float = 180.0) -> Optional[Any]:
    return feed_cache.get(key)


def set_in_cache(key: str, data: Any, ttl: float = 180.0):
    feed_cache.set(key, data, ttl=ttl)


def ensure_match_predictions(matches: list[Match], db: Session):
    """Ensures returned matches have AI prediction fields populated with sub-millisecond memory caching."""
    for m in matches:
        if not m.home_team or not m.away_team or m.status == "FINISHED":
            continue
        # Fast-path: If match already has AI probabilities and predictions in DB, skip heavy ML calculation
        if m.ai_home_prob is not None and m.ai_predicted_home is not None and m.prediction_description:
            continue

        try:
            pair_key = f"{m.home_team.id}_{m.away_team.id}"
            pred = prediction_mem_cache.get(pair_key)
            if not pred:
                pred = predict_match(m.home_team, m.away_team, db)
                prediction_mem_cache.set(pair_key, pred, ttl=3600.0)

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
    # Cache for 60 seconds — reduced from 180s for fresher data after cold starts
    cached = get_from_cache("unified_matches_feed", ttl_seconds=60.0)
    if cached is not None:
        response.headers["Cache-Control"] = "public, max-age=30, s-maxage=60, stale-while-revalidate=120"
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

    # 3. Recently Finished Matches — past 3 days to guarantee yesterday's results
    three_days_ago = now - timedelta(days=3)
    finished_matches = (
        db.query(Match)
        .options(*opts)
        .filter(
            Match.status.in_(["FINISHED", "AWARDED"]),
            Match.utc_date >= three_days_ago,
        )
        .order_by(Match.utc_date.desc())
        .limit(60)
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

    set_in_cache("unified_matches_feed", result, ttl=60.0)
    response.headers["Cache-Control"] = "public, max-age=30, s-maxage=60, stale-while-revalidate=120"
    return result


@router.get("/", response_model=list[MatchOut])
def get_matches(
    league_code: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    season: Optional[str] = None,
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

    set_in_cache(cache_key, matches, ttl=15.0)
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
    set_in_cache(cache_key, results, ttl=5.0)
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


@router.get("/search", dependencies=[Depends(search_rate_limiter)])
def search_football_entities(
    q: str = Query(..., min_length=2),
    limit: int = Query(15, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """
    Categorized High-Performance Football Search Endpoint.
    Searches Teams, Competitions, and Fixtures with multi-token parsing,
    alias matching, diacritics tolerance, and prioritized ranking.
    """
    import unicodedata
    from sqlalchemy.orm import aliased
    from sqlalchemy import and_, or_, func

    raw_query = q.strip()
    if len(raw_query) < 2:
        return {"query": raw_query, "teams": [], "leagues": [], "matches": []}

    # Check in-memory search cache
    normalized_cache_key = f"search_{raw_query.lower()}_{limit}"
    cached = get_from_cache(normalized_cache_key, ttl_seconds=30.0)
    if cached is not None:
        return cached

    # Normalize unicode accents
    norm_q = unicodedata.normalize("NFKD", raw_query).encode("ASCII", "ignore").decode("utf-8").lower().strip()

    # Dictionary of known club & league aliases in European football
    KNOWN_ALIASES = {
        "man utd": ["Manchester United", "Man United"],
        "man united": ["Manchester United"],
        "man city": ["Manchester City", "Man City"],
        "mancity": ["Manchester City"],
        "barca": ["Barcelona", "FC Barcelona"],
        "real madrid": ["Real Madrid"],
        "real": ["Real Madrid", "Real Sociedad", "Real Betis"],
        "atleti": ["Atlético Madrid", "Atletico Madrid", "Club Atlético de Madrid"],
        "atletico": ["Atlético Madrid", "Atletico Madrid", "Athletic Club"],
        "bilbao": ["Athletic Club", "Athletic Bilbao"],
        "psg": ["Paris Saint-Germain", "Paris Saint Germain"],
        "paris": ["Paris Saint-Germain"],
        "inter": ["FC Internazionale Milano", "Inter Milan", "Internazionale"],
        "juve": ["Juventus FC", "Juventus"],
        "bayern": ["FC Bayern München", "Bayern Munich"],
        "dortmund": ["Borussia Dortmund", "BVB"],
        "bvb": ["Borussia Dortmund"],
        "leverkusen": ["Bayer 04 Leverkusen", "Bayer Leverkusen"],
        "spurs": ["Tottenham Hotspur FC", "Tottenham"],
        "tottenham": ["Tottenham Hotspur FC"],
        "wolves": ["Wolverhampton Wanderers FC", "Wolverhampton"],
        "newcastle": ["Newcastle United FC", "Newcastle"],
        "villa": ["Aston Villa FC", "Aston Villa"],
        "chelsea": ["Chelsea FC"],
        "arsenal": ["Arsenal FC"],
        "liverpool": ["Liverpool FC"],
        "milan": ["AC Milan"],
        "roma": ["AS Roma"],
        "napoli": ["SSC Napoli"],
        "la liga": ["Primera Division", "La Liga", "PD"],
        "laliga": ["Primera Division", "La Liga", "PD"],
        "premier league": ["Premier League", "PL"],
        "prem": ["Premier League", "PL"],
        "epl": ["Premier League", "PL"],
        "bpl": ["Premier League", "PL"],
        "champions league": ["UEFA Champions League", "CL"],
        "ucl": ["UEFA Champions League", "CL"],
        "serie a": ["Serie A", "SA"],
        "bundesliga": ["Bundesliga", "BL1"],
        "ligue 1": ["Ligue 1", "FL1"],
        "eredivisie": ["Eredivisie", "DED"],
    }

    alias_targets = []
    for alias_key, targets in KNOWN_ALIASES.items():
        if alias_key in norm_q:
            alias_targets.extend(targets)

    # 1. Search Teams (Exact/Prefix/Partial Match)
    team_conditions = [
        Team.name.ilike(f"%{raw_query}%"),
        Team.short_name.ilike(f"%{raw_query}%"),
        Team.tla.ilike(raw_query),
    ]
    if norm_q != raw_query.lower():
        team_conditions.append(Team.name.ilike(f"%{norm_q}%"))
        team_conditions.append(Team.short_name.ilike(f"%{norm_q}%"))

    for at in alias_targets:
        team_conditions.append(Team.name.ilike(f"%{at}%"))
        team_conditions.append(Team.short_name.ilike(f"%{at}%"))

    teams = (
        db.query(Team)
        .filter(or_(*team_conditions))
        .limit(min(limit, 8))
        .all()
    )

    # Prioritize Teams: Exact / Prefix matches first
    def team_sort_key(t):
        tn = (t.name or "").lower()
        tsn = (t.short_name or "").lower()
        if tn == norm_q or tsn == norm_q:
            return 0
        if tn.startswith(norm_q) or tsn.startswith(norm_q):
            return 1
        return 2

    teams = sorted(teams, key=team_sort_key)[:6]

    # 2. Search Leagues / Competitions
    league_conditions = [
        League.name.ilike(f"%{raw_query}%"),
        League.code.ilike(raw_query),
        League.country.ilike(f"%{raw_query}%"),
    ]
    if norm_q != raw_query.lower():
        league_conditions.append(League.name.ilike(f"%{norm_q}%"))

    for at in alias_targets:
        league_conditions.append(League.name.ilike(f"%{at}%"))
        league_conditions.append(League.code.ilike(at))

    leagues = (
        db.query(League)
        .filter(or_(*league_conditions))
        .limit(min(limit, 6))
        .all()
    )

    def league_sort_key(l):
        ln = (l.name or "").lower()
        lc = (l.code or "").lower()
        if ln == norm_q or lc == norm_q:
            return 0
        if ln.startswith(norm_q) or lc.startswith(norm_q):
            return 1
        return 2

    leagues = sorted(leagues, key=league_sort_key)[:5]

    # 3. Search Matches (Search across Home Team, Away Team, and Multi-Word Fixture queries)
    HomeTeam = aliased(Team)
    AwayTeam = aliased(Team)

    # Tokenize words, removing "vs", "v", "-", "@", "at"
    raw_tokens = [w for w in re.split(r"[\s\-_/]+", norm_q) if w and w not in ["vs", "v", "at", "the", "and"]]

    match_conditions = []

    # A. Direct query matches home team, away team, or league
    match_conditions.append(
        or_(
            HomeTeam.name.ilike(f"%{raw_query}%"),
            HomeTeam.short_name.ilike(f"%{raw_query}%"),
            AwayTeam.name.ilike(f"%{raw_query}%"),
            AwayTeam.short_name.ilike(f"%{raw_query}%"),
            League.name.ilike(f"%{raw_query}%"),
            League.code.ilike(raw_query),
        )
    )

    # B. Alias matches
    for at in alias_targets:
        match_conditions.append(
            or_(
                HomeTeam.name.ilike(f"%{at}%"),
                HomeTeam.short_name.ilike(f"%{at}%"),
                AwayTeam.name.ilike(f"%{at}%"),
                AwayTeam.short_name.ilike(f"%{at}%"),
            )
        )

    # C. Multi-token fixture matching (e.g. "Arsenal Chelsea" -> Home is Arsenal and Away is Chelsea OR vice versa)
    if len(raw_tokens) >= 2:
        t1, t2 = raw_tokens[0], raw_tokens[1]
        t1_targets = [t1]
        t2_targets = [t2]
        for ak, tv in KNOWN_ALIASES.items():
            if ak == t1:
                t1_targets.extend(tv)
            if ak == t2:
                t2_targets.extend(tv)

        t1_cond_home = or_(*[or_(HomeTeam.name.ilike(f"%{x}%"), HomeTeam.short_name.ilike(f"%{x}%")) for x in t1_targets])
        t2_cond_away = or_(*[or_(AwayTeam.name.ilike(f"%{x}%"), AwayTeam.short_name.ilike(f"%{x}%")) for x in t2_targets])
        t2_cond_home = or_(*[or_(HomeTeam.name.ilike(f"%{x}%"), HomeTeam.short_name.ilike(f"%{x}%")) for x in t2_targets])
        t1_cond_away = or_(*[or_(AwayTeam.name.ilike(f"%{x}%"), AwayTeam.short_name.ilike(f"%{x}%")) for x in t1_targets])

        match_conditions.append(
            or_(
                and_(t1_cond_home, t2_cond_away),
                and_(t2_cond_home, t1_cond_away),
            )
        )

    matches = (
        db.query(Match)
        .join(HomeTeam, Match.home_team_id == HomeTeam.id)
        .join(AwayTeam, Match.away_team_id == AwayTeam.id)
        .join(League, Match.league_id == League.id)
        .options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.league),
        )
        .filter(or_(*match_conditions))
        .order_by(
            # Put Scheduled/Timed/Live matches before finished
            Match.status.in_(["LIVE", "IN_PLAY", "SCHEDULED", "TIMED"]).desc(),
            Match.utc_date.asc(),
        )
        .limit(min(limit, 12))
        .all()
    )

    ensure_match_predictions(matches, db)

    result = {
        "query": raw_query,
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

    set_in_cache(normalized_cache_key, result)
    return result


@router.get("/yesterday", response_model=list[MatchOut])
def get_yesterday_matches(db: Session = Depends(get_db)):
    """
    Returns all completed (FINISHED/AWARDED) matches from yesterday.
    Uses UTC dates — yesterday is the full calendar day prior to today UTC.
    """
    cache_key = "matches_yesterday"
    cached = get_from_cache(cache_key, ttl_seconds=120.0)
    if cached is not None:
        return cached

    now = datetime.now(timezone.utc)
    yesterday_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday_start + timedelta(days=1)

    matches = (
        db.query(Match)
        .options(
            joinedload(Match.league),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
        .filter(
            Match.utc_date >= yesterday_start,
            Match.utc_date < yesterday_end,
            Match.status.in_(["FINISHED", "AWARDED"]),
        )
        .order_by(Match.utc_date.asc())
        .all()
    )

    set_in_cache(cache_key, matches, ttl=120.0)
    return matches


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
