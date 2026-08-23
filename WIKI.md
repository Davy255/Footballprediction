# 📚 FootballPredict — Official Project Wiki

Welcome to the central knowledge base and technical Wiki for the **FootballPredict Platform**. This Wiki provides architectural details, database schemas, mathematical prediction formulas, security mechanisms, and monetization setups.

---

## 📑 Wiki Table of Contents

| Module | Document Title | Description |
|---|---|---|
| **01** | [🚀 Getting Started & Configuration](./docs/01-GETTING-STARTED.md) | Local development prerequisites, environment variables, and startup guide. |
| **02** | [🏛️ Full System Architecture & Data Models](./docs/02-ARCHITECTURE-AND-DESIGN.md) | Client-server architecture, database ERD schema, and complete RESTful API directory. |
| **03** | [📐 Mathematical Prediction & ML Model](./docs/03-AI-AND-MATHEMATICAL-MODEL.md) | Bivariate Poisson distribution formulas, form weighting, and multi-market probability calculations. |
| **04** | [🛡️ Security, Authentication & Admin Controls](./docs/04-ADMIN-AND-SECURITY.md) | JWT auth, Bcrypt hashing, 5-minute inactivity auto-logout, and SMTP email services. |
| **05** | [💰 Google AdSense Monetization & Ads.txt](./docs/05-MONETIZATION-AND-ADSENSE.md) | Publisher ID setup (`pub-3089881788835574`), authorized sellers, and GDPR consent management. |

---

## ⚡ Quick Navigation Links

* **Live Frontend:** [https://footballprediction-lovat.vercel.app](https://footballprediction-lovat.vercel.app)
* **Backend API Swagger Docs:** [https://football-prediction-api-mmet.onrender.com/docs](https://football-prediction-api-mmet.onrender.com/docs)
* **Admin Dashboard:** [https://footballprediction-lovat.vercel.app/admin](https://footballprediction-lovat.vercel.app/admin)
* **System Architecture PDF:** [Download PDF Documentation](./Football_Prediction_System_Architecture_and_Documentation.pdf)
* **Full Technical Markdown:** [ARCHITECTURE_AND_DOCUMENTATION.md](./ARCHITECTURE_AND_DOCUMENTATION.md)

---

## 🏆 Scoring & Leaderboard Rules

Every registered user can submit predictions on upcoming match fixtures. Scoring is processed automatically upon match completion:

```text
┌────────────────────────────────────────────────────────┐
│  EXACT SCORELINE HIT (e.g. Pred: 2-1, Final: 2-1)      │  ===> +3 POINTS
├────────────────────────────────────────────────────────┤
│  CORRECT OUTCOME / WINNER (e.g. Pred: 3-0, Final: 1-0) │  ===> +1 POINT
├────────────────────────────────────────────────────────┤
│  INCORRECT OUTCOME (e.g. Pred: 2-0, Final: 0-1)        │  ===> 0 POINTS
└────────────────────────────────────────────────────────┘
```

---

*Maintained by the FootballPredict Engineering Team.*
