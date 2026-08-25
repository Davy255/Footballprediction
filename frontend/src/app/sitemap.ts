import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { fetchMatchesFeed, fetchLeagues } from '@/lib/api';
import { getMatchSlug, slugifyTeamName, slugifyLeagueName } from '@/lib/slugs';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Public URLs (Only canonical, indexable public pages)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/football-predictions-today`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/fixtures`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/live`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/leagues`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/leaderboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/stats`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/disclaimer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Leagues URLs
  const leagueUrls: MetadataRoute.Sitemap = [];
  try {
    const leagues = await fetchLeagues().catch(() => []);
    const seenLeagues = new Set<string>();

    for (const lg of leagues) {
      if (!lg.name && !lg.code) continue;
      const slug = slugifyLeagueName(lg.name, lg.code);
      if (seenLeagues.has(slug)) continue;
      seenLeagues.add(slug);

      leagueUrls.push({
        url: `${siteConfig.url}/leagues/${slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Error generating league sitemap:', err);
  }

  // 3. Dynamic Teams and Match Prediction URLs from match feed
  const teamUrls: MetadataRoute.Sitemap = [];
  const matchUrls: MetadataRoute.Sitemap = [];

  try {
    const feed = await fetchMatchesFeed().catch(() => null);
    const matches = feed?.matches || [];

    const seenTeams = new Set<string>();
    const seenMatches = new Set<string>();

    // Historical window: include completed matches from last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const m of matches) {
      // Home Team URL extraction
      if (m.home_team?.name) {
        const homeSlug = slugifyTeamName(m.home_team.name);
        if (!seenTeams.has(homeSlug) && homeSlug !== 'team') {
          seenTeams.add(homeSlug);
          teamUrls.push({
            url: `${siteConfig.url}/teams/${homeSlug}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }

      // Away Team URL extraction
      if (m.away_team?.name) {
        const awaySlug = slugifyTeamName(m.away_team.name);
        if (!seenTeams.has(awaySlug) && awaySlug !== 'team') {
          seenTeams.add(awaySlug);
          teamUrls.push({
            url: `${siteConfig.url}/teams/${awaySlug}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }

      // Match Prediction URL extraction
      if (m.id && m.home_team?.name && m.away_team?.name) {
        const matchDate = m.utc_date ? new Date(m.utc_date) : null;
        const isFinished = (m.status || '').toUpperCase() === 'FINISHED';

        // Skip historical matches older than 60 days
        if (isFinished && matchDate && matchDate < sixtyDaysAgo) {
          continue;
        }

        const matchSlug = getMatchSlug(m);
        if (!seenMatches.has(matchSlug)) {
          seenMatches.add(matchSlug);
          matchUrls.push({
            url: `${siteConfig.url}/prediction/${matchSlug}`,
            lastModified: matchDate || now,
            changeFrequency: isFinished ? 'weekly' : 'hourly',
            priority: isFinished ? 0.6 : 0.8,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error generating team & match sitemap:', err);
  }

  return [...staticUrls, ...leagueUrls, ...teamUrls, ...matchUrls];
}
