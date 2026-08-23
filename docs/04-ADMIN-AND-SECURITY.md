# 🛡️ 04 — Security, Authentication & Admin Controls

This document covers the authentication protocols, administrator privilege verification, session timeouts, and transactional email systems of the **FootballPredict Platform**.

---

## 🔒 Authentication & Password Architecture

1. **Cryptographic Password Salting:**
   * Uses **PassLib Bcrypt** hashing.
   * Plaintext passwords are never stored in memory or database records.

2. **JWT Bearer Authorization:**
   * Authenticated sessions receive a signed **HS256 JSON Web Token**.
   * Protected endpoints (`/api/predictions`, `/api/admin/*`) require standard `Authorization: Bearer <token>` headers.

3. **Case-Insensitive Registration Validation:**
   * Eliminates duplicate account creation by validating `func.lower(User.email)` and `func.lower(User.username)`.

---

## ⏱️ 5-Minute Admin Inactivity Auto-Logout

The **Admin Portal** (`/admin`) enforces an automated idle activity watcher:
* **Tracked Events:** `['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click']`.
* **Inactivity Limit:** **300 seconds (5 minutes)**.
* **Live Countdown:** The admin header displays a real-time countdown badge (`⏱️ Inactivity Logout: 4:45`).
* **Auto-Logout Action:** When the counter hits `0:00`, the admin token is cleared, the session is invalidated, and the admin is redirected to the sign-in form with the notice:
  > `⚠️ Admin session expired due to 5 minutes of inactivity. Please sign in again.`

---

## ⚙️ Admin Operational Capabilities

* **🔄 Full Competition Sync:** Dispatches asynchronous tasks to fetch schedules and results across 8 major leagues.
* **🏷️ Bookmaker Odds Sync:** Integrates with *The Odds API* to update live Bet365 and Pinnacle odds.
* **🎯 Scoring Engine:** Calculates points and leaderboard rankings for newly finished fixtures.
* **📧 Email Testing Suite:** Allows one-click testing of transactional templates (Welcome, Daily Match Digests, Password Resets).

---

[← Return to Wiki Index](../WIKI.md)
