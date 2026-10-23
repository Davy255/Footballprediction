import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LeaderboardEntry } from '@/lib/types';
import { fetchLeaderboard } from '@/lib/api';
import AdBanner from '@/components/AdBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 60; // 1 minute revalidation

export const metadata: Metadata = {
  title: 'Global Predictor Leaderboard — Community & Model Rankings | FootballPredict',
  description:
    'Official leaderboard ranking football predictors by total points, prediction accuracy, and correct scorelines alongside the verified FootballPredict AI forecasting baseline.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/leaderboard',
  },
  openGraph: {
    title: 'Global Predictor Leaderboard | FootballPredict',
    description:
      'Performance rankings based on verified, completed football results. Benchmark community predictors against our statistical prediction model.',
    url: getCanonicalUrl('/leaderboard'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Predictor Leaderboard | FootballPredict',
    description:
      'Compare football prediction accuracy and point standings on the official FootballPredict leaderboard.',
  },
};

export default async function LeaderboardPage() {
  let initialEntries: LeaderboardEntry[] = [];

  try {
    const data = await fetchLeaderboard(50).catch(() => []);
    if (Array.isArray(data)) {
      initialEntries = data;
    }
  } catch (err) {
    console.error('Error pre-fetching leaderboard on server:', err);
  }

  // Schema structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Global Football Predictor Leaderboard',
    description:
      'Rankings of football predictors based on verified completed fixtures, point tallies, and accuracy rates.',
    url: getCanonicalUrl('/leaderboard'),
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
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Leaderboard & Model Rankings' },
        ]}
      />

      {/* Header */}
      <header style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Global Predictor Leaderboard 👑
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, maxWidth: '640px' }}>
          Real-time performance rankings based on verified, finished football results. Compare community predictors against the official FootballPredict AI model baseline.
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
            Today&apos;s Match Forecasts &rarr;
          </Link>
          <Link
            href="/stats"
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
            AI Accuracy Audit &rarr;
          </Link>
          <Link
            href="/fixtures"
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
            Fixture Schedule &rarr;
          </Link>
        </div>
      </header>

      <AdBanner slot="hero-top" />

      {/* Interactive Leaderboard Client pre-populated with server data */}
      <Suspense
        fallback={
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading predictor leaderboard rankings...
          </div>
        }
      >
        <LeaderboardClient initialEntries={initialEntries} />
      </Suspense>

      {/* Internal Navigation Gateway */}
      <div
        style={{
          marginTop: '2.5rem',
          padding: '1.25rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Want to test your football prediction skills against the community and AI?
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link href="/football-predictions-today" className="btn btn-primary btn-sm" style={{ fontWeight: 800, fontSize: '0.80rem' }}>
            Submit Today&apos;s Predictions
          </Link>
          <Link href="/stats" className="btn btn-secondary btn-sm" style={{ fontWeight: 700, fontSize: '0.80rem' }}>
            AI Accuracy Audit
          </Link>
        </div>
      </div>

      <AdBanner slot="leaderboard-footer" />
    </div>
  );
}
