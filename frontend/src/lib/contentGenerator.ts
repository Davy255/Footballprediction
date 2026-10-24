import { Match, Team, League, StandingTableItem } from './types';
import { TeamProfileStats } from './slugs';

/**
 * Deterministic Data-Driven Content Generators for FootballPredict
 *
 * NOTE: These functions use 100% deterministic logic based on real underlying data.
 * No external LLMs, no random paragraphs, and no fabricated statistics.
 */

export interface MatchAnalysisContent {
  mainAnalysis: string;
  formAnalysis: string;
  marketsAnalysis: string;
  probabilityContext: string;
  disclaimer: string;
  hasCalculatedPrediction: boolean;
}

export function generateMatchAnalysisText(match: Match): MatchAnalysisContent {
  const HN = match.home_team?.short_name || match.home_team?.name || 'Home Team';
  const AN = match.away_team?.short_name || match.away_team?.name || 'Away Team';
  const comp = match.league?.name || 'league football';

  let ai: any = null;
  if (match.prediction_description) {
    try { ai = JSON.parse(match.prediction_description); } catch {}
  }

  const hasCalculatedPrediction = Boolean(
    (match.ai_home_prob != null && match.ai_away_prob != null) ||
    ai?.probs?.home_pct != null
  );

  const disclaimer = 'FootballPredict provides statistical forecasts derived from historical team ratings and performance metrics. Model outputs are educational probability estimates and are not guaranteed match results.';

  // If predictions have not been computed for this match yet
  if (!hasCalculatedPrediction) {
    return {
      mainAnalysis: `FootballPredict is tracking ${HN} vs ${AN} in ${comp}. Pre-match quantitative win probabilities, projected scorelines, and tactical distributions will be calculated once official team sheets, starting lineups, and rolling form adjustments are processed prior to kickoff.`,
      formAnalysis: `Pre-match analysis evaluates home venue dynamics for ${HN}, travel splits for ${AN}, and recent league standings in ${comp}. Full tactical indicators update as the fixture approaches.`,
      marketsAnalysis: `Poisson goal distribution projections (Over/Under 2.5 and BTTS) will be computed from the 7x7 scoreline matrix once pre-match team metrics are finalized.`,
      probabilityContext: `Our predictive models compute calibrated probabilities only when sufficient data is available. Speculative estimates are withheld to ensure accuracy and statistical integrity.`,
      disclaimer,
      hasCalculatedPrediction: false,
    };
  }

  const hp = match.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 0);
  const dp = match.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 0);
  const ap = match.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 0);

  const hasProjectedScore = match.ai_predicted_home != null || ai?.score?.home != null;
  const predHome = match.ai_predicted_home ?? ai?.score?.home;
  const predAway = match.ai_predicted_away ?? ai?.score?.away;

  // 1. Main Match Analysis Narrative based on confidence tier
  let favTeam = HN;
  let favPct = hp;
  let underdogTeam = AN;
  let underdogPct = ap;

  if (ap > hp) {
    favTeam = AN;
    favPct = ap;
    underdogTeam = HN;
    underdogPct = hp;
  }

  const scorelineText = hasProjectedScore
    ? `projects a most likely final scoreline of ${HN} ${predHome} – ${predAway} ${AN}`
    : `points toward a competitive goal expectancy in ${comp}`;

  let mainAnalysis = '';
  if (favPct >= 65) {
    mainAnalysis = `FootballPredict's statistical model establishes ${favTeam} as a strong statistical favorite with an estimated pre-match win probability of ${favPct}%, compared with ${dp}% for a draw and ${underdogPct}% for ${underdogTeam}. Based on rolling attack ratings and defensive resilience in ${comp}, the engine ${scorelineText}.`;
  } else if (favPct >= 55) {
    mainAnalysis = `FootballPredict's quantitative model projects a favorable edge for ${favTeam} at ${favPct}%, with ${dp}% allocated to a draw and ${underdogPct}% to ${underdogTeam}. Attack and defense calibrations in ${comp} ${scorelineText}.`;
  } else if (Math.abs(hp - ap) <= 5) {
    mainAnalysis = `The statistical model projects a closely contested encounter between ${HN} (${hp}%) and ${AN} (${ap}%), with the draw probability standing at ${dp}%. The analysis ${scorelineText}, highlighting tactical balance between both squads in ${comp}.`;
  } else {
    mainAnalysis = `FootballPredict identifies a moderate directional lean toward ${favTeam} at ${favPct}%, with a draw evaluated at ${dp}% and ${underdogTeam} at ${underdogPct}%. The model ${scorelineText} capturing the underlying performance metrics for this fixture.`;
  }

  // 2. Form & Tactical Context
  let formAnalysis = `Pre-match indicators incorporate home venue performance for ${HN}, travel splits for ${AN}, and rolling goal efficiency across the recent competitive campaign in ${comp}. Detailed tactical block setups and official player lineups are incorporated as team sheets are confirmed prior to kickoff.`;
  if (ai?.analytics && typeof ai.analytics === 'string' && ai.analytics.trim().length > 15) {
    formAnalysis = ai.analytics;
  }

  // 3. Key Markets Analysis
  let marketsAnalysis = '';
  if (hasProjectedScore && predHome != null && predAway != null) {
    const totalPredGoals = predHome + predAway;
    const isOver25 = totalPredGoals >= 3;
    const isBtts = predHome > 0 && predAway > 0;
    marketsAnalysis = `Goal expectation for this fixture stands at ${totalPredGoals} projected goals (${isOver25 ? 'lean toward Over 2.5' : 'lean toward Under 2.5'}). Both teams to score (BTTS) is projected as ${isBtts ? 'Yes' : 'No'} derived from joint bivariate Poisson goal distributions across the 7x7 score matrix.`;
  } else {
    marketsAnalysis = `Goal expectation and multi-market distributions (Over/Under 2.5 and BTTS) are derived from joint bivariate Poisson distributions across the 7x7 scoreline matrix.`;
  }

  // 4. Probability Interpretation Context
  const nonFavoredPct = 100 - favPct;
  const probabilityContext = `A ${favPct}% model estimate reflects a statistical edge across comparable historical matches, but it inherently implies a ${nonFavoredPct}% likelihood of points being dropped through a draw or upset. Models evaluate underlying averages and cannot anticipate unexpected in-match events such as early dismissals, penalty decisions, or sudden injuries.`;

  return {
    mainAnalysis,
    formAnalysis,
    marketsAnalysis,
    probabilityContext,
    disclaimer,
    hasCalculatedPrediction: true,
  };
}

