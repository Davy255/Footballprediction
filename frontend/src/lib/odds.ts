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


export interface ValueOutcomeAnalysis {
  outcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';
  label: string;
  modelProbPct: number;
  marketNormalizedProbPct: number;
  decimalOdds: number;
  modelEdgePp: number; // e.g. +8.5 percentage points
  expectedValuePct: number; // e.g. +14.2% EV
  isPositiveEdge: boolean;
}

export interface ValueEdgeAnalysis {
  hasValidComparison: boolean;
  homeValue?: ValueOutcomeAnalysis;
  drawValue?: ValueOutcomeAnalysis;
  awayValue?: ValueOutcomeAnalysis;
  bestEdgeOutcome?: ValueOutcomeAnalysis;
}

/**
 * Calculates deterministic model-vs-market edge and mathematical Expected Value (EV).
 *
 * Formulae:
 * - Model Edge (pp) = Model Probability (%) - Normalized Market Implied Probability (%)
 * - Expected Value (EV %) = ((Model Probability Decimal * Decimal Odds) - 1) * 100
 *
 * NOTE: Model Edge is a statistical discrepancy indicator and NEVER guarantees betting profit.
 */
export function calculateValueEdgeAnalysis(
  modelProbs: { homePct: number; drawPct: number; awayPct: number },
  oddsAnalysis: MarketOddsAnalysis,
  teamNames: { home: string; away: string }
): ValueEdgeAnalysis {
  if (
    !oddsAnalysis.hasOdds ||
    oddsAnalysis.normalizedHomeImpliedPct == null ||
    oddsAnalysis.normalizedDrawImpliedPct == null ||
    oddsAnalysis.normalizedAwayImpliedPct == null ||
    !oddsAnalysis.rawHomeOdds ||
    !oddsAnalysis.rawDrawOdds ||
    !oddsAnalysis.rawAwayOdds
  ) {
    return { hasValidComparison: false };
  }

  const createOutcome = (
    outcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM',
    label: string,
    modelPct: number,
    marketNormPct: number,
    odds: number
  ): ValueOutcomeAnalysis => {
    const edgePp = Number((modelPct - marketNormPct).toFixed(1));
    const modelProbDecimal = modelPct / 100;
    const evPct = Number((((modelProbDecimal * odds) - 1) * 100).toFixed(1));

    return {
      outcome,
      label,
      modelProbPct: modelPct,
      marketNormalizedProbPct: marketNormPct,
      decimalOdds: odds,
      modelEdgePp: edgePp,
      expectedValuePct: evPct,
      isPositiveEdge: edgePp > 0 && evPct > 0,
    };
  };

  const homeVal = createOutcome('HOME_TEAM', `${teamNames.home} Win`, modelProbs.homePct, oddsAnalysis.normalizedHomeImpliedPct, oddsAnalysis.rawHomeOdds);
  const drawVal = createOutcome('DRAW', 'Draw', modelProbs.drawPct, oddsAnalysis.normalizedDrawImpliedPct, oddsAnalysis.rawDrawOdds);
  const awayVal = createOutcome('AWAY_TEAM', `${teamNames.away} Win`, modelProbs.awayPct, oddsAnalysis.normalizedAwayImpliedPct, oddsAnalysis.rawAwayOdds);

  const all = [homeVal, drawVal, awayVal];
  all.sort((a, b) => b.modelEdgePp - a.modelEdgePp);
  const bestEdge = all[0].modelEdgePp > 0 ? all[0] : undefined;

  return {
    hasValidComparison: true,
    homeValue: homeVal,
    drawValue: drawVal,
    awayValue: awayVal,
    bestEdgeOutcome: bestEdge,
  };
}
