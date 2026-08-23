# 🚀 01 — Getting Started & Configuration

This guide provides instructions for setting up, running, and deploying the **FootballPredict Platform**.

---

## 💻 System Prerequisites

* **Node.js:** v18.0.0 or later (Recommended: v20 LTS)
* **Python:** v3.11 or later (Recommended: v3.14)
* **npm:** v9.0.0 or later
* **Git**

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env.local` or Vercel Environment Settings)
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://football-prediction-api-mmet.onrender.com

# Google AdSense Publisher Client ID
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-3089881788835574
```

### Backend (`backend/.env` or Render Environment Settings)
```env
# Secret key for signing JWT tokens
SECRET_KEY=your_super_secret_jwt_key_here

# Database URL (SQLite or PostgreSQL)
DATABASE_URL=sqlite:///./football_prediction.db

# Frontend CORS Origin
FRONTEND_URL=https://footballprediction-lovat.vercel.app

# Default Admin Credentials
ADMIN_EMAIL=davidwesonga776@gmail.com
ADMIN_USERNAME=Wes@254
ADMIN_PASSWORD=@David2211.

# External APIs
FOOTBALL_DATA_API_KEY=your_football_data_org_api_key
ODDS_API_KEY=your_the_odds_api_key

# SMTP Email Configuration (Optional for real email dispatch)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=no-reply@footballpredict.com
SMTP_FROM_NAME="FootballPredict ⚽"
SMTP_TLS=True
```

---

## 🛠️ Local Development Steps

### 1. Start the Backend API
```bash
cd backend
python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`.

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Client will be live at: `http://localhost:3000`.

---

[← Return to Wiki Index](../WIKI.md)
