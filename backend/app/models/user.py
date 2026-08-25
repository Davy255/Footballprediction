from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Table
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

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    favorite_teams = relationship("UserFavoriteTeam", back_populates="user", cascade="all, delete-orphan")
    followed_leagues = relationship("UserFollowedLeague", back_populates="user", cascade="all, delete-orphan")
    saved_predictions = relationship("UserSavedPrediction", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("UserNotificationPreference", uselist=False, back_populates="user", cascade="all, delete-orphan")


class UserFavoriteTeam(Base):
    __tablename__ = "user_favorite_teams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorite_teams")
    team = relationship("Team")


class UserFollowedLeague(Base):
    __tablename__ = "user_followed_leagues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="followed_leagues")
    league = relationship("League")


class UserSavedPrediction(Base):
    __tablename__ = "user_saved_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_predictions")
    match = relationship("Match")


class UserNotificationPreference(Base):
    __tablename__ = "user_notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    match_reminders = Column(Boolean, default=True)
    prediction_alerts = Column(Boolean, default=True)
    live_alerts = Column(Boolean, default=True)
    final_results = Column(Boolean, default=True)
    favorite_team_alerts = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="notification_preferences")
