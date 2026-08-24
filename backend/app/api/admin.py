import os
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.match import League, Match, Team
from app.models.prediction import Prediction
from app.services.sync_service import sync_all_competitions, score_finished_predictions
from app.services.ml_predictor import generate_prediction_description, calculate_projected_scoreline

logger = logging.getLogger("security.audit")

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminOddsUpdate(BaseModel):
    odds_home: float
    odds_draw: float
    odds_away: float


@router.get("/users")
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "total_points": u.total_points,
            "total_predictions": u.total_predictions,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.post("/users/{user_id}/toggle-admin")
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    logger.warning(
        f"AUDIT: Admin '{admin_user.username}' (ID: {admin_user.id}) changed admin status for user '{user.username}' (ID: {user.id}) to {user.is_admin}"
    )
    return {"detail": f"User {user.username} admin status: {user.is_admin}"}


@router.post("/users/{user_id}/toggle-active")
def toggle_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    logger.warning(
        f"AUDIT: Admin '{admin_user.username}' (ID: {admin_user.id}) changed active status for user '{user.username}' (ID: {user.id}) to {user.is_active}"
    )
    return {"detail": f"User {user.username} active status: {user.is_active}"}


@router.put("/matches/{match_id}/odds")
def update_match_odds(
    match_id: int,
    payload: AdminOddsUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Allows administrators to set exact Bet365/Pinnacle bookmaker odds in real-time."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.odds_home = payload.odds_home
    match.odds_draw = payload.odds_draw
    match.odds_away = payload.odds_away

    # Derive exact implied probabilities from bookmaker odds
    raw_h = 1.0 / max(0.01, payload.odds_home)
    raw_d = 1.0 / max(0.01, payload.odds_draw)
    raw_a = 1.0 / max(0.01, payload.odds_away)
    tot = raw_h + raw_d + raw_a

    h_prob = round(raw_h / tot, 3)
    d_prob = round(raw_d / tot, 3)
    a_prob = round(raw_a / tot, 3)

    match.ai_home_prob = h_prob
    match.ai_draw_prob = d_prob
    match.ai_away_prob = a_prob
    match.ai_confidence = max(h_prob, d_prob, a_prob)

    pred_h, pred_a = calculate_projected_scoreline(h_prob, d_prob, a_prob, 1.5, 1.1, 1.4, 1.2)
    match.ai_predicted_home = pred_h
    match.ai_predicted_away = pred_a

    home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
    away_team = db.query(Team).filter(Team.id == match.away_team_id).first()

    if home_team and away_team:
        h_name = home_team.short_name or home_team.name
        a_name = away_team.short_name or away_team.name
        match.prediction_description = generate_prediction_description(
            h_name, a_name, h_prob, d_prob, a_prob, pred_h, pred_a
        )

    db.commit()
    return {
        "detail": f"Updated odds for match {match.id}: {payload.odds_home} - {payload.odds_draw} - {payload.odds_away}",
        "odds_home": match.odds_home,
        "odds_draw": match.odds_draw,
        "odds_away": match.odds_away,
        "ai_home_prob": match.ai_home_prob,
        "ai_draw_prob": match.ai_draw_prob,
        "ai_away_prob": match.ai_away_prob,
    }


@router.post("/sync")
def trigger_sync(
    background_tasks: BackgroundTasks,
    _=Depends(get_current_admin),
):
    background_tasks.add_task(sync_all_competitions)
    return {"detail": "Sync started in background"}


@router.post("/sync-odds")
def trigger_odds_sync(
    background_tasks: BackgroundTasks,
    _=Depends(get_current_admin),
):
    from app.services.odds_api_service import sync_all_live_odds
    background_tasks.add_task(sync_all_live_odds)
    return {"detail": "Live bookmaker odds sync started in background"}


@router.post("/score-predictions")
def trigger_scoring(
    background_tasks: BackgroundTasks,
    _=Depends(get_current_admin),
):
    background_tasks.add_task(score_finished_predictions)
    return {"detail": "Scoring started in background"}


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    scheduled_count = db.query(Match).filter(Match.status.in_(["SCHEDULED", "TIMED", "POSTPONED"])).count()
    finished_count = db.query(Match).filter(Match.status.in_(["FINISHED", "AWARDED"])).count()
    live_count = db.query(Match).filter(Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME"])).count()

    import os
    resend_env = os.environ.get("RESEND_API_KEY", "").strip() or getattr(settings, "RESEND_API_KEY", "").strip()
    brevo_env = os.environ.get("BREVO_API_KEY", "").strip() or getattr(settings, "BREVO_API_KEY", "").strip()
    smtp_is_configured = bool(resend_env or brevo_env or (getattr(settings, "SMTP_HOST", "") and getattr(settings, "SMTP_USER", "")))
    smtp_host_val = "Resend HTTPS API" if resend_env else "Brevo HTTPS API" if brevo_env else getattr(settings, "SMTP_HOST", "") or "Disabled (Dev Mode)"

    return {
        "total_users": db.query(User).count(),
        "total_matches": db.query(Match).count(),
        "total_predictions": db.query(Prediction).count(),
        "scheduled_matches": scheduled_count,
        "finished_matches": finished_count,
        "live_matches": live_count,
        "leagues": db.query(League).count(),
        "smtp_configured": smtp_is_configured,
        "smtp_host": smtp_host_val,
    }


class TestEmailRequest(BaseModel):
    to_email: str
    email_type: str = "welcome"  # "welcome" | "reminder" | "reset"


@router.post("/test-email")
def test_send_email(
    payload: TestEmailRequest,
    _=Depends(get_current_admin),
):
    """
    Sends a test email to verify email provider configuration and live delivery.
    """
    try:
        from app.services.email_service import (
            send_welcome_email,
            send_password_reset_email,
            send_daily_match_reminder_email,
            get_last_email_error,
        )
        
        target_email = payload.to_email.strip().lower()
        if not target_email or "@" not in target_email:
            raise HTTPException(status_code=400, detail="Invalid email address provided.")

        if payload.email_type == "welcome":
            success = send_welcome_email(target_email, username="Valued Member")
        elif payload.email_type == "reminder":
            success = send_daily_match_reminder_email(target_email, username="Valued Member")
        elif payload.email_type == "reset":
            success = send_password_reset_email(target_email, reset_token="test-token-12345", username="Valued Member")
        else:
            raise HTTPException(status_code=400, detail=f"Unknown email type: '{payload.email_type}'. Use 'welcome', 'reminder', or 'reset'.")

        resend_env = os.environ.get("RESEND_API_KEY", "").strip() or getattr(settings, "RESEND_API_KEY", "").strip()
        brevo_env = os.environ.get("BREVO_API_KEY", "").strip() or getattr(settings, "BREVO_API_KEY", "").strip()
        active_mode = "Resend HTTPS API" if resend_env else "Brevo HTTPS API" if brevo_env else f"Live SMTP ({settings.SMTP_HOST})" if settings.SMTP_HOST else "Development Log Mode"

        if not success:
            err_detail = get_last_email_error() or "Email dispatch failed"
            return {
                "success": False,
                "recipient": target_email,
                "email_type": payload.email_type,
                "mode": active_mode,
                "message": f"❌ Email delivery failed via {active_mode}: {err_detail}",
            }

        return {
            "success": True,
            "recipient": target_email,
            "email_type": payload.email_type,
            "mode": active_mode,
            "message": f"✅ Email successfully delivered to {target_email} via {active_mode}!",
        }
    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Error in test_send_email: {tb}")
        return {
            "success": False,
            "recipient": getattr(payload, "to_email", ""),
            "email_type": getattr(payload, "email_type", "welcome"),
            "mode": "Exception",
            "message": f"❌ Server exception: {str(exc)}",
        }


@router.post("/trigger-daily-reminders")
def trigger_daily_reminders(
    background_tasks: BackgroundTasks,
    _=Depends(get_current_admin),
):
    """
    Dispatches today's match reminder emails to all registered active users.
    """
    from app.services.email_service import dispatch_daily_reminders_to_all_users
    background_tasks.add_task(dispatch_daily_reminders_to_all_users)
    return {"detail": "Daily match reminder dispatch initiated in background."}

