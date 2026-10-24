import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Match, League } from '@/lib/types';
import { fetchMatchesFeed, fetchMatches, fetchLeagues } from '@/lib/api';
import { getLeagueUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import HomeClient from './HomeClient';

export const revalidate = 30; // 30 seconds cache for homepage

export const metadata: Metadata = {
  title: 'Football Predictions, Win Probabilities & Statistical Match Forecasts | FootballPredict',
  description:
    'Free data-driven football match predictions, 1X2 win probabilities, projected scorelines, team form analysis, and league tables across the Premier League, La Liga, Champions League, Serie A, and Bundesliga.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Football Predictions, Win Probabilities & Statistical Match Forecasts | FootballPredict',
    description:
      'Data-driven football match predictions, 1X2 win probabilities, projected scores, form analysis, and league tables.',
    url: getCanonicalUrl('/'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Predictions & Statistical Match Forecasts | FootballPredict',
    description:
      'Data-driven football match predictions, win probabilities, and team form analysis.',
  },
};

export default async function HomePage() {
  let initialMatches: Match[] = [];
  let initialLeagues: League[] = [];

  try {
    const feed = await fetchMatchesFeed().catch(() => null);
    if (feed && Array.isArray(feed.matches) && feed.matches.length > 0) {
      initialMatches = feed.matches;
      initialLeagues = feed.leagues || [];
    } else {
      const [matches, leagues] = await Promise.all([
        fetchMatches({ status: 'SCHEDULED', limit: 120 }).catch(() => []),
        fetchLeagues().catch(() => []),
      ]);
      initialMatches = matches;
      initialLeagues = leagues;
    }
  } catch (err) {
    console.error('Error pre-fetching homepage fixtures on server:', err);
  }

  // Structured schema markup for Google Search & Crawlers
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${siteConfig.url}/#organization`,
        },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteConfig.url}/fixtures?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/icons/icon-512x512.png`,
        },
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container" style={{ marginTop: '0.85rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* Hero Header Title & Conversion Banner (Rendered Server-Side in Initial HTML) */}
          <div style={{ marginBottom: '1.25rem', padding: '0 0.2rem' }}>
            <header
              style={{
                background: 'var(--gradient-hero)',
                border: '1px solid var(--gradient-hero-border)',
                borderRadius: '16px',
                padding: '1.25rem 1.4rem',
                marginBottom: '1rem',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div>
                  <span
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#86efac',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    ● AI Match Predictions Active
                  </span>
                  <h1
                    style={{
                      fontSize: 'clamp(1.4rem, 5vw, 1.85rem)',
                      fontWeight: 900,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.025em',
                      lineHeight: 1.25,
                      margin: 0,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Football Match Predictions &amp; Tactical Intelligence
                  </h1>
                </div>

                <Link
                  href="/football-predictions-today"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                  }}
                >
                  🎯 Today&apos;s Predictions Hub &rarr;
                </Link>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Data-driven win probabilities, projected scores, form analysis, and multi-market analytics for Premier League, Champions League, La Liga, Serie A, and Bundesliga.
              </p>

              {/* Quick Popular Leagues Navigation */}
              {initialLeagues.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.3rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>Popular Competitions:</span>
                  {initialLeagues.slice(0, 5).map((lg) => (
                    <Link
                      key={lg.code}
                      href={getLeagueUrl(lg.name, lg.code)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-blue)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      {lg.flag || '🏆'} {lg.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick Platform Navigation Hub for Real Discovery */}
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>Platform Hubs:</span>
                <Link
                  href="/fixtures"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  📅 Fixtures Schedule
                </Link>
                <Link
                  href="/live"
                  style={{
                    fontSize: '0.74rem',
                    color: '#f87171',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  🔴 Live Scores
                </Link>
                <Link
                  href="/stats"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  📊 Model Accuracy
                </Link>
                <Link
                  href="/articles"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  📚 Research Articles
                </Link>
                <Link
                  href="/leagues"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  🏆 All Leagues
                </Link>
              </div>
            </header>
          </div>

          {/* Interactive Client Component pre-populated with server data */}
          <Suspense
            fallback={
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading match fixtures and predictions...
              </div>
            }
          >
            <HomeClient initialMatches={initialMatches} initialLeagues={initialLeagues} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
