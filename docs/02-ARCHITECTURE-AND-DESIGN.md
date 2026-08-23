# 🏛️ 02 — Full System Architecture & Data Models

This document details the architectural layout, component topology, and entity schemas of the **FootballPredict Platform**.

---

## 🏗️ Layered Component Topology

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Next.js 16 (Turbopack) • React 19 • TypeScript • Tailwind  │
│  - App Router (/fixtures, /live, /leaderboard, /admin)      │
│  - Coach AI Floating Assistant Widget                       │
│  - Responsive 3-Tab Segmented Status Switcher               │
│  - 5-Tier Google AdSense Units                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION API TIER                     │
│  FastAPI (ASGI) • Python 3.14 • Pydantic v2 • Uvicorn       │
│  - JWT Bearer Authentication & Rate Limiters                │
│  - Double Poisson ML Prediction Engine                      │
│  - Automated Match & Live Odds Synchronizers                │
│  - SMTP Email Engine & Daily Match Reminder Cron            │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy ORM
┌──────────────────────────────▼──────────────────────────────┐
│                     DATA & PERSISTENCE                      │
│  PostgreSQL / SQLite Database Engine                        │
│  - Users & Leaderboard Aggregations                         │
│  - Leagues, Teams, and Matches (Status & Scores)            │
│  - User Exact Scoreline Predictions                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Entities & Data Models

### 1. `User` Entity
* `id` (Integer, Primary Key)
* `username` (String, Unique, Case-Insensitive Index)
* `email` (String, Unique, Case-Insensitive Index)
* `hashed_password` (String, Bcrypt Hashed)
* `is_admin` (Boolean, Default: False)
* `total_points` (Integer, Default: 0)
* `total_predictions` (Integer, Default: 0)
* `accuracy` (Float, Default: 0.0)

### 2. `Match` Entity
* `id` (Integer, Primary Key)
* `external_id` (Integer, Unique, Provider ID)
* `utc_date` (DateTime, Match Kickoff Timestamp)
* `status` (String: `SCHEDULED`, `TIMED`, `LIVE`, `IN_PLAY`, `PAUSED`, `FINISHED`, `POSTPONED`)
* `home_score` / `away_score` (Integer)
* `prob_home_win`, `prob_draw`, `prob_away_win` (Float)
* `prob_over_25`, `prob_under_25`, `prob_btts_yes` (Float)
* `odds_home`, `odds_draw`, `odds_away` (Float)

### 3. `Prediction` Entity
* `id` (Integer, Primary Key)
* `user_id` (ForeignKey to `User.id`)
* `match_id` (ForeignKey to `Match.id`)
* `predicted_home_score` (Integer)
* `predicted_away_score` (Integer)
* `points_awarded` (Integer, 0, 1, or 3)
* `is_scored` (Boolean)

---

[← Return to Wiki Index](../WIKI.md)
