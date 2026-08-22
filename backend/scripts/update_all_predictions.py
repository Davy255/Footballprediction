import sys
import os
import json
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.match import Match, Team
from app.services.ml_predictor import predict_match

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_all_fixtures():
    db = SessionLocal()
    try:
        # Update all active, scheduled, live, and recent fixtures
        active_statuses = ("SCHEDULED", "TIMED", "LIVE", "IN_PLAY", "PAUSED", "HALFTIME")
        matches = db.query(Match).filter(Match.status.in_(active_statuses)).all()
        
        # Also grab the 500 most recent fixtures
        recent = db.query(Match).order_by(Match.utc_date.desc()).limit(500).all()
        
        target_dict = {m.id: m for m in matches + recent}
        target_matches = list(target_dict.values())
        logger.info(f"Starting update for {len(target_matches)} fixtures...")

        # Pre-fetch teams map
        teams_map = {t.id: t for t in db.query(Team).all()}

        updated = 0
        for i, match in enumerate(target_matches):
            home_team = teams_map.get(match.home_team_id)
            away_team = teams_map.get(match.away_team_id)
            if not home_team or not away_team:
                continue

            try:
                pred = predict_match(home_team, away_team, db)
                match.ai_home_prob = pred["ai_home_prob"]
                match.ai_draw_prob = pred["ai_draw_prob"]
                match.ai_away_prob = pred["ai_away_prob"]
                match.ai_predicted_home = pred["ai_predicted_home"]
                match.ai_predicted_away = pred["ai_predicted_away"]
                match.ai_confidence = pred["ai_confidence"]
                match.prediction_description = pred["prediction_description"]
                if not match.odds_home:
                    match.odds_home = pred["odds_home"]
                    match.odds_draw = pred["odds_draw"]
                    match.odds_away = pred["odds_away"]

                updated += 1
                if updated % 100 == 0:
                    db.commit()
                    logger.info(f"Progress: {updated}/{len(target_matches)} matches updated...")
            except Exception as e:
                logger.error(f"Error on match {match.id}: {e}")

        db.commit()
        logger.info(f"SUCCESS: Completed updating {updated} matches with rich JSON analysis!")
    finally:
        db.close()

if __name__ == "__main__":
    update_all_fixtures()
