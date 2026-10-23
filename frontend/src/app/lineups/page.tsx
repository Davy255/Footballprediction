import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Match, League } from '@/lib/types';
import { fetchMatchesFeed } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import LineupsClient from './LineupsClient';

export const revalidate = 120; // 2 minutes cache for lineups

export const metadata: Metadata = {
  title: 'Projected Football Lineups & Tactical Pitch Formations | FootballPredict',
  description:
    'Explore interactive 2D tactical pitch formations, confirmed and projected starting elevens, player ratings, and manager tactics across Europe’s top football leagues.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/lineups',
  },
  openGraph: {
    title: 'Projected Football Lineups & Tactical Pitch Formations | FootballPredict',
    description:
      'Interactive 2D tactical pitch formations, confirmed starting elevens, and player statistics.',
    url: getCanonicalUrl('/lineups'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projected Football Lineups & Formations | FootballPredict',
    description:
      'Tactical pitch formations and confirmed player lineups across top football competitions.',
  },
};

export default async function LineupsPage() {
  let matches: Match[] = [];
  let leagues: League[] = [];

  try {
    const data = await fetchMatchesFeed().catch(() => null);
    if (data && Array.isArray(data.matches)) {
      matches = data.matches;
      leagues = data.leagues || [];
    }
  } catch (err) {
    console.error('Error pre-fetching lineups on server:', err);
  }

  // Schema structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Projected Football Lineups & Tactical Formations',
    description:
      'Interactive 2D tactical pitch formations, confirmed starting elevens, and team rosters.',
    url: getCanonicalUrl('/lineups'),
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
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lineups & Formations' },
        ]}
      />

      {/* Header Banner */}
      <header
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(56,189,248,0.1) 100%)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '16px',
          padding: '1.5rem 1.8rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', color: '#f0f6ff', margin: 0 }}>
            👕 Official &amp; Projected Match Lineups
          </h1>
          <p style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.92rem' }}>
            Interactive 2D tactical pitch formations, verified squad rosters, ratings, and player metrics.
          </p>
        </div>
        <Link
          href="/fixtures"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#38bdf8',
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          ⚽ View All Fixtures
        </Link>
      </header>

      {/* Interactive client component pre-populated with server data */}
      <Suspense
        fallback={
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ fontWeight: 700 }}>Loading authentic match lineups &amp; tactical formations...</div>
          </div>
        }
      >
        <LineupsClient initialMatches={matches} initialLeagues={leagues} />
      </Suspense>
    </div>
  );
}
