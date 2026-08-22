"""
Script to download 30+ years of historical football match CSVs (1993 - 2026)
from football-data.co.uk and import them into the database.
Run: py scripts/download_historical_csvs.py
"""
import os
import sys
import time
import requests
import io
import pandas as pd
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal, engine
from app.models import Base, League, Team, Match
from app.core.config import SUPPORTED_COMPETITIONS

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "../data/raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

# Division code to DB League Code mapping
DIV_MAP = {
    "E0": "PL",    # Premier League
    "E1": "ELC",   # Championship
    "SP1": "PD",   # La Liga
    "D1": "BL1",   # Bundesliga
    "I1": "SA",    # Serie A
    "F1": "FL1",   # Ligue 1
    "N1": "DED",   # Eredivisie
    "P1": "PPL",   # Primeira Liga
}

# Generate season strings from 1993/94 to 2025/26
def get_season_codes():
    seasons = []
    for year in range(1993, 2026):
        y1 = str(year)[-2:]
        y2 = str(year + 1)[-2:]
        seasons.append(f"{y1}{y2}")
    return seasons


def parse_date(date_str: str) -> datetime:
    if not isinstance(date_str, str) or not date_str.strip():
        return datetime.now(timezone.utc)
    date_str = date_str.strip()

    formats = [
        "%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d", "%d-%m-%Y", "%d-%m-%y"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return datetime.now(timezone.utc)


def download_and_import():
    db = SessionLocal()
    try:
        seasons = get_season_codes()
        print(f"Downloading historical datasets across {len(seasons)} seasons (1993 to 2026)...")

        total_downloaded = 0
        total_matches_added = 0

        # Build lookup dicts for existing teams and leagues
        leagues = {l.code: l for l in db.query(League).all()}

        # Teams lookup by lowercase name
        team_cache = {}
        for t in db.query(Team).all():
            team_cache[t.name.lower()] = t

        def get_or_create_team_by_name(name: str) -> Team:
            name_clean = name.strip()
            key = name_clean.lower()
            if key in team_cache:
                return team_cache[key]
            
            # Create synthetic team
            ext_id = abs(hash(key)) % 10000000
            t = Team(
                external_id=ext_id,
                name=name_clean,
                short_name=name_clean[:15],
                tla=name_clean[:3].upper(),
            )
            db.add(t)
            db.commit()
            db.refresh(t)
            team_cache[key] = t
            return t

        for season in seasons:
            s_formatted = f"20{season[:2]}/20{season[2:]}" if int(season[:2]) < 90 else f"19{season[:2]}/19{season[2:]}"
            
            for div, league_code in DIV_MAP.items():
                if league_code not in leagues:
                    continue

                url = f"https://www.football-data.co.uk/mmz4281/{season}/{div}.csv"
                save_filename = os.path.join(RAW_DATA_DIR, f"{season}_{div}.csv")

                try:
                    resp = requests.get(url, timeout=10)
                    if resp.status_code != 200:
                        continue

                    with open(save_filename, "wb") as f:
                        f.write(resp.content)

                    # Read CSV
                    df = pd.read_csv(io.BytesIO(resp.content), encoding="latin1")
                    if df.empty or "HomeTeam" not in df.columns or "FTHG" not in df.columns:
                        continue

                    # Filter valid matches
                    df = df.dropna(subset=["HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"])

                    league_obj = leagues[league_code]
                    matches_in_csv = 0

                    for _, row in df.iterrows():
                        home_name = str(row["HomeTeam"]).strip()
                        away_name = str(row["AwayTeam"]).strip()

                        if not home_name or not away_name:
                            continue

                        home_team = get_or_create_team_by_name(home_name)
                        away_team = get_or_create_team_by_name(away_name)

                        try:
                            h_goals = int(row["FTHG"])
                            a_goals = int(row["FTAG"])
                        except (ValueError, TypeError):
                            continue

                        ftr = str(row["FTR"]).strip().upper()
                        winner = "HOME_TEAM" if ftr == "H" else "AWAY_TEAM" if ftr == "A" else "DRAW"

                        match_dt = parse_date(str(row.get("Date", "")))

                        # Check if match already exists
                        existing = (
                            db.query(Match)
                            .filter(
                                Match.league_id == league_obj.id,
                                Match.home_team_id == home_team.id,
                                Match.away_team_id == away_team.id,
                                Match.utc_date == match_dt,
                            )
                            .first()
                        )

                        if not existing:
                            m = Match(
                                league_id=league_obj.id,
                                home_team_id=home_team.id,
                                away_team_id=away_team.id,
                                status="FINISHED",
                                utc_date=match_dt,
                                home_score=h_goals,
                                away_score=a_goals,
                                winner=winner,
                                season=s_formatted,
                            )
                            db.add(m)
                            matches_in_csv += 1
                            total_matches_added += 1

                    db.commit()
                    total_downloaded += 1
                    print(f"Loaded {season} ({div}): {matches_in_csv} new matches imported.")

                except Exception as e:
                    pass

        print(f"\nCompleted! Downloaded {total_downloaded} CSV files and imported {total_matches_added} new historical matches.")

    finally:
        db.close()


if __name__ == "__main__":
    download_and_import()
