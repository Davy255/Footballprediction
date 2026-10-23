import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Football Prediction & Data Disclaimer — Statistical Model Limitations | FootballPredict',
  description:
    'Comprehensive statistical prediction disclaimer, mathematical modeling limitations, data latency disclosures, and non-gambling notice for FootballPredict, operated by Vertex Digital Services.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: 'Football Prediction & Data Disclaimer | FootballPredict',
    description:
      'Understand the mathematical modeling limits, statistical estimates, and non-monetary nature of FootballPredict.',
    url: getCanonicalUrl('/disclaimer'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Prediction & Data Disclaimer | FootballPredict',
    description:
      'Mathematical modeling limitations and non-gambling platform disclaimer.',
  },
};

export default function DisclaimerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Football Prediction & Data Disclaimer',
    description:
      'Mathematical modeling limitations, informational disclaimers, and non-gambling policy of FootballPredict.',
    url: getCanonicalUrl('/disclaimer'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icons/icon-512x512.png`,
      },
    },
  };

  return (
    <div className="container py-xl" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '4rem', minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Prediction Disclaimer' },
        ]}
      />

      <div
        style={{
          background: 'var(--bg-card)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 800, marginBottom: '0.85rem' }}>
          <span>⚖️</span>
          <span>Important Regulatory &amp; Analytical Notice</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '0.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Football Prediction &amp; Data Disclaimer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Published by <strong>{siteConfig.publisher}</strong> · Last updated: October 2026
        </p>

        {/* Section 1: Statistical & Informational Purpose */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Statistical &amp; Informational Purpose
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            All mathematical formulas, win probabilities, Poisson goal distributions, tactical lineups, team form ratings, and historical performance statistics published on <strong>FootballPredict</strong> (operated by <strong>{siteConfig.publisher}</strong>) are mathematical estimates generated for statistical research, match preview discussion, and football analytical interest.
          </p>
          <p style={{ margin: 0 }}>
            Model probability outputs represent theoretical tendencies across multi-hundred fixture samples; <strong>they are not guarantees, certainties, or definitive forecasts of future match outcomes</strong>.
          </p>
        </section>

        {/* Section 2: Not a Bookmaker or Gambling Operator */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. Strictly Independent from Gambling Operations
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            FootballPredict is an independent sports analytics platform. <strong>FootballPredict is NOT a bookmaker, sportsbook, casino, or betting operator.</strong>
          </p>
          <ul style={{ paddingLeft: '1.4rem', margin: 0 }}>
            <li style={{ marginBottom: '0.35rem' }}>We do not accept bets, wagers, or stakes of any kind.</li>
            <li style={{ marginBottom: '0.35rem' }}>We do not handle monetary deposits, process withdrawals, or hold player funds.</li>
            <li style={{ marginBottom: '0.35rem' }}>We do not provide betting tips, financial advice, or staking recommendations.</li>
            <li>We do not encourage gambling, wagering, or real-money risk-taking.</li>
          </ul>
        </section>

        {/* Section 3: Non-Monetary Virtual Community */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. 100% Non-Monetary Community Features
          </h2>
          <p style={{ margin: 0 }}>
            All user prediction features, accuracy scores, and community leaderboard standings on FootballPredict are entirely non-monetary virtual skill-testing activities. Points awarded have zero cash equivalence, cannot be redeemed for real currency or prizes, and cannot be transferred or traded.
          </p>
        </section>

        {/* Section 4: Inherent Randomness and Model Limitations */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Stochastic Randomness &amp; Analytical Limitations
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Association football is an intrinsically low-scoring sport governed by substantial variance. Statistical pre-match models evaluate historical records, Elo club ratings, and rolling form vectors, but cannot foresee unpredictable live occurrences such as:
          </p>
          <ul style={{ paddingLeft: '1.4rem', margin: '0 0 0.75rem 0' }}>
            <li style={{ marginBottom: '0.35rem' }}>Sudden in-match injuries or early tactical substitutions.</li>
            <li style={{ marginBottom: '0.35rem' }}>Red card dismissals or severe refereeing decisions.</li>
            <li style={{ marginBottom: '0.35rem' }}>Weather anomalies, adverse pitch conditions, or sudden travel disruptions.</li>
            <li>Late pre-kickoff squad rotations announced after model calculations lock.</li>
          </ul>
          <p style={{ margin: 0 }}>
            A team with a calculated 75% win probability carries a 25% mathematical likelihood of drawing or losing. Users must acknowledge that single-match results frequently diverge from probabilistic averages.
          </p>
        </section>

        {/* Section 5: Data Feed Delays & Independent Verification */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Data Timeliness &amp; Verification Notice
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            While FootballPredict syncs schedules, scores, and standings frequently from external sports providers (primarily <code>football-data.org</code>), we cannot guarantee that information is perpetually real-time, uninterrupted, or completely error-free.
          </p>
          <p style={{ margin: 0 }}>
            Kickoff times, venue details, and competition calendars are subject to rescheduling by governing football federations (e.g., UEFA, Premier League, La Liga). Visitors should independently verify official announcements through official club or tournament channels for definitive match itineraries.
          </p>
        </section>

        {/* Section 6: Limitation of Liability & Contact */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Limitation of Liability
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            Under no circumstances shall <strong>{siteConfig.publisher}</strong>, FootballPredict, its operators, or technical contributors be held liable for any loss, damage, financial expenditure, or personal decisions arising directly or indirectly from reliance upon data, probabilities, or content published on this website.
          </p>
          <p style={{ margin: 0 }}>
            If you identify a data error, wrong kickoff time, or broken feed, please report it immediately via our{' '}
            <Link href="/contact" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Contact Page</Link> or email{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: '#60a5fa', textDecoration: 'underline' }}>{siteConfig.contactEmail}</a>.
          </p>
        </section>

        {/* Internal Footer Navigation Links */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/about" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none' }}>
              ℹ️ About Us
            </Link>
            <Link href="/contact" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none' }}>
              ✉️ Contact Team
            </Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
              🔒 Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
              📄 Terms of Service
            </Link>
          </div>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textDecoration: 'none' }}>
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
