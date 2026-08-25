/**
 * Football Analysis & Content Hub Repository
 *
 * High-quality, data-driven football analysis articles explaining
 * predictive modeling, statistical metrics, Elo ratings, and league dynamics.
 */

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Prediction Methodology' | 'League Analysis' | 'Football Statistics' | 'Team Analysis' | 'Match Previews';
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  readingTimeMinutes: number;
  featuredImage?: string;
  relatedLeagueCodes?: string[];
  relatedTeams?: string[];
  content: string; // Markdown / HTML formatted text
}

export const ARTICLES: Article[] = [
  {
    slug: 'how-footballpredict-ai-calculates-win-probabilities',
    title: 'How Our Football Prediction Model Calculates Win Probabilities: A Data-Driven Breakdown',
    excerpt: 'An inside look at how FootballPredict synthesizes dynamic Elo ratings, bivariate Poisson goal distributions, and rolling team form to compute transparent 1X2 probabilities.',
    category: 'Prediction Methodology',
    publishedAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-25T12:00:00Z',
    author: {
      name: 'FootballPredict Analytics Team',
      role: 'Lead Quantitative Football Modeler',
    },
    readingTimeMinutes: 7,
    relatedLeagueCodes: ['PL', 'CL', 'PD', 'SA', 'BL1'],
    content: `
## 1. Introduction to Algorithmic Football Forecasting

Football is famously characterized by low-scoring variance and high stochasticity. A solitary defensive deflection or refereeing decision can determine the outcome of 90 minutes. However, over extensive sample sizes, underlying team strength, offensive efficiency, and defensive resilience regress towards measurable mathematical baselines.

At FootballPredict, our objective is to deliver objective, transparent probability distributions for every fixture across Europe's top competitions without subjective human bias or promotional commercial incentives.

---

## 2. The Core Mathematical Pillars

Our primary predictive pipeline relies on three interconnected statistical engines:

### A. Dynamic Elo Rating System
Every club in our database maintains a dynamic Elo rating (calibrated around a 1500 baseline). Following every completed match, ratings update dynamically based on:
- **Expected Outcome vs Actual Result:** Beating a higher-ranked opponent yields a substantially higher Elo increment than defeating a relegation candidate.
- **Goal Margin Multiplier:** Decisive 3+ goal victories reward larger Elo adjustments than narrow 1-0 victories.
- **Home Advantage Offset:** An empirical +65 Elo adjustment is granted to the home side to account for venue familiarity, travel fatigue, and crowd energy.

$$\\Delta R = K \\cdot (S - E) \\cdot \\ln(1 + |\\Delta G|)$$

### B. Bivariate Poisson Goal Expectation
Using each club's rolling home/away attack strength ($\\alpha$) and defensive vulnerability ($\\beta$), we calculate expected goals ($\\lambda_{home}$ and $\\mu_{away}$). We then model the probability of every discrete scoreline from 0–0 to 6–6 using a joint Poisson distribution:

$$P(X = x, Y = y) = \\frac{e^{-\\lambda} \\lambda^x}{x!} \\cdot \\frac{e^{-\\mu} \\mu^y}{y!}$$

Summing the probabilities across all permutations where $x > y$ yields the **Home Win Probability**, $x = y$ gives the **Draw Probability**, and $y > x$ gives the **Away Win Probability**.

---

## 3. Confidence Classification Framework

To give users clear, deterministic insights, our engine categorizes prediction certainty into four transparent tiers based on the highest outcome percentage:

1. **Very High Confidence ($\\ge 65\\%$):** High statistical mismatch where the favorite possesses overwhelming form and rating supremacy.
2. **High Confidence ($55\\% - 64\\%$):** Solid model consensus with a clear favorite.
3. **Moderate Confidence ($45\\% - 54\\%$):** Competitive clash with a slight directional edge.
4. **Balanced / Low Confidence ($< 45\\%$):** Highly volatile fixture or evenly matched tactical stalemate.

---

## 4. Summary

By combining dynamic team ratings with bivariate score simulations, FootballPredict provides football fans and analysts with an objective pre-match baseline for evaluating upcoming European fixtures.
    `,
  },
  {
    slug: 'premier-league-home-advantage-and-elo-rating-analysis',
    title: 'Quantifying Home Advantage in the Premier League: Form vs Venue Bias',
    excerpt: 'Analyzing historical home win rates, crowd impact, and how venue-specific goal differentials influence modern football predictions.',
    category: 'League Analysis',
    publishedAt: '2026-08-18T10:30:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
    author: {
      name: 'FootballPredict Analytics Team',
      role: 'Senior Sports Data Scientist',
    },
    readingTimeMinutes: 6,
    relatedLeagueCodes: ['PL'],
    relatedTeams: ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea'],
    content: `
## 1. Does Home Advantage Still Exist in Top-Flight Football?

Across the history of the English Premier League, home teams have historically won approximately **45%** to **48%** of all completed matches, while draws account for **24%** to **26%**, and away wins occur in roughly **28%** to **31%** of fixtures.

Despite advancements in modern sports science, chartered travel, and standardized pitch dimensions, home venue bias remains a statistically significant factor in match forecasting.

---

## 2. Key Drivers of Venue Disparity

### 1. Offensive Output & Shot Volume
Statistical analysis reveals that Premier League home teams generate an average of **1.45 to 1.55 goals per match**, compared to **1.15 to 1.25 goals** for away teams. This equates to an expected goal differential of approximately **+0.30 xG per match** purely attributable to home advantage.

### 2. Tactical Posture and Defensive Blocks
Away teams frequently adopt conservative, low-block defensive structures, lowering their pressing line by an average of 4.2 meters. This tactical retreat concedes territorial dominance and box entries to the home side.

---

## 3. How FootballPredict Accounts for Venue Bias

Rather than applying a flat, arbitrary percentage boost to the home team, our predictive model implements a calibrated Elo rating offset and home-specific expected goal parameters:
- **Baseline Venue Offset:** +65 Elo points for standard home venues.
- **Form-Weighted Adjustment:** Clubs with fortress home records (e.g. Anfield, Emirates Stadium) earn higher venue efficiency coefficients.

Understanding these venue dynamics enables more accurate forecasting of competitive league clashes.
    `,
  },
  {
    slug: 'poisson-distribution-in-football-match-forecasting',
    title: 'Understanding Bivariate Poisson Distributions in Correct Score Forecasting',
    excerpt: 'Why the Poisson distribution is the gold standard for modeling football match scorelines, Over/Under 2.5 goals, and Both Teams to Score.',
    category: 'Football Statistics',
    publishedAt: '2026-08-20T11:15:00Z',
    updatedAt: '2026-08-25T15:00:00Z',
    author: {
      name: 'FootballPredict Analytics Team',
      role: 'Quantitative Modeling Specialist',
    },
    readingTimeMinutes: 8,
    relatedLeagueCodes: ['CL', 'PL', 'BL1', 'SA'],
    content: `
## 1. Why Goal Scoring Follows a Poisson Process

In football, goals are rare, discrete events that occur independently within a fixed 90-minute time window. Because the probability of a goal occurring in any individual second is minuscule, the distribution of total goals in a match closely mirrors a **Poisson distribution**.

---

## 2. Calculating Expected Goals ($\\lambda$ and $\\mu$)

To construct a predictive score matrix for a match between Team A (Home) and Team B (Away), we first determine each team's expected goals:

$$\\lambda_{home} = \\text{League Avg Home Goals} \\times \\text{Team A Home Attack} \\times \\text{Team B Away Defense}$$
$$\\mu_{away} = \\text{League Avg Away Goals} \\times \\text{Team B Away Attack} \\times \\text{Team A Home Defense}$$

---

## 3. Deriving Secondary Market Probabilities

Once the full 7x7 score matrix is generated, multi-market projections become exact mathematical derivations:

- **Over 2.5 Goals Probability:** The sum of all cell probabilities where $x + y > 2.5$.
- **Both Teams to Score (BTTS Yes):** The sum of all cell probabilities where $x \\ge 1$ and $y \\ge 1$.
- **Most Likely Exact Score:** The single coordinate $(x, y)$ corresponding to the maximum cell value in the matrix (commonly 1-1, 1-0, or 2-1).

This disciplined approach ensures that all multi-market forecasts on FootballPredict are mathematically coherent and derived from a unified probability framework.
    `,
  },
  {
    slug: 'understanding-bookmaker-overround-and-market-margin',
    title: 'Deconstructing Bookmaker Overround: How to Calculate Margin-Normalized Implied Odds',
    excerpt: 'A complete mathematical guide to converting decimal odds into true implied probabilities by removing the bookmaker vig.',
    category: 'Prediction Methodology',
    publishedAt: '2026-08-22T14:00:00Z',
    updatedAt: '2026-08-25T16:00:00Z',
    author: {
      name: 'FootballPredict Analytics Team',
      role: 'Market Analytics Lead',
    },
    readingTimeMinutes: 5,
    relatedLeagueCodes: ['PL', 'PD', 'SA'],
    content: `
## 1. What is Bookmaker Overround?

When a bookmaker publishes 1X2 odds for a football match, the raw implied probabilities of Home, Draw, and Away will always sum to greater than 100%. This surplus percentage (typically between 104% and 108%) represents the bookmaker's built-in margin or **overround (vig)**.

---

## 2. The Conversion Formula

To compare market odds directly against an objective AI prediction model, the overround must be stripped out:

### Step 1: Compute Raw Implied Probabilities
$$P_{raw} = \\frac{1}{\\text{Decimal Odds}}$$

### Step 2: Sum the Total Overround
$$O = P_{raw, H} + P_{raw, D} + P_{raw, A}$$

### Step 3: Compute Normalized Probabilities
$$P_{norm} = \\frac{P_{raw}}{O} \\times 100\\%$$

---

## 3. Identifying Potential Model Edge

When FootballPredict's objective statistical probability exceeds the margin-normalized market probability, a **Potential Model Edge** exists:

$$\\text{Model Edge (pp)} = \\text{Model Probability (\\%)} - P_{norm} (\\%)$$

This quantitative metric allows analysts to quickly identify fixtures where statistical form divergence from market consensus is most pronounced.
    `,
  },
];

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  if (!category || category === 'All') return ARTICLES;
  return ARTICLES.filter((a) => a.category === category);
}
