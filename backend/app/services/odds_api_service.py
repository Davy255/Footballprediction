"""
Live Sports Odds API Integration Service (The Odds API)
Fetches live bookmaker odds (Bet365, Pinnacle, Betfair, Unibet) across supported soccer leagues
and updates DB matches with real market prices, probabilities, and score projections.
"""
import logging
import httpx
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.match import Match, League, Team
from app.services.ml_predictor import calculate_projected_scoreline, generate_prediction_description

logger = logging.getLogger(__name__)

# The Odds API Sport Key -> Database League Code
ODDS_SPORT_MAP = {
    "PL": "soccer_epl",
    "PD": "soccer_spain_la_liga",
    "BL1": "soccer_germany_bundesliga",
    "SA": "soccer_italy_serie_a",
    "FL1": "soccer_france_ligue_one",
    "PPL": "soccer_portugal_primeira_liga",
    "DED": "soccer_netherlands_eredivisie",
    "ELC": "soccer_efl_champ",
    "BSA": "soccer_brazil_campeonato",
    "CL": "soccer_uefa_champs_league",
}

# Explicit Team Name Aliases
EXPLICIT_ALIASES = {
    "sporting lisbon": "sporting clube de portugal",
    "inter milan": "fc internazionale milano",
    "ac milan": "ac milan",
    "bayern munich": "fc bayern münchen",
    "psg": "paris saint-germain fc",
    "marseille": "olympique de marseille",
    "lyon": "olympique lyonnais",
    "monaco": "as monaco fc",
    "atletico madrid": "club atlético de madrid",
    "real madrid": "real madrid cf",
    "barcelona": "fc barcelona",
    "sc telstar": "telstar",
    "telstar 1963": "telstar",
}


def clean_team_name(name: str) -> str:
    cleaned = name.lower().strip()
    if cleaned in EXPLICIT_ALIASES:
        return EXPLICIT_ALIASES[cleaned]
    # Remove common prefixes/suffixes
    for prefix in ["cd ", "fc ", "afc ", "sc ", "rc ", "as ", "ac ", "cf ", "se ", "cr ", "1. "]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
    for suffix in [" fc", " afc", " sc", " cf"]:
        if cleaned.endswith(suffix):
            cleaned = cleaned[:-len(suffix)].strip()
    return cleaned


def sync_live_odds_for_league(league_code: str, db: Session) -> int:
    """Fetch live bookmaker odds from The Odds API for a single league code."""
    sport_key = ODDS_SPORT_MAP.get(league_code)
    if not sport_key or not settings.ODDS_API_KEY:
        return 0

    url = f"https://api.the-odds-api.com/v4/sports/{sport_key}/odds/"
    params = {
        "apiKey": settings.ODDS_API_KEY,
        "regions": "eu,uk,us",
        "markets": "h2h",
        "oddsFormat": "decimal",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(url, params=params)
            if resp.status_code != 200:
                logger.warning(f"The Odds API error for {league_code}: HTTP {resp.status_code}")
                return 0
            data = resp.json()
    except Exception as e:
        logger.error(f"Failed to fetch live odds for {league_code}: {e}")
        return 0

    if not data or not isinstance(data, list):
        return 0

    league_obj = db.query(League).filter(League.code == league_code).first()
    if not league_obj:
        return 0

    teams = db.query(Team).all()
    team_dict = {}
    for t in teams:
        team_dict[clean_team_name(t.name)] = t
        if t.short_name:
            team_dict[clean_team_name(t.short_name)] = t

    updated_count = 0

    for item in data:
        if not isinstance(item, dict):
            continue

        home_raw = item.get("home_team", "")
        away_raw = item.get("away_team", "")

        home_clean = clean_team_name(home_raw)
        away_clean = clean_team_name(away_raw)

        home_team = team_dict.get(home_clean)
        away_team = team_dict.get(away_clean)

        if not home_team or not away_team:
            continue

        bookmakers = item.get("bookmakers", [])
        if not bookmakers:
            continue

        target_bm = None
        for bm_name in ["Bet365", "Pinnacle", "Unibet", "Betfair", "Smarkets", "Betway", "William Hill", "Bwin"]:
            for bm in bookmakers:
                if bm.get("title", "").lower() == bm_name.lower():
                    target_bm = bm
                    break
            if target_bm:
                break

        if not target_bm:
            target_bm = bookmakers[0]

        h2h_market = None
        for m in target_bm.get("markets", []):
            if m.get("key") == "h2h":
                h2h_market = m
                break

        if not h2h_market:
            continue

        odds_h, odds_d, odds_a = None, None, None
        for outcome in h2h_market.get("outcomes", []):
            o_name = outcome.get("name", "")
            o_price = float(outcome.get("price", 0))

            if o_name == home_raw or clean_team_name(o_name) == home_clean:
                odds_h = o_price
            elif o_name == away_raw or clean_team_name(o_name) == away_clean:
                odds_a = o_price
            elif o_name.lower() == "draw":
                odds_d = o_price

        if not odds_h or not odds_d or not odds_a or odds_h <= 1.0 or odds_d <= 1.0 or odds_a <= 1.0:
            continue

        # Find matches in DB
        matches = (
            db.query(Match)
            .filter(
                Match.league_id == league_obj.id,
                Match.home_team_id == home_team.id,
                Match.away_team_id == away_team.id,
                Match.status.in_(["SCHEDULED", "TIMED"]),
            )
            .all()
        )

        for match in matches:
            # Calculate exact implied win probabilities from bookmaker market odds
            raw_h = 1.0 / odds_h
            raw_d = 1.0 / odds_d
            raw_a = 1.0 / odds_a
            tot = raw_h + raw_d + raw_a

            h_prob = round(raw_h / tot, 3)
            d_prob = round(raw_d / tot, 3)
            a_prob = round(raw_a / tot, 3)

            pred_h, pred_a = calculate_projected_scoreline(h_prob, d_prob, a_prob, 1.5, 1.1, 1.4, 1.2)
            h_name = home_team.short_name or home_team.name
            a_name = away_team.short_name or away_team.name
            desc = generate_prediction_description(
                h_name, a_name, h_prob, d_prob, a_prob, pred_h, pred_a,
                round(odds_h, 2), round(odds_d, 2), round(odds_a, 2)
            )

            match.odds_home = round(odds_h, 2)
            match.odds_draw = round(odds_d, 2)
            match.odds_away = round(odds_a, 2)

            match.ai_home_prob = h_prob
            match.ai_draw_prob = d_prob
            match.ai_away_prob = a_prob
            match.ai_confidence = max(h_prob, d_prob, a_prob)
            match.ai_predicted_home = pred_h
            match.ai_predicted_away = pred_a
            match.prediction_description = desc

            updated_count += 1

    db.commit()
    print(f"Synced {updated_count} live bookmaker odds for {league_code}")
    return updated_count


def sync_all_live_odds() -> int:
    """Sync live odds across all supported competitions."""
    db = SessionLocal()
    total_updated = 0
    try:
        for league_code in ODDS_SPORT_MAP.keys():
            count = sync_live_odds_for_league(league_code, db)
            total_updated += count
        print(f"Total live bookmaker odds synced from The Odds API: {total_updated}")
        return total_updated
    finally:
        db.close()