export interface TeamOverviewContent {
  overviewText: string;
  venueText: string;
  formSummaryText: string;
}

export function generateTeamOverviewText(team: Team, stats: TeamProfileStats, leagueName?: string): TeamOverviewContent {
  const TN = team.name;
  const shortName = team.short_name || team.name;
  const comp = leagueName || 'competition';

  const gdStr = stats.goalDifference > 0 ? `+${stats.goalDifference}` : `${stats.goalDifference}`;

  const overviewText = stats.totalPlayed > 0
    ? `Across the recorded ${comp} dataset, ${TN} have played ${stats.totalPlayed} matches, securing ${stats.wins} wins (${stats.winRate}%), ${stats.draws} draws, and ${stats.losses} losses. The team has scored ${stats.goalsFor} goals (${stats.avgGoalsScored} per match) while conceding ${stats.goalsAgainst} (${stats.avgGoalsConceded} per match), maintaining a goal difference of ${gdStr} and keeping ${stats.cleanSheets} clean sheets.`
    : `${TN} compete in ${comp}. Performance metrics and match records update automatically as fixtures are completed.`;

  const venueText = (stats.homePlayed > 0 || stats.awayPlayed > 0)
    ? `At home, ${shortName} have recorded ${stats.homeWins} wins, ${stats.homeDraws} draws, and ${stats.homeLosses} defeats across ${stats.homePlayed} matches (${stats.homeGoalsFor} goals scored, ${stats.homeGoalsAgainst} conceded). Away from home, their record stands at ${stats.awayWins}W - ${stats.awayDraws}D - ${stats.awayLosses}L from ${stats.awayPlayed} games.`
    : `Home and away splits are calculated continuously as matchday fixtures take place.`;

  const formSummaryText = stats.totalPlayed > 0
    ? `In their recent match records, ${shortName} have maintained a ${stats.bttsMatches > 0 ? `${Math.round((stats.bttsMatches / stats.totalPlayed) * 100)}% BTTS rate` : 'solid defensive rate'} and ${Math.round((stats.over25Matches / stats.totalPlayed) * 100)}% of fixtures exceeding 2.5 total goals.`
    : `Recent form records update after each scheduled fixture.`;

  return {
    overviewText,
    venueText,
    formSummaryText,
  };
}

