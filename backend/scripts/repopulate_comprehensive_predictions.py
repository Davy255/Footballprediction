"""
Script to re-generate comprehensive in-depth predictions and H2H multi-market analysis for all scheduled matches.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.match import Match, Team
from app.services.ml_predictor import predict_match


def repopulate_predictions():
    db = SessionLocal()
    try:
        scheduled = db.query(Match).filter(Match.status.in_(["SCHEDULED", "TIMED"])).all()
        print(f"Updating comprehensive predictions for {len(scheduled)} matches...")

        count = 0
        teams_dict = {t.id: t for t in db.query(Team).all()}

        for m in scheduled:
            home = teams_dict.get(m.home_team_id)
            away = teams_dict.get(m.away_team_id)
            if not home or not away:
                continue

            res = predict_match(home, away, db)

            m.ai_home_prob = res["ai_home_prob"]
            m.ai_draw_prob = res["ai_draw_prob"]
            m.ai_away_prob = res["ai_away_prob"]
            m.ai_predicted_home = res["ai_predicted_home"]
            m.ai_predicted_away = res["ai_predicted_away"]
            m.ai_confidence = res["ai_confidence"]
            m.prediction_description = res["prediction_description"]

            # Preserve real live odds if set
            if not m.odds_home or m.odds_home <= 1.0:
                m.odds_home = res["odds_home"]
                m.odds_draw = res["odds_draw"]
                m.odds_away = res["odds_away"]

            count += 1

        db.commit()
        print(f"Successfully updated comprehensive predictions for all {count} matches!")

    finally:
        db.close()


if __name__ == "__main__":
    repopulate_predictions()
