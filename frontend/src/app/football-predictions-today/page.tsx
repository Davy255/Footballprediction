import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatchesFeed } from '@/lib/api';
import { getMatchSlug, getMatchPredictionUrl, getTeamUrl, getLeagueUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import { generateTodayPredictionsSummary } from '@/lib/contentGenerator';
import { Match, League } from '@/lib/types';

export const revalidate = 60; // Fresh match data cached for 60 seconds

export const metadata: Metadata = {
  title: 'Football Predictions Today — Match Predictions & Win Probabilities | FootballPredict',
  description: "Today's football predictions, match win probabilities, projected scores, team form and football statistics from FootballPredict.",
  keywords: [
    'football predictions today',
    "today's football predictions",
    'football match predictions today',
    'soccer predictions today',
    "today's match predictions",
    'football tips today',
    'free football tips today',
    'betting predictions today',
    'win probabilities today',
  ],
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/football-predictions-today',
  },
  openGraph: {
    title: 'Football Predictions Today — Match Predictions & Win Probabilities',
    description: "Today's football predictions, match win probabilities, projected scores, team form and football statistics from FootballPredict.",
    url: getCanonicalUrl('/football-predictions-today'),
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Football Predictions Today — FootballPredict",
      },
    ],
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Predictions Today — Match Predictions & Win Probabilities',
    description: "Today's football predictions, match win probabilities, projected scores, team form and football statistics from FootballPredict.",
    images: [`${siteConfig.url}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function FootballPredictionsTodayPage() {
  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const todayIsoDate = now.toISOString().split('T')[0];

  // Fetch unified match feed
  let matches: Match[] = [];
  try {
    const feed = await fetchMatchesFeed();
    matches = feed?.matches || [];
  } catch (err) {
    console.error('Error loading matches feed for today page:', err);
  }

  // Filter matches for TODAY:
  const todayMatches: Match[] = [];

  for (const m of matches) {
    if (!m.utc_date) continue;
    const mDate = new Date(m.utc_date);
    const isSameDate = mDate.toDateString() === now.toDateString();
    const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((m.status || '').toUpperCase());
    
    if (isSameDate || isLive || m.utc_date.startsWith(todayIsoDate)) {
      todayMatches.push(m);
    }
  }

  const displayMatches = todayMatches.length > 0 ? todayMatches : matches.slice(0, 10);
  const isFallbackUpcoming = todayMatches.length === 0 && displayMatches.length > 0;

  // Generate deterministic today text content
  const todayText = generateTodayPredictionsSummary(displayMatches, todayFormatted);

  // Group matches by Competition/League
  const leagueGroups: Record<string, { league: League; matches: Match[] }> = {};
  for (const m of displayMatches) {
    const lCode = m.league?.code || m.league?.name || 'OTHER';
    if (!leagueGroups[lCode]) {
      leagueGroups[lCode] = {
        league: m.league || { id: 0, code: 'OTHER', name: 'Other Matches', country: 'Global', flag: '⚽', emblem: '', current_season: '', is_active: true },
        matches: [],
      };
    }
    leagueGroups[lCode].matches.push(m);
  }

  const activeLeagueCount = Object.keys(leagueGroups).length;
  const totalCount = displayMatches.length;

  // Structured Data Schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Football Predictions Today',
    description: "Today's football predictions, match win probabilities, projected scores, team form and football statistics from FootballPredict.",
    url: getCanonicalUrl('/football-predictions-today'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
    },
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem 1rem', minHeight: '85vh' }}>
      
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
        <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          <li>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Home
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href="/fixtures" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Predictions
            </Link>
          </li>
          <li>›</li>
          <li style={{ color: '#f8fafc', fontWeight: 700 }} aria-current="page">
            Football Predictions Today
          </li>
        </ol>
      </nav>

      {/* Hero Header Section */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(17,24,39,0.95) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#93c5fd',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}>
            🎯 Daily Match Forecasts
          </span>
          <span style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#86efac',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}>
            📅 {todayFormatted}
          </span>
        </div>

        <h1 style={{ margin: '0 0 0.6rem 0', fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
          Football Predictions Today
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '780px' }}>
          Explore today&apos;s football match predictions, statistical win probabilities, projected scorelines, team form and tactical analysis from FootballPredict across top leagues worldwide.
        </p>

        {/* Quick Summary Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.8rem',
          marginTop: '1.5rem',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Matches Featured</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>{totalCount}</div>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 }}>Leagues Active</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa', marginTop: '0.2rem' }}>{activeLeagueCount}</div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 800 }}>Prediction Engine</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', marginTop: '0.2rem' }}>AI Powered</div>
          </div>
        </div>
      </header>

      {/* Data-Driven Daily Summary Insights Section */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
          💡 Today&apos;s Prediction Highlights &amp; Statistical Insights
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>{todayText.summaryText}</p>
          {todayText.highestProbabilityHighlight && (
            <p style={{
              margin: 0,
              background: 'rgba(56,189,248,0.08)',
              borderLeft: '3px solid #38bdf8',
              padding: '0.6rem 0.9rem',
              borderRadius: '4px',
              color: '#7dd3fc',
              fontWeight: 700,
            }}>
              📊 {todayText.highestProbabilityHighlight}
            </p>
          )}
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
            ⚡ Data refreshed regularly for live match updates and odds changes.
          </div>
        </div>
      </section>

      {/* Notice if fallback upcoming matches are shown during quiet schedule */}
      {isFallbackUpcoming && (
        <div style={{
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.25)',
          borderRadius: '12px',
          padding: '1rem 1.2rem',
          marginBottom: '2rem',
          color: '#fef08a',
          fontSize: '0.88rem',
        }}>
          ℹ️ No top matches currently playing today. Displaying upcoming featured match predictions from the next scheduled matchday.
        </div>
      )}

      {/* Main Grouped Matches Section */}
      {totalCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {Object.entries(leagueGroups).map(([code, group]) => {
            const league = group.league;
            const leagueUrl = getLeagueUrl(league.name, league.code);

            return (
              <section
                key={code}
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                {/* League Header Title with Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <Link
                    href={leagueUrl}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      color: '#f8fafc',
                    }}
                  >
                    {league.emblem ? (
                      <img src={league.emblem} alt={league.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>{league.flag || '🏆'}</span>
                    )}
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                      {league.name} Predictions
                    </h2>
                  </Link>

                  <Link
                    href={leagueUrl}
                    style={{
                      fontSize: '0.80rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    View League Standings →
                  </Link>
                </div>

                {/* Match Prediction Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
                  {group.matches.map((m) => {
                    const HN = m.home_team?.short_name || m.home_team?.name || 'Home';
                    const AN = m.away_team?.short_name || m.away_team?.name || 'Away';
                    const matchUrl = getMatchPredictionUrl(m);

                    let ai: any = null;
                    if (m.prediction_description) {
                      try { ai = JSON.parse(m.prediction_description); } catch {}
                    }

                    const hp = m.ai_home_prob != null ? Math.round(m.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45);
                    const dp = m.ai_draw_prob != null ? Math.round(m.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 27);
                    const ap = m.ai_away_prob != null ? Math.round(m.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 28);

                    const predHome = m.ai_predicted_home ?? ai?.score?.home ?? 1;
                    const predAway = m.ai_predicted_away ?? ai?.score?.away ?? 1;

                    const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((m.status || '').toUpperCase());
                    const isFinished = (m.status || '').toUpperCase() === 'FINISHED';

                    const kickoffTime = m.utc_date
                      ? new Date(m.utc_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : '--:--';

                    return (
                      <div
                        key={m.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: isLive ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px',
                          padding: '1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.8rem',
                          boxShadow: isLive ? '0 0 16px rgba(239,68,68,0.15)' : 'none',
                        }}
                      >
                        {/* Status & Time Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          {isLive ? (
                            <span style={{ color: '#ef4444', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              ● LIVE {m.live_minute ? `${m.live_minute}'` : ''}
                            </span>
                          ) : isFinished ? (
                            <span style={{ color: '#94a3b8', fontWeight: 800 }}>FINISHED (FT)</span>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>⏰ {kickoffTime} UTC</span>
                          )}
                          {m.matchday && <span style={{ color: '#64748b' }}>Matchday {m.matchday}</span>}
                        </div>

                        {/* Teams Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          
                          {/* Home */}
                          <Link
                            href={getTeamUrl(HN)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              color: '#f8fafc',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              flex: 1,
                            }}
                          >
                            {m.home_team?.crest && (
                              <img src={m.home_team.crest} alt={HN} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                            )}
                            <span title={HN}>{HN}</span>
                          </Link>

                          {/* Center Score / VS */}
                          <div style={{ padding: '0 0.4rem', textAlign: 'center' }}>
                            {isFinished || isLive ? (
                              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: isLive ? '#ef4444' : '#38bdf8' }}>
                                {m.home_score ?? 0} - {m.away_score ?? 0}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b' }}>VS</span>
                            )}
                          </div>

                          {/* Away */}
                          <Link
                            href={getTeamUrl(AN)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              color: '#f8fafc',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              flex: 1,
                              textAlign: 'right',
                            }}
                          >
                            <span title={AN}>{AN}</span>
                            {m.away_team?.crest && (
                              <img src={m.away_team.crest} alt={AN} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                            )}
                          </Link>
                        </div>

                        {/* Prediction & Probabilities Box */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.35rem', fontWeight: 700 }}>
                            <span style={{ color: '#60a5fa' }}>{HN} {hp}%</span>
                            <span style={{ color: '#94a3b8' }}>Draw {dp}%</span>
                            <span style={{ color: '#a78bfa' }}>{AN} {ap}%</span>
                          </div>

                          {/* Percentage Bar */}
                          <div style={{ display: 'flex', height: '6px', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                            <div style={{ width: `${hp}%`, background: '#3b82f6' }} />
                            <div style={{ width: `${dp}%`, background: '#64748b' }} />
                            <div style={{ width: `${ap}%`, background: '#8b5cf6' }} />
                          </div>

                          <div style={{ fontSize: '0.76rem', color: '#4ade80', fontWeight: 800, textAlign: 'center' }}>
                            Projected: {HN} {predHome} – {predAway} {AN}
                          </div>
                        </div>

                        {/* Direct Match Page Link Button */}
                        <Link
                          href={matchUrl}
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(29,78,216,0.25) 100%)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            color: '#93c5fd',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            fontSize: '0.80rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                          }}
                        >
                          🎯 Full Prediction &amp; Odds →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>⚽</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            No Football Matches with Available Predictions Today
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            There are no active league fixtures scheduled for today. Check upcoming matchday previews and global league standings below.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/fixtures" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              📅 View Upcoming Fixtures
            </Link>
            <Link href="/leagues" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              🏆 Explore Leagues
            </Link>
          </div>
        </div>
      )}

      {/* Internal Navigation Links Footer */}
      <footer style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '1.5rem',
        marginTop: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}>
        <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
          Explore More Football Analytics:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link
            href="/fixtures"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#93c5fd',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📅 All Fixtures
          </Link>
          <Link
            href="/live"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🔴 Live Scores
          </Link>
          <Link
            href="/leagues"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#d8b4fe',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 Top Leagues
          </Link>
          <Link
            href="/leaderboard"
            style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.25)',
              color: '#fde047',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            👑 Tipster Leaderboard
          </Link>
          <Link
            href="/stats"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#86efac',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📊 AI Accuracy Stats
          </Link>
        </div>
      </footer>

    </div>
  );
}
