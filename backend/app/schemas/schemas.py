from pydantic import BaseModel, EmailStr, Field, field_serializer, field_validator
from typing import Optional
from datetime import datetime, timezone
import re


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_\-\.]+$", description="Alphanumeric username (3-30 chars)")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password minimum 8 characters")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

    @field_validator("username")
    @classmethod
    def sanitize_username(cls, v: str) -> str:
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128, description="New password minimum 8 characters")

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class GoogleAuthRequest(BaseModel):
    token: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar: str
    is_admin: bool
    total_points: int
    total_predictions: int
    correct_results: int
    correct_scores: int
    accuracy: float
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LeagueOut(BaseModel):
    id: int
    code: str
    name: str
    country: str
    flag: str
    emblem: str
    current_season: str
    is_active: bool

    class Config:
        from_attributes = True


class TeamOut(BaseModel):
    id: int
    external_id: int
    name: str
    short_name: str
    tla: str
    crest: str
    elo_rating: float

    class Config:
        from_attributes = True


class MatchOut(BaseModel):
    id: int
    external_id: Optional[int]
    league: LeagueOut
    home_team: TeamOut
    away_team: TeamOut
    matchday: Optional[int]
    status: str
    utc_date: datetime
    home_score: Optional[int]
    away_score: Optional[int]
    home_score_ht: Optional[int]
    away_score_ht: Optional[int]
    winner: Optional[str]
    ai_home_prob: Optional[float]
    ai_draw_prob: Optional[float]
    ai_away_prob: Optional[float]
    ai_predicted_home: Optional[int]
    ai_predicted_away: Optional[int]
    ai_confidence: Optional[float]
    prediction_description: Optional[str] = None
    odds_home: Optional[float] = None
    odds_draw: Optional[float] = None
    odds_away: Optional[float] = None
    odds_over25: Optional[float] = None
    odds_under25: Optional[float] = None
    odds_btts_yes: Optional[float] = None
    odds_btts_no: Optional[float] = None
    odds_dc_1x: Optional[float] = None
    odds_dc_x2: Optional[float] = None
    odds_dc_12: Optional[float] = None
    season: str

    @field_serializer("utc_date")
    def serialize_utc_date(self, dt: datetime, _info):
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True


class PredictionCreate(BaseModel):
    match_id: int
    predicted_outcome: Optional[str] = Field(None, pattern=r"^(HOME_TEAM|DRAW|AWAY_TEAM)$", description="Must be HOME_TEAM, DRAW, or AWAY_TEAM")
    predicted_home_score: Optional[int] = Field(None, ge=0, le=20, description="Home score between 0 and 20")
    predicted_away_score: Optional[int] = Field(None, ge=0, le=20, description="Away score between 0 and 20")
    predicted_btts: Optional[str] = Field(None, pattern=r"^(yes|no|YES|NO)$")
    predicted_over25: Optional[str] = Field(None, pattern=r"^(over|under|OVER|UNDER)$")
    predicted_dc: Optional[str] = Field(None, pattern=r"^(1x|x2|12|1X|X2)$")


class PredictionOut(BaseModel):
    id: int
    match_id: int
    match: MatchOut
    predicted_outcome: Optional[str] = None
    predicted_home_score: Optional[int]
    predicted_away_score: Optional[int]
    predicted_btts: Optional[str] = None
    predicted_over25: Optional[str] = None
    predicted_dc: Optional[str] = None
    is_scored: bool
    outcome_correct: Optional[bool]
    score_correct: Optional[bool]
    btts_correct: Optional[bool] = None
    over25_correct: Optional[bool] = None
    dc_correct: Optional[bool] = None
    points_earned: int
    points_awarded: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    user: UserOut

    class Config:
        from_attributes = True


class StandingEntry(BaseModel):
    position: int
    team: TeamOut
    played: int
    won: int
    draw: int
    lost: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int


class StandingsOut(BaseModel):
    league: LeagueOut
    season: str
    standings: list[StandingEntry]
