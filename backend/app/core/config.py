from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API
    FOOTBALL_DATA_API_KEY: str = ""
    FOOTBALL_DATA_BASE_URL: str = "https://api.football-data.org/v4"
    ODDS_API_KEY: str = "0bd3aee3e6502b25b30cf2bf619c9525"

    # Security
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./football_prediction.db"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Admin bootstrap
    ADMIN_EMAIL: str = "admin@footballpredict.com"
    ADMIN_PASSWORD: str = "admin123"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Supported competitions from football-data.org free tier
SUPPORTED_COMPETITIONS = {
    "PL":  {"name": "Premier League",         "country": "England",       "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    "BL1": {"name": "Bundesliga",              "country": "Germany",       "flag": "🇩🇪"},
    "SA":  {"name": "Serie A",                 "country": "Italy",         "flag": "🇮🇹"},
    "PD":  {"name": "La Liga",                 "country": "Spain",         "flag": "🇪🇸"},
    "FL1": {"name": "Ligue 1",                 "country": "France",        "flag": "🇫🇷"},
    "ELC": {"name": "Championship",            "country": "England",       "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    "PPL": {"name": "Primeira Liga",           "country": "Portugal",      "flag": "🇵🇹"},
    "DED": {"name": "Eredivisie",              "country": "Netherlands",   "flag": "🇳🇱"},
    "BSA": {"name": "Série A",                 "country": "Brazil",        "flag": "🇧🇷"},
    "CL":  {"name": "UEFA Champions League",   "country": "Europe",        "flag": "🇪🇺"},
    "EC":  {"name": "European Championship",   "country": "Europe",        "flag": "🇪🇺"},
    "WC":  {"name": "FIFA World Cup",          "country": "World",         "flag": "🌍"},
}
