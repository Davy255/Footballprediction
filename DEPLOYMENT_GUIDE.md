# 🚀 Cloud Deployment Guide (Vercel + Render / PostgreSQL)

This guide walks you through deploying your **Football Prediction Site** to production using **Option A (Vercel + Render)** with zero maintenance, automatic SSL, and free-tier compatibility.

---

## 🏗️ Architecture Overview
* **Frontend:** Next.js 16 deployed on **Vercel** (Global Edge CDN, automatic HTTPS)
* **Backend:** FastAPI (Python 3) deployed on **Render** (continuous background live score synchronization)
* **Database:** Managed **PostgreSQL** on Render / Neon / Supabase

---

## Step 1: Push Project to GitHub

1. Initialize Git in the project root (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Production ready release"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new).
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend & PostgreSQL Database on Render

1. Go to **[Render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** → Select **Blueprint** (or **Web Service**).
   * If using Blueprint: Connect your GitHub repo. Render will automatically read `render.yaml` and provision both the **FastAPI Web Service** and the **PostgreSQL Database** in 1 click!
   * If configuring manually:
     * **Name:** `football-prediction-api`
     * **Root Directory:** `backend`
     * **Runtime:** `Python 3`
     * **Build Command:** `pip install -r requirements.txt`
     * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables in the Render Dashboard:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | *(PostgreSQL Internal Connection String)* | Managed Database URL |
   | `SECRET_KEY` | *(Generate a 32+ char string)* | JWT Secret |
   | `FOOTBALL_DATA_API_KEY` | `ce3ff4e6e3784c2798bb940ef9ef69d9` | Official API Key |
   | `FRONTEND_URL` | `https://your-app.vercel.app` | Allowed CORS Domain |
4. Click **Deploy**. Render will build and provide your Backend URL:
   `https://football-prediction-api.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** → **Project** → Select your GitHub repository.
3. In the project setup:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click **Edit** → select `frontend`
4. Add Environment Variable:
   * **Name:** `NEXT_PUBLIC_API_URL`
   * **Value:** `https://football-prediction-api.onrender.com` *(your Render backend URL from Step 2)*
5. Click **Deploy**.
6. In ~60 seconds, your site will be live at:
   `https://your-project-name.vercel.app`

---

## Step 4: Final CORS Verification

Once Vercel assigns your live domain (e.g. `https://footballpredict.vercel.app`):
1. Open your **Render Dashboard** → `football-prediction-api` → **Environment**.
2. Update `FRONTEND_URL` to match your exact Vercel URL (`https://footballpredict.vercel.app`).
3. Save changes.

---

## ✅ Post-Deployment Checks
- [ ] Visit `https://your-app.vercel.app/` and check homepage predictions.
- [ ] Visit `https://your-app.vercel.app/live` and verify real-time 5-second match updates.
- [ ] Test the **Coach AI 🤖** floating chatbot widget in the bottom-right corner.
- [ ] Test User Registration and Login.
- [ ] Visit `https://football-prediction-api.onrender.com/docs` to test Swagger API endpoints.
