"""
Sync today's fixtures and live matches from the real API for all competitions.
Runs a targeted sync: today ± 2 days for accuracy.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
import time
import logging
from datetime import datetime, timezone, timedelta, date

logging.basicConfig(level=logging.INFO)

from app.core.database import SessionLocal
from app.core.config import SUPPORTED_COMPETITIONS
from app.models.match import Match, League, Team
from app.services import football_api
from app.services.sync_service import (
    get_or_create_league, get_or_create_team, _upsert_matches,
    CURRENT_SEASON_STR, FRIENDLY_STAGES
)

def sync_today():
    today = date.today()
    date_from = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    date_to   = (datetime.now(timezone.utc) + timedelta(days=3)).strftime("%Y-%m-%d")

    print(f"Syncing fixtures from {date_from} to {date_to} for all competitions...")
    print()

    for code in SUPPORTED_COMPETITIONS:
        db = SessionLocal()
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                data = loop.run_until_complete(
                    football_api.get_matches(code, date_from=date_from, date_to=date_to)
                )
            except Exception as e:
                print(f"  [{code}] API error: {e}")
                continue
            finally:
                loop.close()

            matches_data = data.get("matches", [])
            # Filter friendlies
            matches_data = [m for m in matches_data if m.get("stage","") not in FRIENDLY_STAGES]

            league = get_or_create_league(db, code)
            count = _upsert_matches(db, league, matches_data, CURRENT_SEASON_STR)
            league.last_synced = datetime.now(timezone.utc)
            db.commit()
            print(f"  [{code}] {SUPPORTED_COMPETITIONS[code]['name']}: {count} matches synced")
        except Exception as e:
            print(f"  [{code}] Error: {e}")
            db.rollback()
        finally:
            db.close()
            time.sleep(6)

    print()
    print("=== TODAY SYNC COMPLETE ===")

    # Verify
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    from sqlalchemy.orm import joinedload

    todays = db.query(Match).options(
        joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league)
    ).filter(Match.utc_date >= today_start, Match.utc_date <= today_end).order_by(Match.utc_date).all()

    live = db.query(Match).filter(Match.status.in_(["IN_PLAY","PAUSED","HALFTIME","LIVE"])).count()

    print(f"Today's matches in DB: {len(todays)}")
    print(f"Currently LIVE: {live}")
    print()
    for m in todays:
        ht = m.home_team.name if m.home_team else "?"
        at = m.away_team.name if m.away_team else "?"
        lg = m.league.name if m.league else "?"
        utc = m.utc_date.strftime("%H:%M UTC") if m.utc_date else "?"
        print(f"  [{m.status}] {utc} | {ht} vs {at} | {lg}")
    db.close()

if __name__ == "__main__":
    sync_today()
