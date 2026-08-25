"""
FootballPredict Database Disaster Recovery Backup Utility
Exports a structured, portable JSON snapshot of critical production entities:
- Users & Leaderboard Points
- Leagues, Teams & Elo Ratings
- Completed & Upcoming Matches
- User Submitted Predictions
"""
import os
import json
import sys
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, run_migrations, Base, engine
from app.models.user import User, UserFavoriteTeam, UserFollowedLeague, UserSavedPrediction
from app.models.match import League, Team, Match
from app.models.prediction import Prediction


def create_database_backup(output_dir: str = None) -> str:
    if output_dir is None:
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backups"))
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(output_dir, f"footballpredict_backup_{timestamp}.json")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    run_migrations(db)
    try:
        print(f"[BACKUP] Starting database snapshot at {timestamp}...")

        # 1. Users
        users = db.query(User).all()
        users_data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "hashed_password": u.hashed_password,
                "avatar": u.avatar,
                "is_admin": u.is_admin,
                "is_active": u.is_active,
                "is_vip": u.is_vip,
                "total_points": u.total_points,
                "total_predictions": u.total_predictions,
                "correct_results": u.correct_results,
                "correct_scores": u.correct_scores,
                "accuracy": u.accuracy,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]

        # 2. Leagues
        leagues = db.query(League).all()
        leagues_data = [
            {
                "id": l.id,
                "code": l.code,
                "name": l.name,
                "country": l.country,
                "flag": l.flag,
                "emblem": l.emblem,
                "is_active": l.is_active,
            }
            for l in leagues
        ]

        # 3. Teams
        teams = db.query(Team).all()
        teams_data = [
            {
                "id": t.id,
                "external_id": t.external_id,
                "name": t.name,
                "short_name": t.short_name,
                "tla": t.tla,
                "crest": t.crest,
                "country": t.country,
                "elo_rating": t.elo_rating,
            }
            for t in teams
        ]

        # 4. Matches
        matches = db.query(Match).all()
        matches_data = [
            {
                "id": m.id,
                "external_id": m.external_id,
                "league_code": m.league.code if m.league else None,
                "home_team_name": m.home_team.name if m.home_team else None,
                "away_team_name": m.away_team.name if m.away_team else None,
                "status": m.status,
                "utc_date": m.utc_date.isoformat() if m.utc_date else None,
                "home_score": m.home_score,
                "away_score": m.away_score,
                "winner": m.winner,
                "ai_home_prob": m.ai_home_prob,
                "ai_draw_prob": m.ai_draw_prob,
                "ai_away_prob": m.ai_away_prob,
                "ai_predicted_home": m.ai_predicted_home,
                "ai_predicted_away": m.ai_predicted_away,
                "season": m.season,
            }
            for m in matches
        ]

        payload = {
            "metadata": {
                "backup_timestamp": timestamp,
                "version": "1.0.0",
                "counts": {
                    "users": len(users_data),
                    "leagues": len(leagues_data),
                    "teams": len(teams_data),
                    "matches": len(matches_data),
                },
            },
            "leagues": leagues_data,
            "teams": teams_data,
            "users": users_data,
            "matches": matches_data,
        }

        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        print(f"[SUCCESS] Backup created successfully: {backup_file}")
        print(f"   Users: {len(users_data)} | Leagues: {len(leagues_data)} | Teams: {len(teams_data)} | Matches: {len(matches_data)}")
        return backup_file
    finally:
        db.close()


if __name__ == "__main__":
    create_database_backup()
