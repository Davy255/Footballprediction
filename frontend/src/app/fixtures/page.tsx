import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchMatches, fetchLeagues } from '@/lib/api';
import { Match, League } from '@/lib/types';
import FixturesClient from './FixturesClient';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Football Fixtures & Match Schedule — Upcoming Matches & Analysis | FootballPredict',
  description:
    'Comprehensive football fixtures, upcoming kickoff schedules, league calendars, and match forecasts across the Premier League, La Liga, Champions League, and top world competitions.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/fixtures',
  },
  openGraph: {
    title: 'Football Fixtures & Match Schedule | FootballPredict',
    description:
      'Explore upcoming football fixtures, kickoff schedules, and statistical match previews across major global competitions.',
    url: getCanonicalUrl('/fixtures'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Fixtures & Match Schedule | FootballPredict',
    description:
      'Upcoming football match schedules, kickoff times, and statistical previews across world football leagues.',
  },
};

export default async function FixturesPage() {
  let initialMatches: Match[] = [];
  let initialLeagues: League[] = [];

  try {
    const [matchesRes, leaguesRes] = await Promise.allSettled([
      fetchMatches({ status: 'SCHEDULED', limit: 150 }),
      fetchLeagues(),
    ]);

    if (matchesRes.status === 'fulfilled' && Array.isArray(matchesRes.value)) {
      initialMatches = matchesRes.value;
    }
    if (leaguesRes.status === 'fulfilled' && Array.isArray(leaguesRes.value)) {
      initialLeagues = leaguesRes.value;
    }
  } catch (err) {
    console.error('Server error fetching fixtures:', err);
  }

  // Schema structured data for collection/schedule page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Football Fixtures & Match Schedule',
    description:
      'Comprehensive schedule of upcoming football matches, kickoff dates, and statistical match forecasts.',
    url: getCanonicalUrl('/fixtures'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icons/icon-512x512.png`,
      },
    },
  };

  return (
    <div className="container py-xl" style={{ minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Fixtures' },
        ]}
      />

      {/* Semantic Server-Side Rendered Header */}
      <header style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            margin: '0 0 0.5rem 0',
            color: 'var(--text-primary)',
          }}
        >
          Football Fixtures &amp; Match Schedule
        </h1>
        <p
          style={{
            fontSize: '0.98rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '820px',
            margin: 0,
          }}
        >
          Browse upcoming match fixtures across the English Premier League, Spanish La Liga, UEFA Champions League, Italian Serie A, German Bundesliga, and French Ligue 1. Check verified kickoff times, calendar dates, and delve into match win probabilities and team form.
        </p>

        {/* Quick Nav Anchor Links */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
          <Link
            href="/football-predictions-today"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#4ade80',
              textDecoration: 'none',
            }}
          >
            Today&apos;s Match Predictions &rarr;
          </Link>
          <Link
            href="/live"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              textDecoration: 'none',
            }}
          >
            Live In-Play Scores &rarr;
          </Link>
          <Link
            href="/leagues"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa',
              textDecoration: 'none',
            }}
          >
            League Standings &rarr;
          </Link>
        </div>
      </header>

      {/* Interactive client component pre-populated with server data */}
      <Suspense
        fallback={
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              background: 'var(--surface-color)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Loading Football Fixture Schedule...
            </div>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              Retrieving kickoff dates and league pairings.
            </p>
          </div>
        }
      >
        <FixturesClient initialMatches={initialMatches} initialLeagues={initialLeagues} />
      </Suspense>
    </div>
  );
}
