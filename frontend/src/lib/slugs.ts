import { Match } from './types';
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
