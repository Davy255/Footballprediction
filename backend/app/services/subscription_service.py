"""
Subscription Service — Server-Side Business Logic.

All premium access decisions are made HERE, server-side only.
The frontend NEVER determines premium status — it only displays what this service returns.

Key rules enforced:
  1. is_premium_user() computes access from the DB — ignoring any client-sent flags.
  2. Expiry is checked at query time — no background job needed to revoke access.
  3. require_premium() raises HTTP 403 for free users — protects future premium routes.
  4. Cross-user access is impossible — all queries filter by user_id from JWT token.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.subscription import Subscription, PaymentTransaction, SubscriptionStatus, PaymentStatus
from app.models.user import User
from app.config.plans import get_plan, PLAN_FREE

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Core Premium Access Helpers
# ──────────────────────────────────────────────

def get_active_subscription(user_id: int, db: Session) -> Optional[Subscription]:
    """
    Returns the user's currently active subscription, or None.

    Effective status is computed at query time:
      - DB status must be ACTIVE
      - end_date must be in the future (or None for lifetime plans)
    This means no background job is needed to detect expiry.
    """
    now = datetime.now(timezone.utc)
    sub = (
        db.query(Subscription)
        .filter(
            and_(
                Subscription.user_id == user_id,
                Subscription.status == SubscriptionStatus.ACTIVE,
            )
        )
        .order_by(Subscription.end_date.desc())
        .first()
    )

    if sub is None:
        return None

    # Effective expiry check — end_date=None means no expiry (lifetime, free)
    if sub.end_date is not None:
        end = sub.end_date
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if end <= now:
            # Lazily persist the EXPIRED status (lightweight, no background job required)
            _mark_subscription_expired(sub, db)
            return None

    return sub


def is_premium_user(user_id: int, db: Session) -> bool:
    """
    Server-side premium gate. Returns True only if:
      - An ACTIVE subscription exists
      - Its end_date is in the future

    This is the ONLY authoritative source of premium status.
    Never trust is_vip from user input or client-sent flags.
    """
    # Also check legacy is_vip field for backward compatibility with existing VIP users
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.is_vip and user.vip_expires_at:
        vip_exp = user.vip_expires_at
        if vip_exp.tzinfo is None:
            vip_exp = vip_exp.replace(tzinfo=timezone.utc)
        if vip_exp > datetime.now(timezone.utc):
            return True

    return get_active_subscription(user_id, db) is not None


def get_subscription_status(user_id: int, db: Session) -> dict:
    """
    Returns the full subscription status dict for API exposure.
    Safe for public API response — no sensitive fields included.
    """
    sub = get_active_subscription(user_id, db)

    if sub is None:
        # Check legacy VIP
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_vip and user.vip_expires_at:
            vip_exp = user.vip_expires_at
            if vip_exp.tzinfo is None:
                vip_exp = vip_exp.replace(tzinfo=timezone.utc)
            if vip_exp > datetime.now(timezone.utc):
                plan_info = get_plan("PRO_MONTHLY") or {}
                return {
                    "plan":       "PRO_MONTHLY",
                    "plan_name":  plan_info.get("name", "VIP Pro"),
                    "status":     "ACTIVE",
                    "is_premium": True,
                    "start_date": None,
                    "end_date":   vip_exp.isoformat(),
                    "source":     "legacy_vip",
                }

        return {
            "plan":       PLAN_FREE,
            "plan_name":  "Standard Access",
            "status":     "inactive",
            "is_premium": False,
            "start_date": None,
            "end_date":   None,
            "source":     "none",
        }

    plan_info = get_plan(sub.plan_id) or {}
    return {
        "plan":       sub.plan_id,
        "plan_name":  plan_info.get("name", sub.plan_id),
        "status":     sub.status,
        "is_premium": True,
        "start_date": sub.start_date.isoformat() if sub.start_date else None,
        "end_date":   sub.end_date.isoformat() if sub.end_date else None,
        "source":     "subscription",
    }


def require_premium(user: User, db: Session) -> None:
    """
    Dependency for future premium-only routes.
    Raises HTTP 403 if the user does not have an active premium subscription.

    Usage in a route:
        @router.get("/premium-feature")
        def premium_feature(current_user = Depends(get_current_user), db = Depends(get_db)):
            require_premium(current_user, db)
            ...
    """
    if not is_premium_user(user.id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error":   "premium_required",
                "message": "This feature requires a VIP Pro subscription.",
                "upgrade": "/pricing",
            },
        )


# ──────────────────────────────────────────────
# Payment History
# ──────────────────────────────────────────────

def get_payment_history(user_id: int, db: Session, page: int = 1, per_page: int = 20) -> dict:
    """
    Returns paginated payment transaction history for a specific user ONLY.
    Cross-user access is impossible — user_id always comes from JWT token.
    """
    per_page = min(per_page, 50)  # hard cap at 50 to protect memory
    offset = (page - 1) * per_page

    total = db.query(PaymentTransaction).filter(PaymentTransaction.user_id == user_id).count()
    txns = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.user_id == user_id)
        .order_by(PaymentTransaction.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return {
        "page":     page,
        "per_page": per_page,
        "total":    total,
        "transactions": [_serialize_transaction(t) for t in txns],
    }


def _serialize_transaction(txn: PaymentTransaction) -> dict:
    """Safe serialization — never expose raw metadata_json to client."""
    return {
        "id":                 txn.id,
        "plan_id":            txn.plan_id,
        "amount_kes":         float(txn.amount_kes) if txn.amount_kes else 0.0,
        "currency":           txn.currency,
        "status":             txn.status,
        "provider":           txn.provider,
        "provider_reference": txn.provider_reference,
        "created_at":         txn.created_at.isoformat() if txn.created_at else None,
    }


# ──────────────────────────────────────────────
# Internal Helpers
# ──────────────────────────────────────────────

def _mark_subscription_expired(sub: Subscription, db: Session) -> None:
    """Lazily marks an expired subscription as EXPIRED in the DB."""
    try:
        sub.status = SubscriptionStatus.EXPIRED
        db.commit()
        logger.info(f"Subscription {sub.id} for user {sub.user_id} marked EXPIRED.")
    except Exception as e:
        db.rollback()
        logger.warning(f"Could not update subscription {sub.id} to EXPIRED: {e}")
