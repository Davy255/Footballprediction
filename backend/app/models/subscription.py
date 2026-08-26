"""
Subscription and PaymentTransaction SQLAlchemy models.

These models extend the existing user system without modifying the users table.
All references use the existing users.id foreign key.

NEVER store: card numbers, CVV, PINs, M-Pesa PINs, or raw payment credentials.
Only store the minimum metadata needed to identify and reconcile payments.
"""

import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Numeric, ForeignKey, UniqueConstraint, Index, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


# ──────────────────────────────────────────────
# Enums (stored as strings for DB portability)
# ──────────────────────────────────────────────

class SubscriptionStatus(str, enum.Enum):
    ACTIVE    = "ACTIVE"
    EXPIRED   = "EXPIRED"
    CANCELLED = "CANCELLED"
    PENDING   = "PENDING"


class PaymentStatus(str, enum.Enum):
    PENDING   = "PENDING"
    SUCCESS   = "SUCCESS"
    FAILED    = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED  = "REFUNDED"


class PaymentProvider(str, enum.Enum):
    FLUTTERWAVE = "FLUTTERWAVE"


# ──────────────────────────────────────────────
# Subscription Model
# ──────────────────────────────────────────────

class Subscription(Base):
    """
    Tracks a user's premium subscription period.
    A user can have multiple historical subscriptions (renewals create new rows).
    The active subscription is the one with status=ACTIVE and end_date > now().
    """
    __tablename__ = "subscriptions"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id        = Column(String(32), nullable=False, index=True)   # e.g. "PRO_MONTHLY"
    status         = Column(String(16), nullable=False, default=SubscriptionStatus.PENDING, index=True)
    start_date     = Column(DateTime(timezone=True), nullable=True)
    end_date       = Column(DateTime(timezone=True), nullable=True)
    cancelled_at   = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user           = relationship("User", back_populates="subscriptions")
    transactions   = relationship("PaymentTransaction", back_populates="subscription", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_subscriptions_user_status", "user_id", "status"),
    )

    def __repr__(self):
        return f"<Subscription id={self.id} user_id={self.user_id} plan={self.plan_id} status={self.status}>"


# ──────────────────────────────────────────────
# Payment Transaction Model
# ──────────────────────────────────────────────

class PaymentTransaction(Base):
    """
    Records every payment attempt against a subscription.

    SECURITY: This model NEVER stores card numbers, CVV, PINs, or credentials.
    Only the minimum metadata needed for reconciliation with Flutterwave is stored.

    provider_tx_id: Flutterwave's transaction ID — unique per successful payment.
    provider_reference: Our internal reference sent to Flutterwave (e.g. TX-{uuid}).
    """
    __tablename__ = "payment_transactions"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id      = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    plan_id              = Column(String(32), nullable=False)           # plan at time of payment
    amount_kes           = Column(Numeric(10, 2), nullable=False)       # authoritative server-side amount
    currency             = Column(String(8), nullable=False, default="KES")
    status               = Column(String(16), nullable=False, default=PaymentStatus.PENDING, index=True)
    provider             = Column(String(32), nullable=False, default=PaymentProvider.FLUTTERWAVE)
    provider_tx_id       = Column(String(128), nullable=True, index=True)    # Flutterwave tx_id
    provider_reference   = Column(String(128), nullable=True, index=True)    # our reference sent to provider
    # Store only non-sensitive metadata (e.g. masked phone, masked email for receipt)
    metadata_json        = Column(Text, nullable=True)
    failure_reason       = Column(String(256), nullable=True)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user                 = relationship("User", back_populates="payment_transactions")
    subscription         = relationship("Subscription", back_populates="transactions")

    __table_args__ = (
        # provider_tx_id must be unique when present (prevents duplicate processing)
        UniqueConstraint("provider_tx_id", name="uq_payment_provider_tx_id"),
        Index("ix_payment_transactions_user_status", "user_id", "status"),
    )

    def __repr__(self):
        return (
            f"<PaymentTransaction id={self.id} user_id={self.user_id} "
            f"plan={self.plan_id} amount={self.amount_kes} KES status={self.status}>"
        )
