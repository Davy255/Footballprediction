import { Match } from './types';

export type ConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';

export interface ConfidenceDetails {
  level: ConfidenceLevel;
  label: string;
  badgeText: string;
  highestProbPct: number;
  favoredOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM' | 'EVEN';
  favoredTeamName?: string;
  badgeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  explanation: string;
}

/**
 * Calculates a deterministic confidence classification from existing probabilities.
 * In a standard 3-way (1X2) football market:
 * - >= 65%: Very High Confidence (Dominant favourite)
 * - 55% - 64%: High Confidence (Clear favourite)
 * - 45% - 54%: Moderate Confidence (Slight statistical edge)
 * - < 45%: Low Margin / Balanced (Close contest / high draw risk)
 *
 * NOTE: Confidence indicates model probability conviction and is distinct from guaranteed outcomes.
 */
export function getMatchConfidence(match: Match): ConfidenceDetails {
  let homePct = match.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : 0;
  let drawPct = match.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : 0;
  let awayPct = match.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : 0;

  if (homePct === 0 && drawPct === 0 && awayPct === 0 && match.prediction_description) {
    try {
      const ai = JSON.parse(match.prediction_description);
      if (ai?.probs) {
        homePct = ai.probs.home_pct ?? 0;
        drawPct = ai.probs.draw_pct ?? 0;
        awayPct = ai.probs.away_pct ?? 0;
      }
    } catch {}
  }

  // Fallback if probability fields are null
  if (homePct === 0 && drawPct === 0 && awayPct === 0) {
    homePct = 45;
    drawPct = 27;
    awayPct = 28;
  }

  const maxProb = Math.max(homePct, drawPct, awayPct);
  const homeName = match.home_team?.short_name || match.home_team?.name || 'Home Team';
  const awayName = match.away_team?.short_name || match.away_team?.name || 'Away Team';

  let favoredOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM' | 'EVEN' = 'EVEN';
  let favoredTeamName: string | undefined = undefined;

  if (homePct === maxProb && homePct > awayPct && homePct > drawPct) {
    favoredOutcome = 'HOME_TEAM';
    favoredTeamName = homeName;
  } else if (awayPct === maxProb && awayPct > homePct && awayPct > drawPct) {
    favoredOutcome = 'AWAY_TEAM';
    favoredTeamName = awayName;
  } else if (drawPct === maxProb && drawPct > homePct && drawPct > awayPct) {
    favoredOutcome = 'DRAW';
  }

  if (maxProb >= 65) {
    return {
      level: 'VERY_HIGH',
      label: 'Very High Confidence',
      badgeText: 'VERY HIGH',
      highestProbPct: maxProb,
      favoredOutcome,
      favoredTeamName,
      badgeColor: '#22c55e',
      textColor: '#86efac',
      bgColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      explanation: `Model assigns a ${maxProb}% dominant probability to this outcome based on form and tactical metrics.`,
    };
  }

  if (maxProb >= 55) {
    return {
      level: 'HIGH',
      label: 'High Confidence',
      badgeText: 'HIGH',
      highestProbPct: maxProb,
      favoredOutcome,
      favoredTeamName,
      badgeColor: '#38bdf8',
      textColor: '#7dd3fc',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      borderColor: 'rgba(56, 189, 248, 0.3)',
      explanation: `Model gives a ${maxProb}% clear statistical edge to this outcome.`,
    };
  }

  if (maxProb >= 45) {
    return {
      level: 'MODERATE',
      label: 'Moderate Confidence',
      badgeText: 'MODERATE',
      highestProbPct: maxProb,
      favoredOutcome,
      favoredTeamName,
      badgeColor: '#eab308',
      textColor: '#fde047',
      bgColor: 'rgba(234, 179, 8, 0.12)',
      borderColor: 'rgba(234, 179, 8, 0.3)',
      explanation: `Competitive fixture with a moderate ${maxProb}% statistical lead.`,
    };
  }

  return {
    level: 'LOW',
    label: 'Balanced / Low Margin',
    badgeText: 'BALANCED',
    highestProbPct: maxProb,
    favoredOutcome,
    favoredTeamName,
    badgeColor: '#94a3b8',
    textColor: '#cbd5e1',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    explanation: `Evenly matched contest with distributed probabilities across 1X2 outcomes.`,
  };
}
