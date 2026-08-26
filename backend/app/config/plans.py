"""
Premium Plan Configuration — Single Source of Truth.

All plan pricing, durations, and feature metadata lives here.
The backend ALWAYS reads prices from this file.
The frontend NEVER dictates pricing — it only receives plan info from /api/plans.

Prices are in KES (Kenyan Shillings) for Flutterwave integration.
To adjust pricing, change ONLY this file.
"""

from typing import Optional

# ──────────────────────────────────────────────
# Plan IDs — use these constants everywhere
# ──────────────────────────────────────────────
PLAN_FREE          = "FREE"
PLAN_PRO_MONTHLY   = "PRO_MONTHLY"
PLAN_PRO_QUARTERLY = "PRO_QUARTERLY"
PLAN_PRO_YEARLY    = "PRO_YEARLY"

ALL_PLAN_IDS = [PLAN_FREE, PLAN_PRO_MONTHLY, PLAN_PRO_QUARTERLY, PLAN_PRO_YEARLY]
PREMIUM_PLAN_IDS = [PLAN_PRO_MONTHLY, PLAN_PRO_QUARTERLY, PLAN_PRO_YEARLY]

# ──────────────────────────────────────────────
# Centralized Plan Configuration
# ──────────────────────────────────────────────
PLANS: dict[str, dict] = {
    PLAN_FREE: {
        "id":            PLAN_FREE,
        "name":          "Standard Access",
        "badge":         "FREE",
        "price_kes":     0,
        "currency":      "KES",
        "duration_days": None,           # unlimited
        "is_premium":    False,
        "is_popular":    False,
        "savings_label": None,
        "description":   "Essential football match forecasts and basic win probabilities — free forever.",
        "features": [
            "Full 1X2 Win Probabilities",
            "Projected Exact Scorelines",
            "Live Match Center & Score Alerts",
            "Historical Model Accuracy Audit",
            "Football Analysis Articles",
            "Community Leaderboard Access",
        ],
    },
    PLAN_PRO_MONTHLY: {
        "id":            PLAN_PRO_MONTHLY,
        "name":          "VIP Pro Monthly",
        "badge":         "MOST POPULAR",
        "price_kes":     500,
        "currency":      "KES",
        "duration_days": 30,
        "is_premium":    True,
        "is_popular":    True,
        "savings_label": None,
        "description":   "Advanced statistical edge models and professional match analytics for serious punters.",
        "features": [
            "Everything in Free Tier",
            "Model Edge & Expected Value (EV %)",
            "Full 7×7 Poisson Score Probability Heatmap",
            "High-Confidence Match Alert Feeds",
            "100% Ad-Free Experience",
            "Historical Match Data CSV Export",
            "VIP Supporter Badge on Leaderboard",
        ],
    },
    PLAN_PRO_QUARTERLY: {
        "id":            PLAN_PRO_QUARTERLY,
        "name":          "VIP Pro Quarterly",
        "badge":         "SAVE 20%",
        "price_kes":     1200,
        "currency":      "KES",
        "duration_days": 90,
        "is_premium":    True,
        "is_popular":    False,
        "savings_label": "Save KES 300 vs monthly",
        "description":   "3 months of premium analytics at a discounted rate — ideal for the football season.",
        "features": [
            "All VIP Pro Monthly Features",
            "Priority Match Alert Notifications",
            "Direct Coach AI Assistant Integration",
            "Quarterly Performance Analytics Report",
            "3 Months of Uninterrupted Access",
        ],
    },
    PLAN_PRO_YEARLY: {
        "id":            PLAN_PRO_YEARLY,
        "name":          "VIP Pro Annual",
        "badge":         "BEST VALUE",
        "price_kes":     4000,
        "currency":      "KES",
        "duration_days": 365,
        "is_premium":    True,
        "is_popular":    False,
        "savings_label": "Save KES 2,000 vs monthly (33% off)",
        "description":   "Maximum value for serious football quantitative analysts — 2 months free included.",
        "features": [
            "All VIP Pro Quarterly Features",
            "Annual Performance Analytics Report",
            "Early Access to New Features",
            "2 Months Free vs Monthly Billing",
            "Highest Priority Support",
        ],
    },
}


def get_plan(plan_id: str) -> Optional[dict]:
    """Safely retrieve a plan by ID. Returns None for unknown plans."""
    return PLANS.get(plan_id)


def get_plan_price_kes(plan_id: str) -> int:
    """Return the authoritative server-side price in KES for a given plan.
    NEVER trust the price sent from the client — always use this function."""
    plan = get_plan(plan_id)
    if plan is None:
        raise ValueError(f"Unknown plan ID: {plan_id!r}. Valid IDs: {ALL_PLAN_IDS}")
    return plan["price_kes"]


def is_premium_plan(plan_id: str) -> bool:
    """Check whether a plan ID grants premium access."""
    plan = get_plan(plan_id)
    return plan["is_premium"] if plan else False


def get_plans_list() -> list[dict]:
    """Return all plans as an ordered list safe for public API exposure.
    Strips internal keys if any are added in future."""
    return list(PLANS.values())
