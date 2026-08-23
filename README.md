# ⚽ FootballPredict — AI Football Intelligence & Prediction Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://footballprediction-lovat.vercel.app)
[![Render](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://football-prediction-api-mmet.onrender.com)
[![Google AdSense](https://img.shields.io/badge/Monetization-Google_AdSense-4285F4?style=for-the-badge&logo=google-ads)](https://adsense.google.com)

An enterprise-grade, full-stack football prediction and match intelligence ecosystem powered by mathematical probability models (Double Poisson Goal Distribution) and modern web technologies.

---

## 🌐 Live Production Links

* **🚀 Live Website:** [https://footballprediction-lovat.vercel.app](https://footballprediction-lovat.vercel.app)
* **⚡ Backend API (FastAPI Docs):** [https://football-prediction-api-mmet.onrender.com/docs](https://football-prediction-api-mmet.onrender.com/docs)
* **⚙️ Admin Dashboard:** [https://footballprediction-lovat.vercel.app/admin](https://footballprediction-lovat.vercel.app/admin)
* **📚 Complete Wiki:** [WIKI.md](./WIKI.md)
* **📄 System Architecture PDF:** [Download Architecture Specification (PDF)](./Football_Prediction_System_Architecture_and_Documentation.pdf)

---

## 🌟 Key Features

### 1. 📅 Match Fixtures & Universal Search
* **Date-Categorized Groups:** Matches are dynamically grouped by day (`Today — Sunday, 23 Aug`, `Tomorrow`, and upcoming fixtures).
* **Universal Search Bar:** Real-time search across all leagues, team names, codes, and countries.
* **Segmented 3-Tab Filter:** Clean, full-width status switcher (`Upcoming`, `🔴 Live`, `Completed`).

### 2. 🤖 Coach AI Assistant
* Real-time conversational match supporter and tactical advisor.
* Floating launcher with maximum z-index (`99999`) and mobile safe area compatibility.
* Integrated into the top navigation and "More Options" mobile drawer.

### 3. 📊 Multi-Market Mathematical Predictions
* **1X2 Outcome:** Home Win, Draw, and Away Win probabilities.
* **Over / Under 2.5 Goals:** High-precision goal expectancy modeling.
* **Both Teams to Score (BTTS):** Probability calculations for both sides scoring.
* **Double Chance:** Combined 1X, X2, and 12 market rates.

### 4. 👑 Global Leaderboard & Scoring Engine
* Predict exact scorelines before kickoff.
* **Scoring Rules:**
  * 🎯 **Exact Scoreline Hit:** **+3 Points**
  * 🏆 **Correct Match Outcome (Winner/Draw):** **+1 Point**
  * ❌ **Incorrect Result:** **0 Points**
* Real-time leaderboard rankings with win percentages and accuracy metrics.

### 5. 🛡️ Security & 5-Minute Admin Inactivity Auto-Logout
* **Stateless JWT Authentication:** HS256 tokens with Bcrypt password salting.
* **Case-Insensitive Duplicate Validation:** Real-time email and username uniqueness checks.
* **5-Minute Inactivity Protection:** Auto-logs admin out after 300 seconds of inactivity with live countdown timer badge.
* **Decoupled Browsing:** Allows smooth switching between admin telemetry and public user website.

### 6. 💰 Google AdSense Monetization
* **Publisher ID:** `pub-3089881788835574` (`ca-pub-3089881788835574`)
* **Authorized Digital Sellers:** Verified `/ads.txt` integration.
* **GDPR Consent:** Google Certified CMP privacy modal for UK & European visitors.
* **5 High-Yield Ad Slots:** Hero top, in-feed breaks, Coach AI promo, merchandise, and leaderboard footer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Client** | Next.js 16 (App Router), React 19, TypeScript, Turbopack, Tailwind CSS, Context API |
| **Backend API** | FastAPI, Python 3.14, Pydantic v2, Uvicorn, APScheduler |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy ORM |
| **External Feeds** | football-data.org API, The Odds API (Bet365 / Pinnacle) |
| **Email Service** | SMTP Transactional Email Engine (Welcome, Daily Digests, Password Resets) |
| **Monetization** | Google AdSense SDK |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v18.0 or higher
* **Python:** v3.11 or higher
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Davy255/Footballprediction.git
cd Footballprediction
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*API will run at `http://localhost:8000` (Docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:3000`.*

---

## 📂 Project Structure

```text
Football Prediction Site/
├── backend/
│   ├── app/
│   │   ├── api/          # RESTful endpoints (auth, matches, predictions, admin, chat)
│   │   ├── core/         # Config, security, database connection
│   │   ├── models/       # SQLAlchemy models (User, Match, League, Team, Prediction)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # ML predictor, email engine, live sync services
│   ├── scripts/          # Database seeding and PDF generator scripts
│   ├── main.py           # FastAPI application entry point
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── public/           # Static assets, icons, manifest.json, ads.txt
│   ├── src/
│   │   ├── app/          # Next.js App Router pages (fixtures, live, admin, leaderboard)
│   │   ├── components/   # UI components (Navbar, MatchCard, Coach AI, AdBanner)
│   │   ├── context/      # React Auth and Theme context providers
│   │   └── lib/          # API client and TypeScript interface definitions
│   ├── package.json
│   └── tsconfig.json
├── docs/                 # Detailed Project Wiki & Documentation Modules
├── ARCHITECTURE_AND_DOCUMENTATION.md
├── Football_Prediction_System_Architecture_and_Documentation.pdf
├── WIKI.md
└── README.md
```

---

## 📖 Wiki & Documentation Modules

Explore the full documentation in our [WIKI.md](./WIKI.md):
* [📘 Getting Started & Environment Guide](./docs/01-GETTING-STARTED.md)
* [🏛️ Architecture & Component Topology](./docs/02-ARCHITECTURE-AND-DESIGN.md)
* [📐 Mathematical Model & Poisson Formulas](./docs/03-AI-AND-MATHEMATICAL-MODEL.md)
* [🛡️ Security, JWT & Inactivity Auto-Logout](./docs/04-ADMIN-AND-SECURITY.md)
* [💰 Google AdSense & Monetization Setup](./docs/05-MONETIZATION-AND-ADSENSE.md)

---

## 📄 License & Attribution

Developed and maintained for **Vertex Digital**.  
Proprietary & Enterprise Football Intelligence Solution.
