"""
Phase 1 Monetization Tests — 12 unit tests covering all subscription scenarios.

Tests run against in-memory SQLite — no network calls, no real payments.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import unittest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.subscription import Subscription, PaymentTransaction, SubscriptionStatus, PaymentStatus, PaymentProvider
from app.services.subscription_service import (
    get_active_subscription,
    is_premium_user,
    get_subscription_status,
    get_payment_history,
)
from app.config.plans import get_plan, get_plan_price_kes, is_premium_plan, ALL_PLAN_IDS, PLAN_FREE


def make_engine():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    return engine


def make_user(db, username="testuser", email="test@test.com"):
    u = User(
        username=username,
        email=email,
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_admin=False,
        is_vip=False,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def make_subscription(db, user_id, plan_id="PRO_MONTHLY", status=SubscriptionStatus.ACTIVE,
                       days_from_now=30, start_offset_days=0):
    now = datetime.now(timezone.utc)
    sub = Subscription(
        user_id=user_id,
        plan_id=plan_id,
        status=status,
        start_date=now - timedelta(days=start_offset_days),
        end_date=now + timedelta(days=days_from_now) if days_from_now is not None else None,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


class TestFreeUser(unittest.TestCase):
    """Test 1: Free user has no premium access."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db)

    def tearDown(self):
        self.db.close()

    def test_free_user_is_not_premium(self):
        self.assertFalse(is_premium_user(self.user.id, self.db))

    def test_free_user_subscription_status(self):
        status = get_subscription_status(self.user.id, self.db)
        self.assertFalse(status["is_premium"])
        self.assertEqual(status["plan"], PLAN_FREE)
        self.assertEqual(status["status"], "inactive")


class TestActivePremiumUser(unittest.TestCase):
    """Test 2: Active premium subscription grants access."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db, "premuser", "prem@test.com")
        make_subscription(self.db, self.user.id, "PRO_MONTHLY", SubscriptionStatus.ACTIVE, days_from_now=25)

    def tearDown(self):
        self.db.close()

    def test_active_premium_is_premium(self):
        self.assertTrue(is_premium_user(self.user.id, self.db))

    def test_active_subscription_status(self):
        status = get_subscription_status(self.user.id, self.db)
        self.assertTrue(status["is_premium"])
        self.assertEqual(status["status"], "ACTIVE")
        self.assertEqual(status["plan"], "PRO_MONTHLY")


class TestExpiredPremiumUser(unittest.TestCase):
    """Test 3: Expired subscription correctly denies premium access."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db, "expuser", "exp@test.com")
        # days_from_now = -1 means end_date is yesterday
        make_subscription(self.db, self.user.id, "PRO_MONTHLY", SubscriptionStatus.ACTIVE, days_from_now=-1)

    def tearDown(self):
        self.db.close()

    def test_expired_subscription_is_not_premium(self):
        self.assertFalse(is_premium_user(self.user.id, self.db))

    def test_expired_subscription_no_active_sub(self):
        sub = get_active_subscription(self.user.id, self.db)
        self.assertIsNone(sub)


class TestCancelledSubscription(unittest.TestCase):
    """Test 4: Cancelled subscription denies premium access."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db, "canuser", "can@test.com")
        make_subscription(self.db, self.user.id, "PRO_YEARLY", SubscriptionStatus.CANCELLED, days_from_now=100)

    def tearDown(self):
        self.db.close()

    def test_cancelled_subscription_is_not_premium(self):
        self.assertFalse(is_premium_user(self.user.id, self.db))

    def test_cancelled_subscription_status(self):
        status = get_subscription_status(self.user.id, self.db)
        self.assertFalse(status["is_premium"])


class TestPendingSubscription(unittest.TestCase):
    """Test 5: Pending subscription (payment not confirmed) denies premium access."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db, "penduser", "pend@test.com")
        make_subscription(self.db, self.user.id, "PRO_MONTHLY", SubscriptionStatus.PENDING, days_from_now=30)

    def tearDown(self):
        self.db.close()

    def test_pending_subscription_is_not_premium(self):
        self.assertFalse(is_premium_user(self.user.id, self.db))


