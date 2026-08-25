from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # e.g. "PL", "BL1"
    name = Column(String)
    country = Column(String)
    flag = Column(String)
    emblem = Column(String, default="")
    current_season = Column(String, default="")
    is_active = Column(Boolean, default=True)
    last_synced = Column(DateTime(timezone=True), nullable=True)

    matches = relationship("Match", back_populates="league")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True)
    short_name = Column(String, default="")
    tla = Column(String, default="")
    crest = Column(String, default="")
    country = Column(String, default="")

    elo_rating = Column(Float, default=1500.0)

    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, index=True, nullable=True)

    league_id = Column(Integer, ForeignKey("leagues.id"), index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    away_team_id = Column(Integer, ForeignKey("teams.id"), index=True)

    matchday = Column(Integer, nullable=True)
    stage = Column(String, default="REGULAR_SEASON")
    status = Column(String, default="SCHEDULED", index=True)

    utc_date = Column(DateTime(timezone=True), index=True)

    # Scores
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    home_score_ht = Column(Integer, nullable=True)
    away_score_ht = Column(Integer, nullable=True)
    winner = Column(String, nullable=True)

    # Prediction metrics & description
    ai_home_prob = Column(Float, nullable=True)
    ai_draw_prob = Column(Float, nullable=True)
    ai_away_prob = Column(Float, nullable=True)
    ai_predicted_home = Column(Integer, nullable=True)
    ai_predicted_away = Column(Integer, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    prediction_description = Column(Text, nullable=True)

    # Betting Odds (1, X, 2, O/U 2.5, BTTS, Double Chance)
    odds_home = Column(Float, nullable=True)
    odds_draw = Column(Float, nullable=True)
    odds_away = Column(Float, nullable=True)
    odds_over25 = Column(Float, nullable=True)
    odds_under25 = Column(Float, nullable=True)
    odds_btts_yes = Column(Float, nullable=True)
    odds_btts_no = Column(Float, nullable=True)
    odds_dc_1x = Column(Float, nullable=True)
    odds_dc_x2 = Column(Float, nullable=True)
    odds_dc_12 = Column(Float, nullable=True)

    season = Column(String, default="2026/2027")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    league = relationship("League", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    predictions = relationship("Prediction", back_populates="match")

    __table_args__ = (
        Index("idx_matches_status_date", "status", "utc_date"),
        Index("idx_matches_league_status", "league_id", "status"),
        Index("idx_matches_home_away", "home_team_id", "away_team_id"),
        Index("idx_matches_season_league", "season", "league_id"),
        Index("idx_matches_utc_date_desc", "utc_date"),
    )
