import { Match } from './types';
import { fetchMatchesFeed } from './api';

/**
 * Related Matches Discovery Utility for FootballPredict
 *
 * Ranks available fixtures based on multi-factor contextual relevance:
 * 1. Same League / Competition (+100)
 * 2. Involving either of the current match teams (+50)
 * 3. Match status: LIVE (+40), Upcoming/Scheduled (+30), Recent Completed (+10)
 * 4. Strictly excludes the current match and deduplicates by fixture ID
 */
export function getRelatedMatches(
  currentMatch: Match,
  allMatches: Match[],
  limit: number = 6
): Match[] {
  if (!currentMatch || !Array.isArray(allMatches) || allMatches.length === 0) {
    return [];
  }

  const currentId = currentMatch.id;
  const currentLeagueId = currentMatch.league?.id;
  const currentLeagueCode = currentMatch.league?.code;
  const currentLeagueName = (currentMatch.league?.name || '').toLowerCase().trim();

  const currentHomeId = currentMatch.home_team?.id;
  const currentAwayId = currentMatch.away_team?.id;
  const currentHomeName = (currentMatch.home_team?.short_name || currentMatch.home_team?.name || '').toLowerCase().trim();
  const currentAwayName = (currentMatch.away_team?.short_name || currentMatch.away_team?.name || '').toLowerCase().trim();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const scoredMatches: { match: Match; score: number; dateDistance: number }[] = [];
  const seenIds = new Set<number>();
  seenIds.add(currentId);

  for (const m of allMatches) {
    if (!m || !m.id || seenIds.has(m.id)) continue;
    if (!m.home_team?.name || !m.away_team?.name) continue;

    let score = 0;

    // 1. Same Competition / League Matching
    const mLeagueId = m.league?.id;
    const mLeagueCode = m.league?.code;
    const mLeagueName = (m.league?.name || '').toLowerCase().trim();

    const isSameLeague =
      (currentLeagueId && mLeagueId && currentLeagueId === mLeagueId) ||
      (currentLeagueCode && mLeagueCode && currentLeagueCode === mLeagueCode) ||
      (currentLeagueName && mLeagueName && currentLeagueName === mLeagueName);

    if (isSameLeague) {
      score += 100;
    }

    // 2. Featuring Current Teams
    const mHomeId = m.home_team?.id;
    const mAwayId = m.away_team?.id;
    const mHomeName = (m.home_team?.short_name || m.home_team?.name || '').toLowerCase().trim();
    const mAwayName = (m.away_team?.short_name || m.away_team?.name || '').toLowerCase().trim();

    const involvesCurrentTeam =
      (currentHomeId && (mHomeId === currentHomeId || mAwayId === currentHomeId)) ||
      (currentAwayId && (mHomeId === currentAwayId || mAwayId === currentAwayId)) ||
      (currentHomeName && (mHomeName.includes(currentHomeName) || mAwayName.includes(currentHomeName))) ||
      (currentAwayName && (mHomeName.includes(currentAwayName) || mAwayName.includes(currentAwayName)));

    if (involvesCurrentTeam) {
      score += 50;
    }

    // 3. Status & Recency Scoring
    const status = (m.status || '').toUpperCase();
    const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status);
    const isFinished = status === 'FINISHED';
    const isScheduled = ['SCHEDULED', 'TIMED'].includes(status) || (!isLive && !isFinished);

    const mDate = m.utc_date ? new Date(m.utc_date) : null;

    if (isLive) {
      score += 40;
    } else if (isScheduled) {
      score += 30;
    } else if (isFinished) {
      if (mDate && mDate >= thirtyDaysAgo) {
        score += 10;
      } else {
        // Older than 30 days completed matches have low relevance
        score += 1;
      }
    }

    // Calculate time distance from now for tie-breaking
    const dateDistance = mDate ? Math.abs(mDate.getTime() - now.getTime()) : Number.MAX_SAFE_INTEGER;

    seenIds.add(m.id);
    scoredMatches.push({ match: m, score, dateDistance });
  }

  // Sort primarily by highest relevance score, secondarily by closest date to now
  scoredMatches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.dateDistance - b.dateDistance;
  });

  return scoredMatches.slice(0, limit).map(item => item.match);
}

/**
 * Server-side helper to fetch feed and retrieve related matches for a given match.
 */
export async function getRelatedMatchesForMatch(currentMatch: Match, limit: number = 6): Promise<Match[]> {
  try {
    const feed = await fetchMatchesFeed();
    const matches = feed?.matches || [];
    return getRelatedMatches(currentMatch, matches, limit);
  } catch (err) {
    console.error('Error loading related matches feed:', err);
    return [];
  }
}
