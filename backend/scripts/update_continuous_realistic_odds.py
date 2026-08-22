"""
Script to apply continuous, ultra-realistic market betting odds model across all scheduled matches.
No discrete bucket duplicates.
Run: py scripts/update_continuous_realistic_odds.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.match import Match, Team
from app.services.ml_predictor import calculate_projected_scoreline, generate_prediction_description


def update_continuous_odds():
    db = SessionLocal()
    try:
        print("Loading teams and dynamic Elo ratings...")
        teams_dict = {t.id: t for t in db.query(Team).all()}
        scheduled = db.query(Match).filter(Match.status.in_(["SCHEDULED", "TIMED"])).all()

        print(f"Applying continuous realistic bookmaker odds to {len(scheduled)} matches...")

        count = 0
        for m in scheduled:
            home = teams_dict.get(m.home_team_id)
            away = teams_dict.get(m.away_team_id)
            if not home or not away:
                continue

            h_elo = home.elo_rating or 1500.0
            a_elo = away.elo_rating or 1500.0

            # Net Elo Rating Difference + Home Advantage (+48 Elo Points)
            net_elo = (h_elo - a_elo) + 48.0

            # Continuous Expected Win Rating (Logistic Sigmoid)
            win_expectation = 1.0 / (1.0 + 10.0 ** (-net_elo / 400.0))

            # Continuous Draw Probability (peaking around 31% for close matches)
            d_prob = max(0.11, min(0.32, 0.32 - (abs(net_elo) / 1250.0)))

            # Remaining probability split by win expectation
            rem = 1.0 - d_prob
            h_prob = rem * win_expectation
            a_prob = rem * (1.0 - win_expectation)

            # Match micro-variance based on unique fixture IDs to ensure zero duplicate buckets
            h_var = ((hash(home.id * 17 + m.id * 3) % 11) - 5) * 0.003
            a_var = ((hash(away.id * 23 + m.id * 7) % 11) - 5) * 0.003

            h_prob = max(0.05, min(0.88, h_prob + h_var))
            a_prob = max(0.05, min(0.88, a_prob + a_var))
            d_prob = max(0.10, 1.0 - h_prob - a_prob)

            # Normalize exact total to 100%
            tot = h_prob + d_prob + a_prob
            h_prob, d_prob, a_prob = round(h_prob / tot, 3), round(d_prob / tot, 3), round(a_prob / tot, 3)

            # Bookmaker Overround (4.2% margin)
            margin = 1.042
            odds_h = round(1.0 / (h_prob * margin), 2)
            odds_d = round(1.0 / (d_prob * margin), 2)
            odds_a = round(1.0 / (a_prob * margin), 2)

            pred_h, pred_a = calculate_projected_scoreline(h_prob, d_prob, a_prob, 1.5, 1.1, 1.4, 1.2)
            h_name = home.short_name or home.name
            a_name = away.short_name or away.name
            desc = generate_prediction_description(h_name, a_name, h_prob, d_prob, a_prob, pred_h, pred_a)

            m.ai_home_prob = h_prob
            m.ai_draw_prob = d_prob
            m.ai_away_prob = a_prob
            m.ai_predicted_home = pred_h
            m.ai_predicted_away = pred_a
            m.ai_confidence = max(h_prob, d_prob, a_prob)
            m.prediction_description = desc
            m.odds_home = odds_h
            m.odds_draw = odds_d
            m.odds_away = odds_a
            count += 1

        db.commit()
        print(f"Successfully updated continuous realistic bookmaker odds for all {count} matches!")

    finally:
        db.close()


if __name__ == "__main__":
    update_continuous_odds()
