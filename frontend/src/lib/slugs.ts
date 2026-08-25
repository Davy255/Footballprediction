import { Match, Team, League } from './types';
import { fetchMatch, fetchMatchesFeed } from './api';

/**
 * Normalizes team names into URL-friendly slugs.
 * E.g. "Arsenal FC" -> "arsenal"
 * "Paris Saint-Germain" -> "paris-saint-germain"
 * "Atlético Madrid" -> "atletico-madrid"
 */
export function slugifyTeamName(name: string): string {
  if (!name) return 'team';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\b(fc|cf|afc|ec|sc|ac|cd|ssc|rc|rb)\b/g, '') // remove common club prefixes/suffixes
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // trim hyphens
    .trim() || 'team';
}

/**
 * Generates a clean, unique, SEO-friendly match URL slug.
 * Format: [home-team]-vs-[away-team]-[matchId]
 * E.g. /prediction/arsenal-vs-liverpool-90812
 */
export function getMatchSlug(match: Match): string {
  const homeName = match.home_team?.short_name || match.home_team?.name || 'home';
  const awayName = match.away_team?.short_name || match.away_team?.name || 'away';
  const homeSlug = slugifyTeamName(homeName);
  const awaySlug = slugifyTeamName(awayName);
  return `${homeSlug}-vs-${awaySlug}-${match.id}`;
}

/**
 * Returns the full relative URL path for a match prediction page.
 */
export function getMatchPredictionUrl(match: Match): string {
  return `/prediction/${getMatchSlug(match)}`;
}

/**
 * Generates the clean team profile URL.
 * E.g. /teams/arsenal
 */
export function getTeamUrl(teamNameOrObj: Team | string): string {
  const name = typeof teamNameOrObj === 'string' ? teamNameOrObj : (teamNameOrObj.short_name || teamNameOrObj.name);
  return `/teams/${slugifyTeamName(name)}`;
}

/**
 * Parses a slug to extract match ID or team queries.
 */
export function parseMatchSlug(slug: string): { matchId: number | null; homeQuery: string; awayQuery: string } {
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  
  // Check if slug ends with an ID: e.g. "arsenal-vs-liverpool-90812"
  const idMatch = decoded.match(/-(\d+)$/);
  const matchId = idMatch ? parseInt(idMatch[1], 10) : null;
  
  const baseSlug = idMatch ? decoded.slice(0, idMatch.index) : decoded;
  const parts = baseSlug.split('-vs-');
  const homeQuery = (parts[0] || '').replace(/-/g, ' ').trim();
  const awayQuery = (parts[1] || '').replace(/-/g, ' ').trim();

  return { matchId, homeQuery, awayQuery };
}

/**
 * Resolves a Match object from a given slug by ID or team name matching.
 */
