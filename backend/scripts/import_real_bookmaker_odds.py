"""
Hyper-fast script to import 100% REAL Bookmaker Odds (Bet365, Pinnacle, Bwin, Market Average)
from historical datasets into SQLite matches database.
Run: py scripts/import_real_bookmaker_odds.py
"""
import os
import sys
import glob
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.match import Match, Team

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "../data/raw")


def import_odds_fast():
    db = SessionLocal()
    try:
        csv_files = glob.glob(os.path.join(RAW_DATA_DIR, "*.csv"))
        print(f"Fast importing real Bet365/Pinnacle odds from {len(csv_files)} CSV files...")

        # Load team lookup
        teams = {t.name.lower().strip(): t.id for t in db.query(Team).all()}

        # Load all finished matches into lookup dictionary
        print("Caching matches lookup...")
        finished_matches = db.query(Match).filter(Match.status == "FINISHED", Match.home_score != None).all()
        matches_dict = {}
        for m in finished_matches:
            key = (m.home_team_id, m.away_team_id, m.home_score, m.away_score)
            matches_dict[key] = m

        updated_count = 0

        for fpath in csv_files:
            try:
                df = pd.read_csv(fpath, encoding="latin1")
                if "HomeTeam" not in df.columns or "AwayTeam" not in df.columns or "FTHG" not in df.columns:
                    continue

                for _, row in df.iterrows():
                    h_name = str(row.get("HomeTeam", "")).strip().lower()
                    a_name = str(row.get("AwayTeam", "")).strip().lower()

                    h_id = teams.get(h_name)
                    a_id = teams.get(a_name)

                    if not h_id or not a_id:
                        continue

                    odds_h = None
                    odds_d = None
                    odds_a = None

                    for h_col, d_col, a_col in [
                        ("B365H", "B365D", "B365A"),  # Bet365
                        ("PSH", "PSD", "PSA"),        # Pinnacle Sports
                        ("AvgH", "AvgD", "AvgA"),    # Market Average
                        ("BWH", "BWD", "BWA"),        # Bwin
                        ("WHH", "WHD", "WHA"),        # William Hill
                    ]:
                        if h_col in row and pd.notnull(row[h_col]) and row[h_col] > 1.0:
                            odds_h = float(row[h_col])
                            odds_d = float(row[d_col])
                            odds_a = float(row[a_col])
                            break

                    if odds_h and odds_d and odds_a:
                        try:
                            h_score = int(row["FTHG"])
                            a_score = int(row["FTAG"])
                        except Exception:
                            continue

                        key = (h_id, a_id, h_score, a_score)
                        m = matches_dict.get(key)

                        if m:
                            m.odds_home = odds_h
                            m.odds_draw = odds_d
                            m.odds_away = odds_a
                            updated_count += 1

            except Exception:
                pass

        db.commit()
        print(f"Successfully updated real bookmaker odds for {updated_count} matches in DB!")

    finally:
        db.close()


if __name__ == "__main__":
    import_odds_fast()
