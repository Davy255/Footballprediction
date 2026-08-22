from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, default="")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Leaderboard stats
    total_points = Column(Integer, default=0)
    total_predictions = Column(Integer, default=0)
    correct_results = Column(Integer, default=0)
    correct_scores = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    predictions = relationship("Prediction", back_populates="user")
