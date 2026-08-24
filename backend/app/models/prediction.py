from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)

    # User's prediction
    predicted_outcome = Column(String, nullable=True)  # HOME_TEAM, DRAW, AWAY_TEAM, or None
    predicted_home_score = Column(Integer, nullable=True)
    predicted_away_score = Column(Integer, nullable=True)

    # Extended market predictions
    predicted_btts = Column(String, nullable=True)   # 'yes' or 'no'
    predicted_over25 = Column(String, nullable=True)  # 'over' or 'under'
    predicted_dc = Column(String, nullable=True)      # '1x', 'x2', or '12'

    # Scoring (filled in after match finishes)
    is_scored = Column(Boolean, default=False)
    outcome_correct = Column(Boolean, nullable=True)
    score_correct = Column(Boolean, nullable=True)
    btts_correct = Column(Boolean, nullable=True)
    over25_correct = Column(Boolean, nullable=True)
    dc_correct = Column(Boolean, nullable=True)
    points_earned = Column(Integer, default=0)
    points_awarded = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")
