import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { League, StandingTableItem } from '@/lib/types';
import { fetchLeagues, fetchLeagueStandings } from '@/lib/api';
import { getLeagueUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaguesClient from './LeaguesClient';

export const revalidate = 300; // Standings cached for 5 minutes

export const metadata: Metadata = {
  title: 'Football League Tables & Standings — Premier League, La Liga & Global Competitions | FootballPredict',
  description:
    'Real-time football league tables, standings, points, goal differences, and team form across top European and global competitions including Premier League, La Liga, Serie A, and Champions League.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/leagues',
  },
  openGraph: {
    title: 'Football League Tables & Standings | FootballPredict',
    description:
      'Explore official football standings, points tables, goal differential, and form for world football competitions.',
    url: getCanonicalUrl('/leagues'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football League Tables & Standings | FootballPredict',
    description:
      'Current football league standings, points, and goal differential across major global leagues.',
  },
};

export default async function LeaguesPage() {
  let leagues: League[] = [];
  let initialStandings: StandingTableItem[] = [];
  let selectedLeague: League | null = null;

  try {
    const fetchedLeagues = await fetchLeagues().catch(() => []);
    if (Array.isArray(fetchedLeagues) && fetchedLeagues.length > 0) {
      leagues = fetchedLeagues;
      selectedLeague = leagues[0];

      const standingsRes = await fetchLeagueStandings(selectedLeague.code).catch(() => null);
      if (standingsRes?.standings?.[0]?.table) {
        initialStandings = standingsRes.standings[0].table;
      }
    }
  } catch (err) {
    console.error('Error server-rendering leagues page:', err);
  }

  // Schema structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Football League Tables & Standings',
    description:
      'Official standings, points, goal difference, and match records across world football leagues.',
    url: getCanonicalUrl('/leagues'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: leagues.map((lg, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: lg.name,
        url: `${siteConfig.url}${getLeagueUrl(lg.name, lg.code)}`,
      })),
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
          { label: 'Leagues & Standings' },
        ]}
      />

      {/* Semantic Server Header */}
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
          Football League Tables &amp; Standings
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
          Explore up-to-date league tables, point tallies, win-draw-loss records, and goal differentials across top tier domestic leagues and European tournaments. Select any competition to inspect current standings or jump into detailed match previews.
        </p>

        {/* Quick Nav Anchor Links */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
          <Link
            href="/fixtures"
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
            Fixture Schedule &rarr;
          </Link>
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
            Today&apos;s Match Forecasts &rarr;
          </Link>
          <Link
            href="/stats"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            Prediction Accuracy &rarr;
          </Link>
        </div>
      </header>

      {/* Crawlable League Directory Hub Grid (rendered directly in initial HTML) */}
      {leagues.length > 0 && (
        <section
          style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
          }}
          aria-label="Supported Football Competitions"
        >
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            Crawlable Competition Directory:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.65rem',
            }}
          >
            {leagues.map((lg) => (
              <Link
                key={lg.code}
                href={getLeagueUrl(lg.name, lg.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>{lg.flag}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lg.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Interactive client component pre-populated with server standings data */}
      <Suspense
        fallback={
          <div
            className="glass-panel"
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}
          >
            Loading league standings...
          </div>
        }
      >
        <LeaguesClient
          initialLeagues={leagues}
          initialSelectedLeague={selectedLeague}
          initialStandings={initialStandings}
        />
      </Suspense>
    </div>
  );
}
