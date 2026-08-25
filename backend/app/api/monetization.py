from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/monetization", tags=["monetization"])


@router.get("/plans")
def get_subscription_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Standard Access",
                "price": 0,
                "interval": "forever",
                "description": "Essential football match forecasts and basic win probabilities.",
                "features": [
                    "Full 1X2 Win Probabilities",
                    "Projected Scorelines",
                    "Live Score Tracking & Visibility Throttling",
                    "Public Accuracy Audit Access",
                    "Football Analysis Articles & Content",
                    "Standard Community Leaderboard",
                ],
                "badge": "FREE",
                "is_popular": False,
            },
            {
                "id": "pro_monthly",
                "name": "VIP Pro Monthly",
                "price": 4.99,
                "interval": "month",
                "description": "Advanced statistical edge models and professional match analytics.",
                "features": [
                    "Everything in Free Tier",
                    "Potential Model Edge & Mathematical Expected Value (EV %)",
                    "Full 7x7 Bivariate Poisson Score Probability Heatmap",
                    "High-Confidence Filter Alerts",
                    "Historical Match Ledger Data Export (CSV)",
                    "100% Ad-Free Experience",
                    "VIP Community Supporter Badge",
                ],
                "badge": "MOST POPULAR",
                "is_popular": True,
            },
            {
                "id": "pro_yearly",
                "name": "VIP Pro Annual",
                "price": 39.99,
                "interval": "year",
                "discount": "Save 33%",
                "description": "Maximum value for serious football quantitative analysts and punters.",
                "features": [
                    "All VIP Pro Monthly Features",
                    "Priority Match Alert Notifications",
                    "Direct Coach AI Assistant Integration",
                    "Annual Performance Analytics Report",
                    "2 Months Free Included",
                ],
                "badge": "BEST VALUE",
                "is_popular": False,
            },
        ]
    }


@router.get("/status")
def get_monetization_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_active_vip = bool(current_user.is_vip)
    if current_user.vip_expires_at:
        now = datetime.now(timezone.utc)
        if current_user.vip_expires_at.tzinfo is None:
            # Handle naive datetime
            is_active_vip = current_user.vip_expires_at > datetime.utcnow()
        else:
            is_active_vip = current_user.vip_expires_at > now

    return {
        "is_vip": is_active_vip,
        "vip_expires_at": current_user.vip_expires_at.isoformat() if current_user.vip_expires_at else None,
        "plan_name": "VIP Pro" if is_active_vip else "Standard Access",
    }


@router.post("/checkout")
def create_checkout_session(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan_id = payload.get("plan_id", "pro_monthly")
    if plan_id not in ["pro_monthly", "pro_yearly"]:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    # In production with Stripe/Paddle/LemonSqueezy, this returns a provider-hosted checkout URL.
    # For instant verified demo activation:
    duration_days = 365 if plan_id == "pro_yearly" else 30
    current_user.is_vip = True
    current_user.vip_expires_at = datetime.now(timezone.utc) + timedelta(days=duration_days)
    db.commit()
    db.refresh(current_user)

    return {
        "status": "success",
        "message": f"Successfully upgraded to {plan_id.replace('_', ' ').title()}!",
        "is_vip": True,
        "vip_expires_at": current_user.vip_expires_at.isoformat(),
    }
