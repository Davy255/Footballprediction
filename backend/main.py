"""
FastAPI main application entry point.
"""
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Request, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, get_db
from app.models import Base
from app.api import auth, matches, predictions, leagues, leaderboard, admin, chat, user_personalization, monetization
from app.services.sync_service import (
    sync_all_competitions,
    sync_all_competitions_full_season,
    sync_all_competitions_today,
    sync_fast_global_matches,
    sync_live_matches_from_api,
    sync_recently_finished_matches,
    score_finished_predictions,
    auto_manage_live_matches,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def bootstrap_db():
    """Create all tables, safely migrate columns, and seed admin user + leagues."""
    Base.metadata.create_all(bind=engine)

    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.match import League
    from app.core.config import SUPPORTED_COMPETITIONS

    db = SessionLocal()
    try:
        # Safe schema column migrations for PostgreSQL / SQLite
        migrations = [
            # Existing user column migrations
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR DEFAULT '';",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_predictions INTEGER DEFAULT 0;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS correct_results INTEGER DEFAULT 0;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS correct_scores INTEGER DEFAULT 0;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy FLOAT DEFAULT 0.0;",
            # Phase 1 Monetization — subscription columns (tables created by create_all above)
            "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(256);",
            "ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS metadata_json TEXT;",
        ]
        for mig in migrations:
            try:
                db.execute(text(mig))
                db.commit()
            except Exception as me:
                db.rollback()
                logger.debug(f"Schema migration notice: {me}")

        # Create or update admin user
        admin_user = db.query(User).filter(
            (User.email == settings.ADMIN_EMAIL) | (User.username == settings.ADMIN_USERNAME)
        ).first()
        if not admin_user:
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Admin user created: {settings.ADMIN_USERNAME} ({settings.ADMIN_EMAIL})")
        else:
            admin_user.username = settings.ADMIN_USERNAME
            admin_user.email = settings.ADMIN_EMAIL
            admin_user.hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            admin_user.is_admin = True
            admin_user.is_active = True
            db.commit()
            logger.info(f"Admin user verified & updated: {settings.ADMIN_USERNAME} ({settings.ADMIN_EMAIL})")

        # Seed leagues
        for code, info in SUPPORTED_COMPETITIONS.items():
            if not db.query(League).filter(League.code == code).first():
                db.add(League(
                    code=code,
                    name=info["name"],
                    country=info["country"],
                    flag=info["flag"],
                ))
        db.commit()
        logger.info("Leagues seeded")
    except Exception as e:
        logger.error(f"Error during bootstrap_db: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    bootstrap_db()
    logger.info("Database ready")

    # Schedule high-frequency background sync jobs
    # 1. Ultra-Fast Global Match Sync (every 45s, single-request multi-league sync)
    scheduler.add_job(
        sync_fast_global_matches,
        "interval",
        seconds=45,
        id="sync_global_fast",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=30,
        next_run_time=datetime.now(),
    )
    # 2. Live API Polling for in-play scores (every 15s)
    scheduler.add_job(
        sync_live_matches_from_api,
        "interval",
        seconds=15,
        id="sync_live_api",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=15,
        next_run_time=datetime.now(),
    )
    # 3. Live Match Clock & Goal Simulation Engine (every 10s)
    scheduler.add_job(
        auto_manage_live_matches,
        "interval",
        seconds=10,
        id="live_poll",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=10,
        next_run_time=datetime.now(),
    )
    # 4. Targeted multi-competition deeper window sync (every 10 min)
    scheduler.add_job(
        sync_all_competitions_today,
        "interval",
        minutes=10,
        id="sync_today_matches",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=60,
    )
    # 5. Dedicated finished-match recovery sync (every 5 min)
    # Catches TIMED→FINISHED transitions missed during Render cold starts
    scheduler.add_job(
        sync_recently_finished_matches,
        "interval",
        minutes=5,
        id="sync_finished_recovery",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=120,
        next_run_time=datetime.now() + timedelta(seconds=15),
    )
    # 6. Full Season Deep Sync (runs 15s after startup, then every 12 hours)
    # Reduced from 6h to 12h to lower Render memory/API pressure
    scheduler.add_job(
        sync_all_competitions_full_season,
        "interval",
        hours=12,
        id="sync_full_season",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=120,
        next_run_time=datetime.now() + timedelta(seconds=15),
    )
    scheduler.add_job(
        score_finished_predictions,
        "interval",
        hours=1,
        id="score_preds",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=300,
    )
    
    from app.services.email_service import dispatch_daily_reminders_to_all_users
    scheduler.add_job(
        dispatch_daily_reminders_to_all_users,
        "cron",
        hour=8,
        minute=0,
        id="daily_match_reminders",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=600,
    )
    scheduler.start()
    logger.info("Scheduler started with daily match reminders job")

    yield

    # Shutdown
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")


app = FastAPI(
    title="Football Prediction API",
    description="Backend for the Football Prediction website",
    version="1.0.0",
    lifespan=lifespan,
)


# Request Performance & Diagnostic Logging Middleware
@app.middleware("http")
async def log_requests_performance(request: Request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    # Log slow requests (>500ms) or any server/client errors (status >= 400)
    if request.url.path not in ("/health", "/") and (duration_ms > 500 or response.status_code >= 400):
        logger.info(f"⚡ [{request.method}] {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response

# OWASP Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://footballprediction-lovat.vercel.app",
        "https://footballprediction.vercel.app",
        "https://footballprediction-vertex-digital3.vercel.app",
    ],
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(leagues.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)
app.include_router(chat.router)
app.include_router(user_personalization.router)
app.include_router(monetization.router)


@app.get("/")
def root():
    return {"message": "Football Prediction API is running 🏆", "version": "1.0.0"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Production Health Check Endpoint.
    Lightweight probe verifying API responsiveness and database connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unavailable"
        return Response(
            content='{"status": "degraded", "database": "unavailable"}',
            status_code=503,
            media_type="application/json",
        )

    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
