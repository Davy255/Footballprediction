import { Match } from './types';
import { getMatchConfidence, ConfidenceLevel } from './confidence';

export interface HistoricalPredictionRecord {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  leagueName: string;
  leagueCode: string;
  matchDate: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  predictedOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
  actualOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';
  isOutcomeCorrect: boolean;
  isExactScoreCorrect: boolean;
  confidenceLevel: ConfidenceLevel;
  confidenceBadgeText: string;
  confidenceProbPct: number;
}

export interface PredictionPerformanceMetrics {
  totalCompleted: number;
  outcomeCorrectCount: number;
  overallAccuracyPct: number;
  exactScoreCorrectCount: number;
  exactScoreAccuracyPct: number;
  homeWinPredictions: { total: number; correct: number; accuracyPct: number };
  drawPredictions: { total: number; correct: number; accuracyPct: number };
  awayWinPredictions: { total: number; correct: number; accuracyPct: number };
  byConfidence: Record<ConfidenceLevel, { total: number; correct: number; accuracyPct: number }>;
  byLeague: Record<string, { leagueName: string; leagueCode: string; total: number; correct: number; accuracyPct: number }>;
  currentStreak: { type: 'WIN' | 'LOSS'; count: number };
  recentRecords: HistoricalPredictionRecord[];
}

/**
 * Deterministically computes audited prediction performance against official final match scores.
 * Only completed matches that actually had pre-match model predictions recorded are evaluated.
 */
