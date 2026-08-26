"""
Monetization API — Phase 1 Foundation.

Routes:
  GET  /api/plans              — Public: list all available plans (from server config)
  GET  /api/subscription       — Auth: current user's subscription status
  GET  /api/payment/history    — Auth: current user's payment history (paginated)

  GET  /api/monetization/plans   — Legacy alias (kept for backward compat)
  GET  /api/monetization/status  — Legacy alias (kept for backward compat)
  POST /api/monetization/checkout — DISABLED until Phase 2 Flutterwave integration

SECURITY:
  - Premium status is computed server-side ONLY.
  - Plan prices are read from app/config/plans.py ONLY — never from client requests.
  - Payment history is strictly scoped to the authenticated user.
  - The checkout endpoint returns 501 to prevent free self-upgrades.
"""

import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.config.plans import get_plans_list, get_plan
from app.services.subscription_service import get_subscription_status, get_payment_history

logger = logging.getLogger(__name__)

router = APIRouter(tags=["monetization"])


# ══════════════════════════════════════════════
# PUBLIC ENDPOINTS
# ══════════════════════════════════════════════

@router.get("/api/plans")
def get_available_plans():
    """
    Returns all available subscription plans.
    Prices and features come from the server-side config — NEVER from client input.
    Safe to call without authentication (used on /pricing page).
    """
    return {"plans": get_plans_list()}


# ══════════════════════════════════════════════
# AUTHENTICATED ENDPOINTS
# ══════════════════════════════════════════════

@router.get("/api/subscription")
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user's current subscription status.
    Cross-user access is impossible — user_id always comes from JWT token.

    Free user example response:
      {"plan": "FREE", "status": "inactive", "is_premium": false, ...}

    Premium user example response:
      {"plan": "PRO_MONTHLY", "status": "ACTIVE", "is_premium": true, "end_date": "..."}
    """
    return get_subscription_status(current_user.id, db)


@router.get("/api/payment/history")
def get_my_payment_history(
    page: int = Query(1, ge=1, le=1000),
    per_page: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns paginated payment transaction history for the authenticated user ONLY.
    Sensitive fields (card numbers, PINs) are never stored and never returned.
    """
    return get_payment_history(current_user.id, db, page=page, per_page=per_page)


# ══════════════════════════════════════════════
# LEGACY ALIASES (backward compatibility)
# ══════════════════════════════════════════════

@router.get("/api/monetization/plans")
def get_monetization_plans_legacy():
    """Legacy alias — returns same data as /api/plans."""
    return {"plans": get_plans_list()}


@router.get("/api/monetization/status")
def get_monetization_status_legacy(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Legacy alias for /api/subscription.
    Also returns is_vip and vip_expires_at for backward compatibility with the
    existing frontend and dashboard code.
    """
    status = get_subscription_status(current_user.id, db)
    return {
        **status,
        # Legacy fields kept for backward compat with existing UI
        "is_vip":         status["is_premium"],
        "vip_expires_at": status.get("end_date"),
        "plan_name":      status.get("plan_name", "Standard Access"),
    }


# ══════════════════════════════════════════════
# PHASE 2 PLACEHOLDER — NOT YET IMPLEMENTED
# ══════════════════════════════════════════════

@router.post("/api/monetization/checkout")
def checkout_disabled(
    current_user: User = Depends(get_current_user),
):
    """
    PHASE 1: Checkout is intentionally disabled.

    The previous implementation granted premium access without any payment.
    This endpoint is disabled until Phase 2 connects it to Flutterwave.

    Phase 2 will:
      1. Create a PaymentTransaction record with status=PENDING
      2. Generate a Flutterwave payment link
      3. Return the payment URL to redirect the user
      4. Verify the payment via Flutterwave webhook before granting access
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error":   "payment_not_implemented",
            "message": "Online payment integration is coming soon. Flutterwave checkout will be available in the next update.",
            "phase":   "Phase 2 — Coming Soon",
        },
    )


# ══════════════════════════════════════════════
# FLUTTERWAVE CONFIGURATION STATUS (admin info)
# ══════════════════════════════════════════════

def _flutterwave_is_configured() -> bool:
    """
    Checks whether Flutterwave environment variables are present.
    Used only for admin/health visibility — never exposed publicly.
    Secret key is NEVER sent to the frontend.
    """
    secret_key = os.environ.get("FLUTTERWAVE_SECRET_KEY", "")
    return bool(secret_key and secret_key != "")
