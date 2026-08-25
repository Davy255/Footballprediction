/**
 * Football Market Odds & Implied Probability Utility
 *
 * Provides mathematically sound conversions:
 * - Decimal Odds -> Raw Implied Probability (1 / odds)
 * - Bookmaker Overround / Margin Calculation (sum of raw implied probs)
 * - Margin-Normalized Implied Probability (raw implied / total overround)
 *
 * NOTE: Normalizing removes bookmaker vig/margin, allowing direct analytical
 * comparison against FootballPredict's true statistical model probabilities.
 */

export interface MarketOddsAnalysis {
  hasOdds: boolean;
  rawHomeOdds?: number;
  rawDrawOdds?: number;
  rawAwayOdds?: number;
  rawHomeImpliedPct?: number;
  rawDrawImpliedPct?: number;
  rawAwayImpliedPct?: number;
  overroundPct?: number; // e.g. 105.4%
  bookmakerMarginPct?: number; // e.g. 5.4%
  normalizedHomeImpliedPct?: number;
  normalizedDrawImpliedPct?: number;
  normalizedAwayImpliedPct?: number;
  over25Odds?: number;
  under25Odds?: number;
  bttsYesOdds?: number;
  bttsNoOdds?: number;
  dc1xOdds?: number;
  dcx2Odds?: number;
  dc12Odds?: number;
}

export function calculateMarketOddsAnalysis(match: {
  odds_home?: number | null;
  odds_draw?: number | null;
  odds_away?: number | null;
  odds_over25?: number | null;
  odds_under25?: number | null;
  odds_btts_yes?: number | null;
  odds_btts_no?: number | null;
  odds_dc_1x?: number | null;
  odds_dc_x2?: number | null;
  odds_dc_12?: number | null;
}): MarketOddsAnalysis {
  const hOdds = match.odds_home && Number(match.odds_home) > 1.0 ? Number(match.odds_home) : undefined;
  const dOdds = match.odds_draw && Number(match.odds_draw) > 1.0 ? Number(match.odds_draw) : undefined;
  const aOdds = match.odds_away && Number(match.odds_away) > 1.0 ? Number(match.odds_away) : undefined;

  if (!hOdds || !dOdds || !aOdds) {
    return {
      hasOdds: false,
      over25Odds: match.odds_over25 && Number(match.odds_over25) > 1.0 ? Number(match.odds_over25) : undefined,
      under25Odds: match.odds_under25 && Number(match.odds_under25) > 1.0 ? Number(match.odds_under25) : undefined,
      bttsYesOdds: match.odds_btts_yes && Number(match.odds_btts_yes) > 1.0 ? Number(match.odds_btts_yes) : undefined,
      bttsNoOdds: match.odds_btts_no && Number(match.odds_btts_no) > 1.0 ? Number(match.odds_btts_no) : undefined,
      dc1xOdds: match.odds_dc_1x && Number(match.odds_dc_1x) > 1.0 ? Number(match.odds_dc_1x) : undefined,
      dcx2Odds: match.odds_dc_x2 && Number(match.odds_dc_x2) > 1.0 ? Number(match.odds_dc_x2) : undefined,
      dc12Odds: match.odds_dc_12 && Number(match.odds_dc_12) > 1.0 ? Number(match.odds_dc_12) : undefined,
    };
  }

  // 1. Raw Implied Probabilities: 1 / Decimal Odds
  const rawH = 1 / hOdds;
  const rawD = 1 / dOdds;
  const rawA = 1 / aOdds;

  // 2. Bookmaker Overround / Margin Sum
  const totalOverround = rawH + rawD + rawA;
  const overroundPct = Number((totalOverround * 100).toFixed(1));
  const bookmakerMarginPct = Number(((totalOverround - 1) * 100).toFixed(1));

  // 3. Margin-Normalized Market Probabilities
  const normH = Number(((rawH / totalOverround) * 100).toFixed(1));
  const normD = Number(((rawD / totalOverround) * 100).toFixed(1));
  const normA = Number(((rawA / totalOverround) * 100).toFixed(1));

  return {
    hasOdds: true,
    rawHomeOdds: Number(hOdds.toFixed(2)),
    rawDrawOdds: Number(dOdds.toFixed(2)),
    rawAwayOdds: Number(aOdds.toFixed(2)),
    rawHomeImpliedPct: Number((rawH * 100).toFixed(1)),
    rawDrawImpliedPct: Number((rawD * 100).toFixed(1)),
    rawAwayImpliedPct: Number((rawA * 100).toFixed(1)),
    overroundPct,
    bookmakerMarginPct,
    normalizedHomeImpliedPct: normH,
    normalizedDrawImpliedPct: normD,
    normalizedAwayImpliedPct: normA,
    over25Odds: match.odds_over25 && Number(match.odds_over25) > 1.0 ? Number(Number(match.odds_over25).toFixed(2)) : undefined,
    under25Odds: match.odds_under25 && Number(match.odds_under25) > 1.0 ? Number(Number(match.odds_under25).toFixed(2)) : undefined,
    bttsYesOdds: match.odds_btts_yes && Number(match.odds_btts_yes) > 1.0 ? Number(Number(match.odds_btts_yes).toFixed(2)) : undefined,
    bttsNoOdds: match.odds_btts_no && Number(match.odds_btts_no) > 1.0 ? Number(Number(match.odds_btts_no).toFixed(2)) : undefined,
    dc1xOdds: match.odds_dc_1x && Number(match.odds_dc_1x) > 1.0 ? Number(Number(match.odds_dc_1x).toFixed(2)) : undefined,
    dcx2Odds: match.odds_dc_x2 && Number(match.odds_dc_x2) > 1.0 ? Number(Number(match.odds_dc_x2).toFixed(2)) : undefined,
    dc12Odds: match.odds_dc_12 && Number(match.odds_dc_12) > 1.0 ? Number(Number(match.odds_dc_12).toFixed(2)) : undefined,
  };
}
