import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public indexable routes
  const routes = [
    {
      url: `${siteConfig.url}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/football-predictions-today`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/fixtures`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/live`,
      lastModified: now,
      changeFrequency: 'always' as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/leaderboard`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/leagues`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/stats`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/predictions`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/disclaimer`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return routes;
}