export async function getMatchBySlug(slug: string): Promise<Match | null> {
  const { matchId, homeQuery, awayQuery } = parseMatchSlug(slug);

  // 1. Direct ID lookup if present
  if (matchId && !isNaN(matchId)) {
    try {
      const match = await fetchMatch(matchId);
      if (match && match.id) return match;
    } catch {
      // Fallback to feed lookup if direct ID failed
    }
  }

  // 2. Query matches feed for slug matching
  try {
    const feed = await fetchMatchesFeed();
    if (feed && Array.isArray(feed.matches)) {
      // First check exact ID if available
      if (matchId) {
        const foundById = feed.matches.find(m => m.id === matchId);
        if (foundById) return foundById;
      }

      // Check team names matching
      if (homeQuery && awayQuery) {
        const hClean = homeQuery.replace(/[^a-z0-9]/g, '');
        const aClean = awayQuery.replace(/[^a-z0-9]/g, '');

        const found = feed.matches.find(m => {
          const mHome = (m.home_team?.name || m.home_team?.short_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const mAway = (m.away_team?.name || m.away_team?.short_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return (mHome.includes(hClean) || hClean.includes(mHome)) && (mAway.includes(aClean) || aClean.includes(mAway));
        });

        if (found) return found;
      }
    }
  } catch (err) {
    console.error('Error finding match by slug:', err);
  }

  return null;
}

export interface TeamProfileStats {
  totalPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  homePlayed: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  awayPlayed: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  awayGoalsFor: number;
  awayGoalsAgainst: number;
  bttsMatches: number;
  over25Matches: number;
}

export interface TeamProfileData {
  team: Team;
  league?: League;
  allMatches: Match[];
  upcomingMatches: Match[];
  recentMatches: Match[];
  nextMatch: Match | null;
  stats: TeamProfileStats;
}

/**
 * Resolves a Team and its comprehensive real matches & statistics from a given slug.
 */
export async function getTeamDataBySlug(slug: string): Promise<TeamProfileData | null> {
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  const cleanTargetSlug = slugifyTeamName(decoded);

  try {
    const feed = await fetchMatchesFeed();
    if (!feed || !Array.isArray(feed.matches)) return null;

    // 1. Identify team from all matches
    const allTeamsMap = new Map<number, { team: Team; league?: League }>();
    for (const m of feed.matches) {
      if (m.home_team?.id) allTeamsMap.set(m.home_team.id, { team: m.home_team, league: m.league });
      if (m.away_team?.id) allTeamsMap.set(m.away_team.id, { team: m.away_team, league: m.league });
    }

    let matchedTeamInfo: { team: Team; league?: League } | null = null;

    for (const [_, info] of allTeamsMap.entries()) {
      const s1 = slugifyTeamName(info.team.name || '');
      const s2 = slugifyTeamName(info.team.short_name || '');
      const s3 = (info.team.tla || '').toLowerCase();
      
      if (s1 === cleanTargetSlug || s2 === cleanTargetSlug || s3 === cleanTargetSlug || cleanTargetSlug.includes(s1) || s1.includes(cleanTargetSlug)) {
        matchedTeamInfo = info;
        break;
      }
    }

    if (!matchedTeamInfo) return null;

    const team = matchedTeamInfo.team;
    const league = matchedTeamInfo.league;

    // 2. Find all matches involving this team
    const teamMatches = feed.matches.filter(m => m.home_team?.id === team.id || m.away_team?.id === team.id);

    // Sort matches chronologically
    teamMatches.sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime());

    const now = Date.now();
    const upcomingMatches: Match[] = [];
    const recentMatches: Match[] = [];

    for (const m of teamMatches) {
      const isFinished = (m.status || '').toUpperCase() === 'FINISHED';
      const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((m.status || '').toUpperCase());
      const matchTime = new Date(m.utc_date).getTime();

      if (isFinished || (isLive && m.home_score != null)) {
        recentMatches.push(m);
      } else {
        upcomingMatches.push(m);
      }
    }

    // Sort recent matches so most recent is first
    recentMatches.sort((a, b) => new Date(b.utc_date).getTime() - new Date(a.utc_date).getTime());

    const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

    // 3. Compute 100% Real Aggregated Match Statistics
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let cleanSheets = 0;

    let homePlayed = 0;
    let homeWins = 0;
    let homeDraws = 0;
    let homeLosses = 0;
    let homeGoalsFor = 0;
    let homeGoalsAgainst = 0;

    let awayPlayed = 0;
    let awayWins = 0;
    let awayDraws = 0;
    let awayLosses = 0;
    let awayGoalsFor = 0;
    let awayGoalsAgainst = 0;

    let bttsMatches = 0;
    let over25Matches = 0;

    for (const m of recentMatches) {
      const isHome = m.home_team?.id === team.id;
      const tScore = isHome ? (m.home_score ?? 0) : (m.away_score ?? 0);
      const oppScore = isHome ? (m.away_score ?? 0) : (m.home_score ?? 0);

      goalsFor += tScore;
      goalsAgainst += oppScore;

      if (oppScore === 0) cleanSheets += 1;
      if (tScore > 0 && oppScore > 0) bttsMatches += 1;
      if ((tScore + oppScore) > 2.5) over25Matches += 1;

      if (tScore > oppScore) wins += 1;
      else if (tScore === oppScore) draws += 1;
      else losses += 1;

      if (isHome) {
        homePlayed += 1;
        homeGoalsFor += tScore;
        homeGoalsAgainst += oppScore;
        if (tScore > oppScore) homeWins += 1;
        else if (tScore === oppScore) homeDraws += 1;
        else homeLosses += 1;
      } else {
        awayPlayed += 1;
        awayGoalsFor += tScore;
        awayGoalsAgainst += oppScore;
        if (tScore > oppScore) awayWins += 1;
        else if (tScore === oppScore) awayDraws += 1;
        else awayLosses += 1;
      }
    }

    const totalPlayed = recentMatches.length;
    const points = (wins * 3) + draws;
    const goalDifference = goalsFor - goalsAgainst;
    const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;
    const avgGoalsScored = totalPlayed > 0 ? Number((goalsFor / totalPlayed).toFixed(2)) : 0;
    const avgGoalsConceded = totalPlayed > 0 ? Number((goalsAgainst / totalPlayed).toFixed(2)) : 0;

    const stats: TeamProfileStats = {
      totalPlayed,
      wins,
      draws,
      losses,
      winRate,
      points,
      goalsFor,
      goalsAgainst,
      goalDifference,
      cleanSheets,
      avgGoalsScored,
      avgGoalsConceded,
      homePlayed,
      homeWins,
      homeDraws,
      homeLosses,
      homeGoalsFor,
      homeGoalsAgainst,
      awayPlayed,
      awayWins,
      awayDraws,
      awayLosses,
      awayGoalsFor,
      awayGoalsAgainst,
      bttsMatches,
      over25Matches,
    };

    return {
      team,
      league,
      allMatches: teamMatches,
      upcomingMatches,
      recentMatches,
      nextMatch,
      stats,
    };
  } catch (err) {
    console.error('Error fetching team profile data by slug:', err);
    return null;
  }
}
