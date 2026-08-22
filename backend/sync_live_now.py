import asyncio
import time
import sys
import os
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.match import Match, League
from app.services import football_api
from app.services.sync_service import _upsert_matches, CURRENT_SEASON_STR, FRIENDLY_STAGES, score_finished_predictions
from app.core.config import SUPPORTED_COMPETITIONS

db = SessionLocal()
now = datetime.now(timezone.utc)
today_str = now.strftime("%Y-%m-%d")

print("=== SYNCING TODAY & LIVE MATCH RESULTS ===")
print("Current Time:", now.strftime("%Y-%m-%d %H:%M:%S UTC"))
print()

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

for code, info in SUPPORTED_COMPETITIONS.items():
    try:
        data = loop.run_until_complete(
            football_api.get_matches(code, date_from=today_str, date_to=today_str)
        )
        matches_data = data.get("matches", [])
        matches_data = [m for m in matches_data if m.get("stage", "") not in FRIENDLY_STAGES]

        if matches_data:
            league = db.query(League).filter(League.code == code).first()
            if league:
                cnt = _upsert_matches(db, league, matches_data, CURRENT_SEASON_STR)
                league.last_synced = datetime.now(timezone.utc)
                db.commit()
                print(f"  [{code}] {info['name']}: {cnt} matches synced")
    except Exception as e:
        print(f"  [{code}] Error: {e}")
    time.sleep(6)  # safe rate limit

loop.close()
db.close()

# Score newly finished predictions
score_finished_predictions()
print()
print("=== CURRENT STATUS OF TODAY'S MATCHES ===")

db = SessionLocal()
today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
today_end = today_start.replace(hour=23, minute=59, second=59)

todays = (
    db.query(Match)
    .options(joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league))
    .filter(Match.utc_date >= today_start, Match.utc_date <= today_end)
    .order_by(Match.utc_date.asc())
    .all()
)

for m in todays:
    ht = m.home_team.name if m.home_team else "?"
    at = m.away_team.name if m.away_team else "?"
    lg = m.league.name if m.league else "?"
    score = f"{m.home_score} - {m.away_score}" if m.home_score is not None else "vs"
    utc = m.utc_date.strftime("%H:%M UTC") if m.utc_date else "?"
    print(f"  [{m.status}] {utc} | {ht} {score} {at} ({lg})")

db.close()