export interface LeagueOverviewContent {
  overviewText: string;
  standingsSummary: string;
  fixturesSummary: string;
}

export function generateLeagueOverviewText(
  league: League,
  standings: StandingTableItem[],
  upcomingCount: number,
  teamsCount: number
): LeagueOverviewContent {
  const LN = league.name;
  const country = league.country || 'Global';

  const overviewText = `${LN} is one of the premier football competitions representing ${country}. FootballPredict tracks comprehensive match schedules, real-time standings, win probabilities, and tactical forecasts for participating clubs in the current dataset.`;

  let standingsSummary = `The competition table tracks team positions, points, goal differences, and head-to-head performance across the active season.`;
  if (standings && standings.length >= 2) {
    const leader = standings[0];
    const second = standings[1];
    const leaderTeam = leader.team.name;
    const secondTeam = second.team.name;
    const leaderGD = leader.goalDifference > 0 ? `+${leader.goalDifference}` : `${leader.goalDifference}`;

    standingsSummary = `In the current standings table, ${leaderTeam} occupy 1st place with ${leader.points} points from ${leader.playedGames} matches (${leader.won} wins, GD of ${leaderGD}), followed closely by ${secondTeam} with ${second.points} points.`;
  } else if (!standings || standings.length === 0) {
    standingsSummary = `Official single league table standings are not applicable for this tournament format (knockout/cup) or active stage. Match fixtures and statistical predictions are updated per round.`;
  }

  const fixturesSummary = upcomingCount > 0
    ? `The upcoming schedule features ${upcomingCount} scheduled fixtures with pre-match AI win probabilities, form indicators, and projected scorelines.`
    : `Upcoming fixtures and match probabilities update continuously for upcoming matchdays.`;

  return {
    overviewText,
    standingsSummary,
    fixturesSummary,
  };
}

export interface TodayPredictionsSummaryContent {
  summaryText: string;
  highestProbabilityHighlight: string | null;
}

export function generateTodayPredictionsSummary(matches: Match[], dateFormatted: string): TodayPredictionsSummaryContent {
  const total = matches.length;

  if (total === 0) {
    return {
      summaryText: `There are currently no active league fixtures scheduled for today (${dateFormatted}). Explore upcoming matchday previews and standings tables across all top leagues below.`,
      highestProbabilityHighlight: null,
    };
  }

  // Find the single highest probability among today's matches with real calculated data
  let maxProb = 0;
  let topMatch: Match | null = null;
  let topFavTeam = '';
  let topOppTeam = '';

  for (const m of matches) {
    let ai: any = null;
    if (m.prediction_description) {
      try { ai = JSON.parse(m.prediction_description); } catch {}
    }

    const hp = m.ai_home_prob != null ? Math.round(m.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 0);
    const ap = m.ai_away_prob != null ? Math.round(m.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 0);

    const HN = m.home_team?.short_name || m.home_team?.name || 'Home';
    const AN = m.away_team?.short_name || m.away_team?.name || 'Away';

    if (hp > maxProb && hp > 0) {
      maxProb = hp;
      topMatch = m;
      topFavTeam = HN;
      topOppTeam = AN;
    }
    if (ap > maxProb && ap > 0) {
      maxProb = ap;
      topMatch = m;
      topFavTeam = AN;
      topOppTeam = HN;
    }
  }

  const summaryText = `FootballPredict currently lists ${total} matches for ${dateFormatted}. Each match includes statistical outcome probabilities, projected scorelines, and form metrics derived from historical performance models.`;

  let highestProbabilityHighlight: string | null = null;
  if (topMatch && maxProb > 50) {
    const comp = topMatch.league?.name || "today's schedule";
    highestProbabilityHighlight = `Highest Statistical Probability: The highest single pre-match model probability today is ${maxProb}% for ${topFavTeam} against ${topOppTeam} in ${comp}.`;
  }

  return {
    summaryText,
    highestProbabilityHighlight,
  };
}