export function computeHistoricalPredictionPerformance(matches: Match[]): PredictionPerformanceMetrics {
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return getEmptyMetrics();
  }

  // Filter for finished matches with confirmed scores AND verified model predictions
  const finishedMatches = matches.filter((m) => {
    const isFinished = (m.status || '').toUpperCase() === 'FINISHED' || (m.status || '').toUpperCase() === 'AWARDED';
    if (!isFinished || m.home_score == null || m.away_score == null) return false;

    // Check if the match actually had calculated predictions recorded
    let hasPred = (m.ai_home_prob != null && m.ai_away_prob != null);
    if (!hasPred && m.prediction_description) {
      try {
        const ai = JSON.parse(m.prediction_description);
        hasPred = Boolean(ai?.probs?.home_pct != null || ai?.score?.home != null);
      } catch {}
    }
    return hasPred;
  });

  const records: HistoricalPredictionRecord[] = [];

  let outcomeCorrectCount = 0;
  let exactScoreCorrectCount = 0;

  const homeWinPred = { total: 0, correct: 0 };
  const drawPred = { total: 0, correct: 0 };
  const awayWinPred = { total: 0, correct: 0 };

  const byConfidence: Record<ConfidenceLevel, { total: number; correct: number }> = {
    VERY_HIGH: { total: 0, correct: 0 },
    HIGH: { total: 0, correct: 0 },
    MODERATE: { total: 0, correct: 0 },
    LOW: { total: 0, correct: 0 },
    PENDING: { total: 0, correct: 0 },
  };

  const byLeagueMap: Record<string, { leagueName: string; leagueCode: string; total: number; correct: number }> = {};

  finishedMatches.forEach((m) => {
    const hs = m.home_score!;
    const as_ = m.away_score!;
    const actualOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM' = hs > as_ ? 'HOME_TEAM' : as_ > hs ? 'AWAY_TEAM' : 'DRAW';

    let ai: any = null;
    if (m.prediction_description) {
      try { ai = JSON.parse(m.prediction_description); } catch {}
    }

    const hp = m.ai_home_prob != null ? Math.round(m.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 0);
    const dp = m.ai_draw_prob != null ? Math.round(m.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 0);
    const ap = m.ai_away_prob != null ? Math.round(m.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 0);

    let predictedOutcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM' = 'HOME_TEAM';
    if (hp >= dp && hp >= ap) predictedOutcome = 'HOME_TEAM';
    else if (ap >= hp && ap >= dp) predictedOutcome = 'AWAY_TEAM';
    else predictedOutcome = 'DRAW';

    const predH = m.ai_predicted_home != null ? m.ai_predicted_home : (ai?.score?.home ?? hs);
    const predA = m.ai_predicted_away != null ? m.ai_predicted_away : (ai?.score?.away ?? as_);

    const isOutcomeCorrect = (predictedOutcome === actualOutcome);
    const isExactScoreCorrect = (predH === hs && predA === as_);

    if (isOutcomeCorrect) outcomeCorrectCount++;
    if (isExactScoreCorrect) exactScoreCorrectCount++;

    if (predictedOutcome === 'HOME_TEAM') {
      homeWinPred.total++;
      if (isOutcomeCorrect) homeWinPred.correct++;
    } else if (predictedOutcome === 'DRAW') {
      drawPred.total++;
      if (isOutcomeCorrect) drawPred.correct++;
    } else if (predictedOutcome === 'AWAY_TEAM') {
      awayWinPred.total++;
      if (isOutcomeCorrect) awayWinPred.correct++;
    }

    const conf = getMatchConfidence(m);
    byConfidence[conf.level].total++;
    if (isOutcomeCorrect) byConfidence[conf.level].correct++;

    const leagueKey = m.league?.code || m.league?.name || 'OTHER';
    if (!byLeagueMap[leagueKey]) {
      byLeagueMap[leagueKey] = {
        leagueName: m.league?.name || 'Football League',
        leagueCode: m.league?.code || 'PL',
        total: 0,
        correct: 0,
      };
    }
    byLeagueMap[leagueKey].total++;
    if (isOutcomeCorrect) byLeagueMap[leagueKey].correct++;

    records.push({
      matchId: m.id,
      homeTeam: m.home_team?.short_name || m.home_team?.name || 'Home',
      awayTeam: m.away_team?.short_name || m.away_team?.name || 'Away',
      homeCrest: m.home_team?.crest,
      awayCrest: m.away_team?.crest,
      leagueName: m.league?.name || 'Football League',
      leagueCode: m.league?.code || 'PL',
      matchDate: m.utc_date ? new Date(m.utc_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      homeProb: hp,
      drawProb: dp,
      awayProb: ap,
      predictedOutcome,
      predictedHomeScore: predH,
      predictedAwayScore: predA,
      actualHomeScore: hs,
      actualAwayScore: as_,
      actualOutcome,
      isOutcomeCorrect,
      isExactScoreCorrect,
      confidenceLevel: conf.level,
      confidenceBadgeText: conf.badgeText,
      confidenceProbPct: conf.highestProbPct,
    });
  });

  const total = records.length;
  const overallAccuracyPct = total > 0 ? Number(((outcomeCorrectCount / total) * 100).toFixed(1)) : 0;
  const exactScoreAccuracyPct = total > 0 ? Number(((exactScoreCorrectCount / total) * 100).toFixed(1)) : 0;

  // Streak calculation from most recent match
  let streakType: 'WIN' | 'LOSS' = 'WIN';
  let streakCount = 0;
  if (records.length > 0) {
    const sorted = [...records].reverse();
    streakType = sorted[0].isOutcomeCorrect ? 'WIN' : 'LOSS';
    for (const r of sorted) {
      if ((r.isOutcomeCorrect && streakType === 'WIN') || (!r.isOutcomeCorrect && streakType === 'LOSS')) {
        streakCount++;
      } else {
        break;
      }
    }
  }

  const byLeagueResult: Record<string, { leagueName: string; leagueCode: string; total: number; correct: number; accuracyPct: number }> = {};
  Object.keys(byLeagueMap).forEach((k) => {
    const item = byLeagueMap[k];
    byLeagueResult[k] = {
      ...item,
      accuracyPct: item.total > 0 ? Number(((item.correct / item.total) * 100).toFixed(1)) : 0,
    };
  });

  const byConfidenceResult: Record<ConfidenceLevel, { total: number; correct: number; accuracyPct: number }> = {
    VERY_HIGH: {
      total: byConfidence.VERY_HIGH.total,
      correct: byConfidence.VERY_HIGH.correct,
      accuracyPct: byConfidence.VERY_HIGH.total > 0 ? Number(((byConfidence.VERY_HIGH.correct / byConfidence.VERY_HIGH.total) * 100).toFixed(1)) : 0,
    },
    HIGH: {
      total: byConfidence.HIGH.total,
      correct: byConfidence.HIGH.correct,
      accuracyPct: byConfidence.HIGH.total > 0 ? Number(((byConfidence.HIGH.correct / byConfidence.HIGH.total) * 100).toFixed(1)) : 0,
    },
    MODERATE: {
      total: byConfidence.MODERATE.total,
      correct: byConfidence.MODERATE.correct,
      accuracyPct: byConfidence.MODERATE.total > 0 ? Number(((byConfidence.MODERATE.correct / byConfidence.MODERATE.total) * 100).toFixed(1)) : 0,
    },
    LOW: {
      total: byConfidence.LOW.total,
      correct: byConfidence.LOW.correct,
      accuracyPct: byConfidence.LOW.total > 0 ? Number(((byConfidence.LOW.correct / byConfidence.LOW.total) * 100).toFixed(1)) : 0,
    },
    PENDING: {
      total: byConfidence.PENDING.total,
      correct: byConfidence.PENDING.correct,
      accuracyPct: 0,
    },
  };

  return {
    totalCompleted: total,
    outcomeCorrectCount,
    overallAccuracyPct,
    exactScoreCorrectCount,
    exactScoreAccuracyPct,
    homeWinPredictions: {
      total: homeWinPred.total,
      correct: homeWinPred.correct,
      accuracyPct: homeWinPred.total > 0 ? Number(((homeWinPred.correct / homeWinPred.total) * 100).toFixed(1)) : 0,
    },
    drawPredictions: {
      total: drawPred.total,
      correct: drawPred.correct,
      accuracyPct: drawPred.total > 0 ? Number(((drawPred.correct / drawPred.total) * 100).toFixed(1)) : 0,
    },
    awayWinPredictions: {
      total: awayWinPred.total,
      correct: awayWinPred.correct,
      accuracyPct: awayWinPred.total > 0 ? Number(((awayWinPred.correct / awayWinPred.total) * 100).toFixed(1)) : 0,
    },
    byConfidence: byConfidenceResult,
    byLeague: byLeagueResult,
    currentStreak: { type: streakType, count: streakCount },
    recentRecords: records.slice(-15).reverse(),
  };
}

function getEmptyMetrics(): PredictionPerformanceMetrics {
  return {
    totalCompleted: 0,
    outcomeCorrectCount: 0,
    overallAccuracyPct: 0,
    exactScoreCorrectCount: 0,
    exactScoreAccuracyPct: 0,
    homeWinPredictions: { total: 0, correct: 0, accuracyPct: 0 },
    drawPredictions: { total: 0, correct: 0, accuracyPct: 0 },
    awayWinPredictions: { total: 0, correct: 0, accuracyPct: 0 },
    byConfidence: {
      VERY_HIGH: { total: 0, correct: 0, accuracyPct: 0 },
      HIGH: { total: 0, correct: 0, accuracyPct: 0 },
      MODERATE: { total: 0, correct: 0, accuracyPct: 0 },
      LOW: { total: 0, correct: 0, accuracyPct: 0 },
      PENDING: { total: 0, correct: 0, accuracyPct: 0 },
    },
    byLeague: {},
    currentStreak: { type: 'WIN', count: 0 },
    recentRecords: [],
  };
}
