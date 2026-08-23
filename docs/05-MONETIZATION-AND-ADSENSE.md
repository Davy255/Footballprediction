# 💰 05 — Google AdSense Monetization & Ads.txt

This document outlines the advertising placements, publisher configurations, and privacy compliance integrations for the **FootballPredict Platform**.

---

## 🔑 Publisher Configuration

* **Google AdSense Publisher ID:** `pub-3089881788835574`
* **Ad Client ID:** `ca-pub-3089881788835574`
* **Authorized Sellers URL:** `https://footballprediction-lovat.vercel.app/ads.txt`

### `ads.txt` Entry:
```text
google.com, pub-3089881788835574, DIRECT, f08c47fec0942fa0
```

---

## 📐 Dual-Mode Ad Rendering Architecture

The `AdBanner.tsx` component is engineered with an automated fallback mechanism:

1. **Pre-Approval / Fallback Mode:**
   * When live Google Ads are initializing or awaiting review, high-converting native sponsor banners (Odds Boost, WhoScored Pro Tracker, Coach AI VIP, and Matchday Gear) are rendered.
2. **Live Ad Serving Mode:**
   * When Google AdSense approves the site, all ad slots automatically render responsive `<ins class="adsbygoogle" ... />` units, serving real targeted Google Ads.

---

## 📍 Ad Unit Topology

1. **`hero-top`**: Positioned above the Match Fixtures feed on the homepage and fixtures page.
2. **`in-feed-match`**: In-feed break banner embedded between chronological date blocks.
3. **`vip-coach-ai`**: Promoted feature card for analytical forecasting tools.
4. **`merch-sports`**: Bottom merchandise and matchday apparel placement.
5. **`leaderboard-footer`**: Positioned at the bottom of the Global Leaderboard.

---

## 🛡️ European & UK GDPR Consent Management

* Integrated with **Google Certified Consent Management Platform (CMP)**.
* Automatically presents an EEA/UK compliant cookie and tracking consent modal ("Consent", "Do not consent", and "Manage options") to European visitors.

---

[← Return to Wiki Index](../WIKI.md)
