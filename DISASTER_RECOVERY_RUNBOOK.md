# 🛡️ FootballPredict Production Disaster Recovery Runbook

This document details the emergency response procedures, backup restoration protocols, and deployment rollback steps for **FootballPredict** (API on Render, Frontend on Vercel, PostgreSQL Database).

---

## 1. Emergency Escalation & Health Verification

### A. Automated Health Probes
- **Backend API Health:** `GET https://football-prediction-api-mmet.onrender.com/health`
  - Expected 200 Response:
    ```json
    {
      "status": "healthy",
      "database": "connected",
      "version": "1.0.0",
      "timestamp": "..."
    }
    ```
  - If degraded (503): Database connection pool or PostgreSQL instance is offline.
- **Frontend Vercel Status:** `GET https://footballprediction-lovat.vercel.app/api/health` or homepage inspection.

### B. System Telemetry Probe (Admin Protected)
- `GET https://football-prediction-api-mmet.onrender.com/api/admin/system-metrics`
- Reports current process memory RSS (MB), cache sizes, and active connection state.

---

## 2. Fast Rollback Procedure (Zero-Downtime Reversion)

If a new deployment causes unhandled exceptions, memory spikes, or breaking frontend crashes:

### Step 1: Frontend Instant Rollback (Vercel)
1. Open the [Vercel Dashboard](https://vercel.com).
2. Navigate to **FootballPredict Deployment History**.
3. Select the previous known-good deployment (e.g. `fc348ab`).
4. Click **Instant Rollback → Promote to Production**. Rollback takes ~2 seconds.

### Step 2: Backend Deployment Reversion (Render)
1. Open the [Render Dashboard](https://dashboard.render.com).
2. Select `football-prediction-api` service.
3. Under **Events / Deploys**, click **Rollback to previous deploy**.
4. Alternatively, revert the Git commit locally:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 3. Database Backup & Disaster Restoration

### A. Creating an Immediate On-Demand Backup Snapshot
Run from the backend directory:
```bash
python scripts/backup_database.py
```
Outputs a timestamped portable JSON snapshot in `backend/backups/footballpredict_backup_YYYYMMDD_HHMMSS.json`.

### B. Restoring Database from Snapshot
1. Ensure the PostgreSQL connection string is set in `DATABASE_URL`.
2. Execute the bootstrap script to create tables and safe migrations:
   ```bash
   python -c "import main; main.bootstrap_db()"
   ```
3. Run the full season data synchronization to repopulate fixtures and Elo ratings:
   ```bash
   python scripts/sync_data.py
   ```

---

## 4. Post-Recovery Verification Checklist

After any rollback or database restoration, verify the following core flows:
- [ ] `GET /health` returns HTTP 200 `"status": "healthy"`.
- [ ] Homepage loads with active 1X2 win probabilities and projected scores.
- [ ] `/football-predictions-today` renders scheduled fixture cards.
- [ ] `/accuracy` renders historical performance metrics ledger.
- [ ] `/articles` renders football analysis hub.
- [ ] User login and `/dashboard` load without authorization errors.
