# 📐 03 — Mathematical Prediction & ML Model

This document outlines the statistical probability modeling, goal expectancy equations, and multi-market derivations employed by the **FootballPredict Intelligence Engine**.

---

## 🎯 The Bivariate Double Poisson Model

In association football, goals scored by competing teams can be modeled as independent Poisson processes given attacking and defensive ratings:

$$P(X = x, Y = y) = \frac{\lambda^x e^{-\lambda}}{x!} \times \frac{\mu^y e^{-\mu}}{y!}$$

Where:
* $\lambda$ = Expected goals ($xG$) for the Home Team.
* $\mu$ = Expected goals ($xG$) for the Away Team.
* $x, y$ = Specific scoreline outcomes (e.g. $x = 2, y = 1$).

---

## ⚙️ Computation of Expected Goals ($\lambda$ & $\mu$)

Expected goals are derived by factoring:
1. **League Average Goals:** $\bar{G}_{home}$ and $\bar{G}_{away}$.
2. **Team Attack Rating ($\alpha$):** Team goals scored per match relative to league average.
3. **Team Defense Rating ($\beta$):** Team goals conceded per match relative to league average.
4. **Home Advantage Factor ($H$):** Statistically evaluated baseline (typically $+0.25$ to $+0.35$ goals).
5. **Recent Form Multiplier ($F$):** Exponential decay weighting applied to the last 5 competitive fixtures.

$$\lambda = \alpha_{home} \times \beta_{away} \times \bar{G}_{home} \times H \times F_{home}$$

$$\mu = \alpha_{away} \times \beta_{home} \times \bar{G}_{away} \times F_{away}$$

---

## 📊 Market Probability Derivations

### 1. 1X2 Match Outcome Probabilities
* **Home Win Probability ($P_{Home}$):**
  $$P_{Home} = \sum_{x > y} P(X=x, Y=y)$$
* **Draw Probability ($P_{Draw}$):**
  $$P_{Draw} = \sum_{x = y} P(X=x, Y=y)$$
* **Away Win Probability ($P_{Away}$):**
  $$P_{Away} = \sum_{x < y} P(X=x, Y=y)$$

### 2. Over / Under 2.5 Goals
* **Over 2.5 Goals:**
  $$P(\text{Over } 2.5) = \sum_{x + y \ge 3} P(X=x, Y=y)$$
* **Under 2.5 Goals:**
  $$P(\text{Under } 2.5) = 1 - P(\text{Over } 2.5)$$

### 3. Both Teams to Score (BTTS)
* **BTTS Yes:**
  $$P(\text{BTTS Yes}) = (1 - e^{-\lambda}) \times (1 - e^{-\mu})$$
* **BTTS No:**
  $$P(\text{BTTS No}) = 1 - P(\text{BTTS Yes})$$

---

[← Return to Wiki Index](../WIKI.md)
