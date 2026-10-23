import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchMatchesFeed, fetchMatches } from '@/lib/api';
import { Match } from '@/lib/types';
import { computeHistoricalPredictionPerformance, PredictionPerformanceMetrics } from '@/lib/historicalTracking';
import StatsClient from './StatsClient';

export const revalidate = 120; // 2 minutes revalidation

export const metadata: Metadata = {
  title: 'Prediction Performance & Accuracy Audit — Statistical Model Hit Rates | FootballPredict',
  description:
    'Transparent statistical accuracy audit of FootballPredict match forecasting models. Explore verified 1X2 outcome hit rates, exact scoreline accuracy, confidence tier performance, and historical match logs.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/stats',
  },
  openGraph: {
    title: 'Prediction Performance & Accuracy Dashboard | FootballPredict',
    description:
      'Transparent verification of statistical football prediction models against official matchday outcomes.',
    url: getCanonicalUrl('/stats'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prediction Performance & Accuracy Dashboard | FootballPredict',
    description:
      'Audited statistical performance, 1X2 hit rates, and model confidence breakdown.',
  },
};

export default async function AccuracyDashboardPage() {
  let metrics: PredictionPerformanceMetrics | null = null;

  try {
    let matches: Match[] = [];
    const feed = await fetchMatchesFeed().catch(() => null);
    if (feed && Array.isArray(feed.matches) && feed.matches.length > 0) {
      matches = feed.matches;
    } else {
      matches = await fetchMatches({ status: 'FINISHED', limit: 120 }).catch(() => []);
    }

    if (matches.length > 0) {
      metrics = computeHistoricalPredictionPerformance(matches);
    }
  } catch (err) {
    console.error('Error pre-computing prediction metrics on server:', err);
  }

  // Schema structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Prediction Performance & Accuracy Dashboard',
    description:
      'Transparent tracking and audit of FootballPredict statistical match predictions against official results.',
    url: getCanonicalUrl('/stats'),
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
          { label: 'Prediction Performance & Accuracy' },
        ]}
      />

      {/* Hero Header Banner */}
      <header
        style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(17,24,39,0.95) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#86efac',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            ● Real-Time Verification Active
          </span>
          <span style={{ fontSize: '0.80rem', color: '#94a3b8' }}>
            Audited Against Official Match Results
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: 900,
            color: '#f8fafc',
            margin: '0 0 0.5rem 0',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          Prediction Performance &amp; Accuracy Dashboard 📊
        </h1>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '780px', lineHeight: 1.55 }}>
          Transparent tracking of FootballPredict&apos;s statistical models. Predictions are generated prior to kickoff and evaluated automatically against official final scores across 1X2 outcomes, scorelines, and confidence tiers.
        </p>
      </header>

      {/* Client Component pre-populated with server calculated metrics */}
      <Suspense
        fallback={
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ fontWeight: 700, fontSize: '0.96rem' }}>Calculating model accuracy from historical fixtures...</p>
          </div>
        }
      >
        <StatsClient initialMetrics={metrics} />
      </Suspense>
    </div>
  );
}