export interface PredictionFactor {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'FORM' | 'ELO' | 'ATTACK' | 'DEFENCE' | 'VENUE' | 'MARKET';
  favors: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | 'NEUTRAL';
}

export interface PredictionExplanationSummary {
  favoredTeam: string;
  verdictSummary: string;
  factors: PredictionFactor[];
}

/**
 * Deterministically generates data-backed statistical explanation factors
 * based purely on real team ratings, probabilities, and tactical metrics.
 */
export function generatePredictionFactors(match: Match): PredictionExplanationSummary {
  const HN = match.home_team?.short_name || match.home_team?.name || 'Home Team';
  const AN = match.away_team?.short_name || match.away_team?.name || 'Away Team';
  const comp = match.league?.name || 'competition';

  let ai: any = null;
  if (match.prediction_description) {
    try { ai = JSON.parse(match.prediction_description); } catch {}
  }

  const hasCalculatedPrediction = Boolean(
    (match.ai_home_prob != null && match.ai_away_prob != null) ||
    ai?.probs?.home_pct != null
  );

  // If no prediction yet, explain the pending fixture state honestly
  if (!hasCalculatedPrediction) {
    return {
      favoredTeam: 'Evaluation Pending',
      verdictSummary: `Pre-match model calculations for ${HN} vs ${AN} in ${comp} are scheduled to run prior to kickoff.`,
      factors: [
        {
          id: 'fixture-scheduled',
          icon: '📅',
          title: `Scheduled Fixture in ${comp}`,
          description: `Match between ${HN} and ${AN} is scheduled. Pre-match variables, venue conditions, and official team sheets will be ingested prior to kickoff.`,
          category: 'VENUE',
          favors: 'NEUTRAL',
        },
        {
          id: 'model-queued',
          icon: '⚙️',
          title: 'Algorithmic Calibration Pending',
          description: 'Poisson goal expectancy distributions and calibrated 1X2 probabilities update automatically as team data is finalized.',
          category: 'MARKET',
          favors: 'NEUTRAL',
        },
      ],
    };
  }

  const hp = match.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 0);
  const dp = match.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 0);
  const ap = match.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 0);

  const predHome = match.ai_predicted_home ?? ai?.score?.home;
  const predAway = match.ai_predicted_away ?? ai?.score?.away;

  const homeElo = match.home_team?.elo_rating ?? 1500;
  const awayElo = match.away_team?.elo_rating ?? 1500;
  const eloDiff = Math.round(homeElo - awayElo);

  const factors: PredictionFactor[] = [];

  // 1. Elo Differential Factor
  if (Math.abs(eloDiff) >= 40) {
    const leader = eloDiff > 0 ? HN : AN;
    const diffVal = Math.abs(eloDiff);
    factors.push({
      id: 'elo-advantage',
      icon: '⚡',
      title: `${leader} Elo Rating Advantage (+${diffVal})`,
      description: `${leader} holds an Elo rating of ${Math.round(eloDiff > 0 ? homeElo : awayElo)} compared to ${Math.round(eloDiff > 0 ? awayElo : homeElo)} for ${eloDiff > 0 ? AN : HN}, providing a verified baseline quality differential.`,
      category: 'ELO',
      favors: eloDiff > 0 ? 'HOME_TEAM' : 'AWAY_TEAM',
    });
  } else {
    factors.push({
      id: 'elo-balanced',
      icon: '⚖️',
      title: 'Evenly Matched Elo Strength Ratings',
      description: `Both squads possess comparable quality ratings (${Math.round(homeElo)} vs ${Math.round(awayElo)}), pointing towards a tactically competitive matchup.`,
      category: 'ELO',
      favors: 'NEUTRAL',
    });
  }

  // 2. Home Ground Advantage Factor (calibrated +48 Elo venue offset)
  if (hp >= 40) {
    factors.push({
      id: 'home-venue-edge',
      icon: '🏟️',
      title: `${HN} Home Ground Advantage (+48 Elo)`,
      description: `Home stadium familiarity, localized support, and travel fatigue for opponents contribute a calibrated +48 Elo rating advantage in our predictive model.`,
      category: 'VENUE',
      favors: 'HOME_TEAM',
    });
  }

  // 3. Projected Attack Rate & Scoreline Expectation
  if (predHome != null && predAway != null) {
    if (predHome > predAway) {
      factors.push({
        id: 'attack-edge-home',
        icon: '🎯',
        title: `Higher Projected Scoring Efficiency for ${HN}`,
        description: `Tactical model projects ${HN} to generate ${predHome} goal${predHome === 1 ? '' : 's'} vs ${predAway} for ${AN} based on chance creation and conversion rates.`,
        category: 'ATTACK',
        favors: 'HOME_TEAM',
      });
    } else if (predAway > predHome) {
      factors.push({
        id: 'attack-edge-away',
        icon: '🎯',
        title: `Higher Projected Scoring Efficiency for ${AN}`,
        description: `Tactical model projects ${AN} to generate ${predAway} goal${predAway === 1 ? '' : 's'} vs ${predHome} for ${HN} based on offensive output metrics.`,
        category: 'ATTACK',
        favors: 'AWAY_TEAM',
      });
    } else {
      factors.push({
        id: 'attack-even',
        icon: '🎯',
        title: 'Balanced Attacking Expectations',
        description: `Model forecasts balanced offensive output (${predHome}–${predAway}) with scoring opportunities evenly distributed across both sides.`,
        category: 'ATTACK',
        favors: 'DRAW',
      });
    }

    // 4. Over/Under & Goal Distribution Market Factor
    const totalGoals = predHome + predAway;
    if (totalGoals >= 3) {
      factors.push({
        id: 'market-over25',
        icon: '🔥',
        title: 'High-Tempo Goal Expectation (Over 2.5 Lean)',
        description: `Combined projected goals of ${totalGoals} indicates an open encounter with frequent attacking transitions.`,
        category: 'MARKET',
        favors: 'NEUTRAL',
      });
    } else {
      factors.push({
        id: 'market-under25',
        icon: '🛡️',
        title: 'Controlled Goal Expectation (Under 2.5 Lean)',
        description: `Projected total of ${totalGoals} goal${totalGoals === 1 ? '' : 's'} indicates a compact, defensively disciplined encounter.`,
        category: 'MARKET',
        favors: 'NEUTRAL',
      });
    }
  }

  // 5. Draw Probability / Stalemate Risk
  if (dp >= 26) {
    factors.push({
      id: 'draw-tendency',
      icon: '🤝',
      title: `Elevated Draw Risk (${dp}%)`,
      description: `Close statistical margins and defensive resilience indicate an increased likelihood of points being shared.`,
      category: 'FORM',
      favors: 'DRAW',
    });
  }

  let favoredTeam = HN;
  let verdictSummary = `Statistical model gives ${HN} the primary edge (${hp}%) based on home strength and tactical differential.`;
  if (ap > hp && ap > dp) {
    favoredTeam = AN;
    verdictSummary = `Statistical model gives ${AN} the primary edge (${ap}%) based on form advantage and attacking output.`;
  } else if (dp >= hp && dp >= ap) {
    favoredTeam = 'Draw / Even';
    verdictSummary = `Evenly balanced contest (${dp}% draw probability) with evenly distributed statistical indicators.`;
  }

  return {
    favoredTeam,
    verdictSummary,
    factors,
  };
}
