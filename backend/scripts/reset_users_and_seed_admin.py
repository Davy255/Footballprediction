"""
Script to wipe all existing users and predictions, and seed the new admin account.
Admin:
  Username: Wes@254
  Email: davidwesonga776@gmail.com
  Password: @David2211.
"""
import sys
import os

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.prediction import Prediction
from app.core.config import settings

def reset_and_seed_admin():
    db = SessionLocal()
    try:
        print("[1/3] Removing all existing user predictions...")
        deleted_preds = db.query(Prediction).delete()
        print(f"      Deleted {deleted_preds} predictions.")

        print("[2/3] Removing all existing users from the system...")
        deleted_users = db.query(User).delete()
        print(f"      Deleted {deleted_users} users.")

        db.commit()

        # Seed new admin user
        admin_username = "Wes@254"
        admin_email = "davidwesonga776@gmail.com"
        admin_password = "@David2211."

        print(f"[3/3] Seeding new admin account: {admin_username} ({admin_email})...")
        new_admin = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            is_admin=True,
            is_active=True,
            total_points=0,
            total_predictions=0,
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)

        print(f"SUCCESS: Admin created! ID: {new_admin.id}, Username: {new_admin.username}, Email: {new_admin.email}, IsAdmin: {new_admin.is_admin}")

    except Exception as e:
        db.rollback()
        print(f"ERROR during reset: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed_admin()