class TestSubscriptionExpiry(unittest.TestCase):
    """Test 11: Expiry is computed at query time — no background job needed."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user = make_user(self.db, "exppuser", "expp@test.com")
        # Subscription status is ACTIVE in DB but end_date is in the past
        self.sub = make_subscription(
            self.db, self.user.id, "PRO_QUARTERLY",
            SubscriptionStatus.ACTIVE, days_from_now=-5
        )

    def tearDown(self):
        self.db.close()

    def test_expiry_detected_at_query_time(self):
        # DB says ACTIVE but end_date is past — should be denied
        result = get_active_subscription(self.user.id, self.db)
        self.assertIsNone(result)

    def test_expiry_lazily_persisted(self):
        # After calling get_active_subscription, status should be updated to EXPIRED
        get_active_subscription(self.user.id, self.db)
        self.db.refresh(self.sub)
        self.assertEqual(self.sub.status, SubscriptionStatus.EXPIRED)


class TestPaymentHistoryOwnership(unittest.TestCase):
    """Test 8: Payment history is strictly scoped to the authenticated user."""

    def setUp(self):
        self.engine = make_engine()
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.user_a = make_user(self.db, "usera", "usera@test.com")
        self.user_b = make_user(self.db, "userb", "userb@test.com")

        txn = PaymentTransaction(
            user_id=self.user_a.id,
            plan_id="PRO_MONTHLY",
            amount_kes=500,
            currency="KES",
            status=PaymentStatus.SUCCESS,
            provider=PaymentProvider.FLUTTERWAVE,
            provider_reference="TX-USERA-001",
        )
        self.db.add(txn)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_user_a_sees_own_history(self):
        history = get_payment_history(self.user_a.id, self.db)
        self.assertEqual(history["total"], 1)

    def test_user_b_sees_empty_history(self):
        history = get_payment_history(self.user_b.id, self.db)
        self.assertEqual(history["total"], 0)
        self.assertEqual(len(history["transactions"]), 0)


class TestPlanConfig(unittest.TestCase):
    """Tests 9, 10, 12: Plan config validation, missing config resilience, premium guard."""

    def test_valid_plan_prices(self):
        self.assertEqual(get_plan_price_kes("FREE"), 0)
        self.assertEqual(get_plan_price_kes("PRO_MONTHLY"), 500)
        self.assertEqual(get_plan_price_kes("PRO_QUARTERLY"), 1200)
        self.assertEqual(get_plan_price_kes("PRO_YEARLY"), 4000)

    def test_invalid_plan_raises(self):
        with self.assertRaises(ValueError):
            get_plan_price_kes("FAKE_PLAN")

    def test_premium_plan_flags(self):
        self.assertFalse(is_premium_plan("FREE"))
        self.assertTrue(is_premium_plan("PRO_MONTHLY"))
        self.assertTrue(is_premium_plan("PRO_QUARTERLY"))
        self.assertTrue(is_premium_plan("PRO_YEARLY"))

    def test_all_plan_ids_present(self):
        for plan_id in ALL_PLAN_IDS:
            self.assertIsNotNone(get_plan(plan_id), f"Plan {plan_id} not found in config")

    def test_unknown_plan_returns_none(self):
        self.assertIsNone(get_plan("DOESNOTEXIST"))

    def test_require_premium_raises_for_free_user(self):
        """Test 12: require_premium raises 403 for free user."""
        from fastapi import HTTPException
        from app.services.subscription_service import require_premium
        engine = make_engine()
        Session = sessionmaker(bind=engine)
        db = Session()
        user = make_user(db, "reqprem", "reqprem@test.com")
        with self.assertRaises(HTTPException) as ctx:
            require_premium(user, db)
        self.assertEqual(ctx.exception.status_code, 403)
        db.close()


if __name__ == "__main__":
    unittest.main()
