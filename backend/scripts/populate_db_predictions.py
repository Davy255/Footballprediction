"""
Fast Script to pre-calculate and store unique predictions & betting odds for all matches in SQLite DB.
Run: py scripts/populate_db_predictions.py
"""
import os
import sys
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.match import Match, Team
from app.services.ml_predictor import calculate_projected_scoreline, generate_prediction_description, calculate_odds


def populate_fast():
    db = SessionLocal()
    try:
        print("Pre-computing team stats and Elo ratings...")
        finished_matches = (
            db.query(Match)
            .filter(Match.status == "FINISHED", Match.home_score != None, Match.away_score != None)
            .order_by(Match.utc_date.asc())
            .all()
        )

        team_stats = {}
        for m in finished_matches:
            h_id, a_id = m.home_team_id, m.away_team_id
            if h_id not in team_stats: team_stats[h_id] = {"elo": 1500.0, "scored": [], "conceded": [], "pts": []}
            if a_id not in team_stats: team_stats[a_id] = {"elo": 1500.0, "scored": [], "conceded": [], "pts": []}

            h_s, a_s = m.home_score, m.away_score
            h_pts = 3 if m.winner == "HOME_TEAM" else 1 if m.winner == "DRAW" else 0
            a_pts = 3 if m.winner == "AWAY_TEAM" else 1 if m.winner == "DRAW" else 0

            team_stats[h_id]["scored"].append(h_s)
            team_stats[h_id]["conceded"].append(a_s)
            team_stats[h_id]["pts"].append(h_pts)

            team_stats[a_id]["scored"].append(a_s)
            team_stats[a_id]["conceded"].append(h_s)
            team_stats[a_id]["pts"].append(a_pts)

            # Elo
            h_elo, a_elo = team_stats[h_id]["elo"], team_stats[a_id]["elo"]
            s_h = 1.0 if h_pts == 3 else 0.5 if h_pts == 1 else 0.0
            e_h = 1.0 / (1.0 + 10.0 ** ((a_elo - h_elo - 50.0) / 400.0))
            k = 32.0
            team_stats[h_id]["elo"] = h_elo + k * (s_h - e_h)
            team_stats[a_id]["elo"] = a_elo + k * ((1.0 - s_h) - (1.0 - e_h))

        def get_team_metrics(t_id):
            st = team_stats.get(t_id, {"elo": 1500.0, "scored": [1.4], "conceded": [1.1]})
            gf = float(np.mean(st["scored"][-5:])) if st["scored"] else 1.4
            ga = float(np.mean(st["conceded"][-5:])) if st["conceded"] else 1.1
            return st["elo"], gf, ga

        teams_dict = {t.id: t for t in db.query(Team).all()}
        scheduled = db.query(Match).all()
        print(f"Assigning pre-calculated predictions & odds to {len(scheduled)} matches...")

        for m in scheduled:
            home = teams_dict.get(m.home_team_id)
            away = teams_dict.get(m.away_team_id)
            if not home or not away: continue

            h_elo, h_gf, h_ga = get_team_metrics(home.id)
            a_elo, a_gf, a_ga = get_team_metrics(away.id)

            elo_diff = h_elo - a_elo + 60.0
            h_prob = 1.0 / (1.0 + 10.0 ** (-elo_diff / 400.0))
            a_prob = 1.0 / (1.0 + 10.0 ** (elo_diff / 400.0))
            d_prob = max(0.18, 1.0 - h_prob - a_prob + 0.12)
            tot = h_prob + d_prob + a_prob
            h_prob, d_prob, a_prob = round(h_prob/tot, 3), round(d_prob/tot, 3), round(a_prob/tot, 3)

            pred_h, pred_a = calculate_projected_scoreline(h_prob, d_prob, a_prob, h_gf, h_ga, a_gf, a_ga)
            odds_h, odds_d, odds_a = calculate_odds(h_prob, d_prob, a_prob)
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

        db.commit()
        print(f"Successfully pre-calculated predictions and betting odds for all {len(scheduled)} matches!")

    finally:
        db.close()


if __name__ == "__main__":
    populate_fast()
