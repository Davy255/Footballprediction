import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.match import Match
from app.services.ml_predictor import predict_match

def run():
    db = SessionLocal()
    try:
        matches = db.query(Match).filter(Match.status.in_(['SCHEDULED', 'TIMED', 'LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'])).all()
        print(f"Found {len(matches)} scheduled/live matches to update.")
        
        count = 0
        for m in matches:
            if not m.home_team or not m.away_team:
                continue
            try:
                pred = predict_match(m.home_team, m.away_team, db)
                m.ai_home_prob = pred['ai_home_prob']
                m.ai_draw_prob = pred['ai_draw_prob']
                m.ai_away_prob = pred['ai_away_prob']
                m.ai_predicted_home = pred['ai_predicted_home']
                m.ai_predicted_away = pred['ai_predicted_away']
                m.ai_confidence = pred['ai_confidence']
                m.prediction_description = pred['prediction_description']
                m.odds_home = pred['odds_home']
                m.odds_draw = pred['odds_draw']
                m.odds_away = pred['odds_away']
                m.odds_over25 = pred.get('odds_over25', 1.85)
                m.odds_under25 = pred.get('odds_under25', 1.95)
                m.odds_btts_yes = pred.get('odds_btts_yes', 1.80)
                m.odds_btts_no = pred.get('odds_btts_no', 2.00)
                m.odds_dc_1x = pred.get('odds_dc_1x', 1.30)
                m.odds_dc_x2 = pred.get('odds_dc_x2', 1.45)
                m.odds_dc_12 = pred.get('odds_dc_12', 1.25)
                count += 1
            except Exception as e:
                print(f"Error on match {m.id} ({m.home_team_name} vs {m.away_team_name}): {e}")
                
        db.commit()
        print(f"Successfully processed and updated {count} matches with full AI predictions and multi-market odds!")
    finally:
        db.close()

if __name__ == '__main__':
    run()
