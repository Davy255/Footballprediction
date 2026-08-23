"""
FastAPI main application entry point.
"""
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.api import auth, matches, predictions, leagues, leaderboard, admin, chat
from app.services.sync_service import (
    sync_all_competitions,
    sync_all_competitions_full_season,
    sync_live_matches_from_api,
    score_finished_predictions,
    auto_manage_live_matches,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def bootstrap_db():
    """Create all tables and seed admin user + leagues."""
    Base.metadata.create_all(bind=engine)

    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.match import League
    from app.core.config import SUPPORTED_COMPETITIONS

    db = SessionLocal()
    try:
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
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    bootstrap_db()
    logger.info("Database ready")

    # Schedule background jobs
    # Full-season sync: run immediately on startup (in background) then every 6 hours
    scheduler.add_job(
        sync_all_competitions_full_season,
        "interval",
        hours=6,
        id="sync_full_season",
        next_run_time=datetime.now(),  # run immediately on startup
    )
    # Live API sync: automatically polls all in-play/halftime matches from API every 30 seconds
    scheduler.add_job(
        sync_live_matches_from_api,
        "interval",
        seconds=30,
        id="sync_live_api",
        next_run_time=datetime.now(),
    )
    # Live match state progression: manage minute/state every 5 seconds
    scheduler.add_job(auto_manage_live_matches, "interval", seconds=5, id="live_poll")
    # Score finished predictions every hour
    scheduler.add_job(score_finished_predictions, "interval", hours=1, id="score_preds")
    # Daily match digest & reminders: scheduled daily at 08:00 UTC
    from app.services.email_service import dispatch_daily_reminders_to_all_users
    scheduler.add_job(dispatch_daily_reminders_to_all_users, "cron", hour=8, minute=0, id="daily_match_reminders")
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


@app.get("/")
def root():
    return {"message": "Football Prediction API is running 🏆", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
