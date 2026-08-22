"""
Full Season Data Sync Script
Run to populate the database with ALL 2026/2027 season fixtures and results.
Excludes friendly/pre-season matches.

Usage:
    cd backend
    python scripts/sync_data.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.sync_service import sync_all_competitions_full_season, score_finished_predictions
from app.core.database import engine
from app.models import Base

if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Syncing ALL 2026/2027 season matches from football-data.org (no friendlies)...")
    sync_all_competitions_full_season(season_year=2026)
    print("Scoring any finished predictions...")
    score_finished_predictions()
    print("Done! Full 2026/2027 season sync complete.")
