"""
Recalculates distinct, team-specific match predictions, scorelines, and descriptions
for all scheduled matches in the database.
Run: py scripts/recalculate_predictions.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.match import Match, Team
from app.services.ml_predictor import predict_match


def recalculate():
    db = SessionLocal()
    try:
        matches = db.query(Match).filter(Match.status.in_(["SCHEDULED", "TIMED"])).limit(200).all()
        print(f"Recalculating predictions for {len(matches)} scheduled matches...")

        count = 0
        for m in matches:
            home = db.query(Team).filter(Team.id == m.home_team_id).first()
            away = db.query(Team).filter(Team.id == m.away_team_id).first()

            if home and away:
                pred = predict_match(home, away, db)
                m.ai_home_prob = pred["ai_home_prob"]
                m.ai_draw_prob = pred["ai_draw_prob"]
                m.ai_away_prob = pred["ai_away_prob"]
                m.ai_predicted_home = pred["ai_predicted_home"]
                m.ai_predicted_away = pred["ai_predicted_away"]
                m.ai_confidence = pred["ai_confidence"]
                m.prediction_description = pred["prediction_description"]
                count += 1

        db.commit()
        print(f"Successfully updated predictions for {count} matches!")

    finally:
        db.close()


if __name__ == "__main__":
    recalculate()
