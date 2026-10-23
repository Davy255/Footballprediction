import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchLiveMatches } from '@/lib/api';
import { Match } from '@/lib/types';
import LiveClient from './LiveClient';

export const revalidate = 15; // 15-second revalidation for live match updates

export const metadata: Metadata = {
  title: 'Live Football Scores & Real-Time In-Play Updates | FootballPredict',
  description:
    'Follow real-time football scores, live match status, current game clocks, and in-play updates across the Premier League, La Liga, Serie A, Bundesliga, and UEFA Champions League.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/live',
  },
  openGraph: {
    title: 'Live Football Scores & Match Centre | FootballPredict',
    description:
      'Real-time scores, in-play game tracking, and live results from top world football competitions.',
    url: getCanonicalUrl('/live'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Football Scores & Match Centre | FootballPredict',
    description:
      'Real-time football scores and in-play match tracking across major competitions.',
  },
};

export default async function LiveMatchPage() {
  let initialMatches: Match[] = [];

  try {
    const data = await fetchLiveMatches().catch(() => []);
    if (Array.isArray(data)) {
      initialMatches = data;
    }
  } catch (err) {
    console.error('Error pre-fetching live matches on server:', err);
  }

  // Schema structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LiveBlogPosting',
    headline: 'FootballPredict Live Match Centre & Real-Time Scores',
    description:
      'Real-time football score tracking, live match clocks, and in-play updates.',
    url: getCanonicalUrl('/live'),
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
          { label: 'Live Match Centre' },
        ]}
      />

      <header style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 0.4rem 0',
          }}
        >
          Live Football Scores &amp; Match Centre
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '740px',
            lineHeight: 1.55,
          }}
        >
          Follow real-time in-play football action with automatic polling every 15 seconds. Track goals, match statuses, and live game states across Europe&apos;s elite domestic leagues and tournaments.
        </p>
      </header>

      {/* Interactive client component pre-populated with server live matches */}
      <Suspense
        fallback={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: '180px', borderRadius: '12px' }} />
            ))}
          </div>
        }
      >
        <LiveClient initialMatches={initialMatches} />
      </Suspense>
    </div>
  );
}
