import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getMatchBySlug, getMatchPredictionUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import MatchCard from '@/components/MatchCard';
import { Match } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO Metadata Generation for individual match prediction pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    return {
      title: 'Match Prediction | FootballPredict',
      description: 'Football match prediction, stats, and analytics on FootballPredict.',
      robots: { index: false, follow: false },
    };
  }

  const HN = match.home_team?.short_name || match.home_team?.name || 'Home Team';
  const AN = match.away_team?.short_name || match.away_team?.name || 'Away Team';
  const compName = match.league?.name || 'Football';

  const title = `${HN} vs ${AN} Prediction — Stats & Win Probability | FootballPredict`;
  const description = `${HN} vs ${AN} prediction, win probabilities, predicted score, team form, statistics and match analysis from FootballPredict for ${compName}.`;
  const canonicalUrl = getCanonicalUrl(`/prediction/${slug}`);

  return {
    title,
    description,
    keywords: [
      `${HN} vs ${AN} prediction`,
      `${HN} vs ${AN} stats`,
      `${HN} vs ${AN} odds`,
      `${HN} vs ${AN} win probability`,
      `${HN} vs ${AN} head to head`,
      `${compName} predictions`,
      'football match prediction',
    ],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: `/prediction/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${HN} vs ${AN} Match Prediction — FootballPredict`,
        },
      ],
      locale: siteConfig.locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
}

export default async function MatchPredictionPage({ params }: PageProps) {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  const HN = match.home_team?.short_name || match.home_team?.name || 'Home Team';
  const AN = match.away_team?.short_name || match.away_team?.name || 'Away Team';
  const compName = match.league?.name || 'League Competition';
  const compCode = match.league?.code || 'PL';

  // Parse AI prediction payload if available
  let ai: any = null;
  if (match.prediction_description) {
    try {
      ai = JSON.parse(match.prediction_description);
    } catch {}
  }

  const homeProb = match.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45);
  const drawProb = match.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 27);
  const awayProb = match.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 28);

  const predictedHomeScore = match.ai_predicted_home != null ? match.ai_predicted_home : (ai?.score?.home ?? 1);
  const predictedAwayScore = match.ai_predicted_away != null ? match.ai_predicted_away : (ai?.score?.away ?? 1);

  const formattedDate = match.utc_date
    ? new Date(match.utc_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Upcoming Fixture';

  const formattedTime = match.utc_date
    ? new Date(match.utc_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--';

  const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((match.status || '').toUpperCase());
  const isFinished = (match.status || '').toUpperCase() === 'FINISHED';

  // Structured Data Schema for SportsEvent
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${HN} vs ${AN}`,
    description: `${HN} vs ${AN} statistical match predictions, win probabilities, and tactical analytics on FootballPredict.`,
    startDate: match.utc_date || new Date().toISOString(),
    sport: 'Football',
    homeTeam: {
      '@type': 'SportsTeam',
      name: match.home_team?.name || HN,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: match.away_team?.name || AN,
    },
    eventStatus: isLive
      ? 'https://schema.org/EventLive'
      : isFinished
      ? 'https://schema.org/EventCompleted'
      : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: `${HN} Stadium`,
    },
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem 1rem', minHeight: '80vh' }}>
      
      {/* Schema.org JSON-LD Structured Data */}
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
          <li>
            <Link href={`/fixtures?league=${compCode}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
              {compName}
            </Link>
          </li>
          <li>›</li>
          <li style={{ color: '#f8fafc', fontWeight: 700 }} aria-current="page">
            {HN} vs {AN}
          </li>
        </ol>
      </nav>

      {/* Main Match Header & Summary Card */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(17,24,39,0.95) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        padding: '1.8rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#93c5fd',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.80rem',
            fontWeight: 800,
          }}>
            🏆 {compName} {match.matchday ? `· Matchday ${match.matchday}` : ''}
          </span>
          <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
            📅 {formattedDate} · {formattedTime} UTC
          </span>
        </div>

        {/* Teams Display Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          
          {/* Home Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {match.home_team?.crest && (
              <img
                src={match.home_team.crest}
                alt={HN}
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            )}
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {HN}
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Home Team</span>
          </div>

          {/* Center: Match Status / Score / VS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            {isFinished ? (
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px' }}>
                {match.home_score ?? 0} : {match.away_score ?? 0}
              </div>
            ) : isLive ? (
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', letterSpacing: '2px' }}>
                  {match.home_score ?? 0} : {match.away_score ?? 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 800 }}>
                  ● LIVE {match.live_minute ? `${match.live_minute}'` : ''}
                </span>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                fontSize: '1rem',
                fontWeight: 900,
                color: '#f8fafc',
              }}>
                VS
              </div>
            )}
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              {match.status || 'Scheduled'}
            </span>
          </div>

          {/* Away Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {match.away_team?.crest && (
              <img
                src={match.away_team.crest}
                alt={AN}
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            )}
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {AN}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Away Team</span>
          </div>
        </div>
      </header>

      {/* Main Prediction & Probability Section */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎯 FootballPredict AI Match Forecast
        </h2>

        {/* Score Prediction & Primary Verdict Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Projected Final Score
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>
              {HN} {predictedHomeScore} – {predictedAwayScore} {AN}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Statistical expectation from team attack and defence ratings
            </div>
          </div>

          <div style={{
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Primary Outcome Verdict
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>
              {homeProb > awayProb && homeProb > drawProb
                ? `${HN} Win or Draw`
                : awayProb > homeProb && awayProb > drawProb
                ? `${AN} Win or Draw`
                : 'Close Contest / Draw Risk'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Model estimate based on form, Elo differential &amp; home strength
            </div>
          </div>
        </div>

        {/* Win Probability Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem', fontWeight: 800 }}>
            <span style={{ color: '#60a5fa' }}>{HN} Win ({homeProb}%)</span>
            <span style={{ color: '#94a3b8' }}>Draw ({drawProb}%)</span>
            <span style={{ color: '#a78bfa' }}>{AN} Win ({awayProb}%)</span>
          </div>

          {/* Visual Percentage Distribution Bar */}
          <div style={{
            display: 'flex',
            height: '14px',
            borderRadius: '999px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)',
          }}>
            <div style={{ width: `${homeProb}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} title={`${HN} ${homeProb}%`} />
            <div style={{ width: `${drawProb}%`, background: 'linear-gradient(90deg, #64748b, #94a3b8)' }} title={`Draw ${drawProb}%`} />
            <div style={{ width: `${awayProb}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} title={`${AN} ${awayProb}%`} />
          </div>
        </div>

        {/* Tactical Narrative Preview */}
        {ai?.analytics && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.2rem',
            color: '#cbd5e1',
            fontSize: '0.90rem',
            lineHeight: 1.65,
          }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
              📝 Tactical Preview &amp; Match Context
            </div>
            {ai.analytics}
          </div>
        )}
      </section>

      {/* Interactive Match Hub with Full Form, H2H & Predictions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', marginBottom: '1rem' }}>
          📊 Complete Match Analytics, Form &amp; Community Tips
        </h3>
        <MatchCard match={match} defaultOpen={true} />
      </section>

      {/* Helpful Internal Navigation Links */}
      <footer style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}>
        <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
          Explore More Predictions &amp; Competitions:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link
            href={`/fixtures?league=${compCode}`}
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
            ⚽ {compName} Predictions
          </Link>
          <Link
            href="/fixtures"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📅 All Today&apos;s Fixtures
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
            🔴 Live In-Play Scores
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
        </div>
      </footer>

    </div>
  );
}
