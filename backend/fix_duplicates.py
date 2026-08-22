"""
Fix: Remove all stale placeholder matches (NULL external_id) in batches to
avoid SQLite's variable limit. Then verify cleanup.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.models.match import Match
from app.models.prediction import Prediction

db = SessionLocal()

try:
    null_count = db.query(Match).filter(Match.external_id == None).count()
    print("Placeholder matches to remove (NULL external_id):", null_count)

    # Use raw SQL for efficiency with large datasets - SQLite handles this fine
    from sqlalchemy import text

    # Step 1: Delete predictions linked to NULL external_id matches
    print("Deleting linked predictions...")
    db.execute(text("""
        DELETE FROM predictions
        WHERE match_id IN (
            SELECT id FROM matches WHERE external_id IS NULL
        )
    """))
    db.commit()
    print("  Predictions cleaned.")

    # Step 2: Delete the fake matches directly
    print("Deleting placeholder matches...")
    result = db.execute(text("DELETE FROM matches WHERE external_id IS NULL"))
    db.commit()
    print("  Deleted:", result.rowcount, "placeholder matches.")

    # Verify
    remaining = db.query(Match).count()
    finished = db.query(Match).filter(Match.status == "FINISHED").count()
    scheduled = db.query(Match).filter(Match.status.in_(["SCHEDULED","TIMED"])).count()
    live = db.query(Match).filter(Match.status.in_(["IN_PLAY","PAUSED","HALFTIME","LIVE"])).count()
    null_left = db.query(Match).filter(Match.external_id == None).count()

    print()
    print("=== AFTER CLEANUP ===")
    print("Total real matches:", remaining)
    print("NULL external_id remaining:", null_left)
    print("FINISHED:", finished)
    print("SCHEDULED/TIMED:", scheduled)
    print("LIVE:", live)

except Exception as e:
    db.rollback()
    print("ERROR:", e)
    import traceback; traceback.print_exc()
finally:
    db.close()
