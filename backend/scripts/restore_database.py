"""
FootballPredict Database Disaster Recovery Restore Utility
Safely restores critical tables from a snapshot JSON file.
"""
import os
import json
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine, run_migrations
from app.models.user import User
from app.models.match import League, Team, Match
from app.models.prediction import Prediction


def restore_database(backup_file_path: str):
    if not os.path.exists(backup_file_path):
        print(f"[ERROR] Backup file not found: {backup_file_path}")
        return False

    print(f"[RESTORE] Starting restoration from {backup_file_path}...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    run_migrations(db)

    try:
        with open(backup_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        meta = data.get("metadata", {})
        print(f"[RESTORE] Snapshot Metadata: {meta.get('backup_timestamp')} (Counts: {meta.get('counts')})")

        # 1. Restore Leagues
        for l_data in data.get("leagues", []):
            league = db.query(League).filter(League.code == l_data["code"]).first()
            if not league:
                league = League(
                    code=l_data["code"],
                    name=l_data["name"],
                    country=l_data.get("country", ""),
                    flag=l_data.get("flag", "🌍"),
                    emblem=l_data.get("emblem", ""),
                    is_active=l_data.get("is_active", True),
                )
                db.add(league)
        db.commit()

        # 2. Restore Teams
        for t_data in data.get("teams", []):
            team = db.query(Team).filter(Team.external_id == t_data["external_id"]).first()
            if not team:
                team = Team(
                    external_id=t_data["external_id"],
                    name=t_data["name"],
                    short_name=t_data.get("short_name", ""),
                    tla=t_data.get("tla", ""),
                    crest=t_data.get("crest", ""),
                    country=t_data.get("country", ""),
                    elo_rating=t_data.get("elo_rating", 1500.0),
                )
                db.add(team)
            else:
                team.elo_rating = t_data.get("elo_rating", team.elo_rating)
        db.commit()

        print("[SUCCESS] Restoration completed cleanly.")
        return True
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Restoration failed: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        restore_database(sys.argv[1])
    else:
        backup_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backups"))
        if os.path.exists(backup_dir):
            files = sorted([os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.endswith(".json")])
            if files:
                restore_database(files[-1])
            else:
                print("[RESTORE] No backup file found to restore.")
        else:
            print("[RESTORE] Backup directory does not exist.")
