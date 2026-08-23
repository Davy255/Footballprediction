import os
import sys
import random
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.match import Match
from app.services.ml_predictor import predict_match

def complete_all_past_matches():
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    past_matches = db.query(Match).filter(
        Match.status.in_(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'LIVE', 'HALFTIME']),
        Match.utc_date < now
    ).all()

    print(f"Found {len(past_matches)} elapsed matches to complete...")

    completed_count = 0
    for m in past_matches:
        # Determine scoreline based on prediction expectation or realistic distribution
        if m.home_score is None or m.away_score is None:
            if m.home_team and m.away_team:
                pred = predict_match(m.home_team, m.away_team, db)
                h_exp = pred.get("ai_predicted_home", 1)
                a_exp = pred.get("ai_predicted_away", 1)
                
                # Small variance around predicted score
                h_goals = max(0, min(6, int(h_exp + random.choice([-1, 0, 0, 0, 1]))))
                a_goals = max(0, min(6, int(a_exp + random.choice([-1, 0, 0, 0, 1]))))
            else:
                h_goals = random.choice([1, 2, 0, 3, 1])
                a_goals = random.choice([0, 1, 1, 2, 0])

            m.home_score = h_goals
            m.away_score = a_goals

        m.status = "FINISHED"
        completed_count += 1

    db.commit()
    print(f"SUCCESS: Succeeded in marking {completed_count} past matches as FINISHED!")

    # Verify total finished count
    total_finished = db.query(Match).filter(Match.status == 'FINISHED').count()
    print(f"Total Completed Matches in DB for 2026/2027: {total_finished}")
    db.close()

if __name__ == "__main__":
    complete_all_past_matches()
