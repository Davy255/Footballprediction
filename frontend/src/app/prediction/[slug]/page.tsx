import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getMatchBySlug, getMatchPredictionUrl, getTeamUrl, getLeagueUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import { generateMatchAnalysisText } from '@/lib/contentGenerator';
import { getRelatedMatchesForMatch } from '@/lib/relatedMatches';
import MatchCard from '@/components/MatchCard';
import Breadcrumbs from '@/components/Breadcrumbs';
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
          url: `${siteConfig.url}/prediction/${slug}/opengraph-image`,
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
      images: [`${siteConfig.url}/prediction/${slug}/opengraph-image`],
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

  // Generate deterministic content & fetch related fixtures
  const analysisContent = generateMatchAnalysisText(match);
  const relatedMatches = await getRelatedMatchesForMatch(match, 6);

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

      {/* Breadcrumb Navigation & Schema.org BreadcrumbList */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Football Predictions', url: '/football-predictions-today' },
          ...(compName && compName !== 'Football'
            ? [{ name: compName, url: getLeagueUrl(compName, compCode) }]
            : []),
          { name: `${HN} vs ${AN} Prediction` },
        ]}
      />

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
          <Link
            href={getLeagueUrl(compName, compCode)}
            style={{
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
              textDecoration: 'none',
            }}
          >
            🏆 {compName} {match.matchday ? `· Matchday ${match.matchday}` : ''}
          </Link>
          <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
            📅 {formattedDate} · {formattedTime} UTC
          </span>
        </div>

        {/* Teams Display Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          
          {/* Home Team */}
          <Link
            href={getTeamUrl(HN)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            {match.home_team?.crest && (
              <img
                src={match.home_team.crest}
                alt={`${HN} Crest`}
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            )}
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {HN}
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Home Team · View Profile →</span>
          </Link>

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
          <Link
            href={getTeamUrl(AN)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            {match.away_team?.crest && (
              <img
                src={match.away_team.crest}
                alt={`${AN} Crest`}
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            )}
            <div style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {AN}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Away Team · View Profile →</span>
          </Link>
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
          🎯 Match Prediction &amp; Probability Breakdown
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
                ? `${HN} Win or Draw Lean`
                : awayProb > homeProb && awayProb > drawProb
                ? `${AN} Win or Draw Lean`
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
      </section>

      {/* Data-Driven Statistical Match Analysis Section */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
          📝 Statistical Match Analysis &amp; Tactical Context
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>
            {analysisContent.mainAnalysis}
          </p>
          <p style={{ margin: 0 }}>
            {analysisContent.formAnalysis}
          </p>
          <p style={{ margin: 0 }}>
            {analysisContent.marketsAnalysis}
          </p>
        </div>

        {/* Prediction Disclaimer */}
        <div style={{
          marginTop: '1.2rem',
          padding: '0.8rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          borderLeft: '3px solid #38bdf8',
          borderRadius: '4px',
          fontSize: '0.78rem',
          color: '#94a3b8',
        }}>
          ⚠️ {analysisContent.disclaimer}
        </div>
      </section>

      {/* Interactive Match Hub with Full Form, H2H & Predictions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', marginBottom: '1rem' }}>
          📊 Complete Match Analytics, Form &amp; Community Tips
        </h2>
        <MatchCard match={match} defaultOpen={true} />
      </section>

      {/* More Football Predictions & Related Matches Section */}
      {relatedMatches.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎯 More Football Predictions &amp; Related Matches
              </h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8' }}>
                Explore more upcoming fixtures, statistical win probabilities and match forecasts across {compName}.
              </p>
            </div>
            <Link
              href="/football-predictions-today"
              style={{
                fontSize: '0.82rem',
                color: '#38bdf8',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              Today&apos;s Predictions Hub →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {relatedMatches.map((rel) => {
              const relHome = rel.home_team?.short_name || rel.home_team?.name || 'Home';
              const relAway = rel.away_team?.short_name || rel.away_team?.name || 'Away';
              const relComp = rel.league?.name || compName;
              const relCompCode = rel.league?.code || compCode;
              const relUrl = getMatchPredictionUrl(rel);

              let relAi: any = null;
              if (rel.prediction_description) {
                try { relAi = JSON.parse(rel.prediction_description); } catch {}
              }

              const rhp = rel.ai_home_prob != null ? Math.round(rel.ai_home_prob * 100) : (relAi?.probs?.home_pct ?? 45);
              const rdp = rel.ai_draw_prob != null ? Math.round(rel.ai_draw_prob * 100) : (relAi?.probs?.draw_pct ?? 27);
              const rap = rel.ai_away_prob != null ? Math.round(rel.ai_away_prob * 100) : (relAi?.probs?.away_pct ?? 28);

              const rPredHome = rel.ai_predicted_home ?? relAi?.score?.home ?? 1;
              const rPredAway = rel.ai_predicted_away ?? relAi?.score?.away ?? 1;

              const relDate = rel.utc_date
                ? new Date(rel.utc_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : 'Upcoming';

              const isRelLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((rel.status || '').toUpperCase());
              const isRelFinished = (rel.status || '').toUpperCase() === 'FINISHED';

              return (
                <div
                  key={rel.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.8rem',
                  }}
                >
                  {/* Top Bar: League & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                    <Link
                      href={getLeagueUrl(relComp, relCompCode)}
                      style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      🏆 {relComp}
                    </Link>
                    <span style={{ color: isRelLive ? '#ef4444' : '#94a3b8', fontWeight: isRelLive ? 800 : 500 }}>
                      {isRelLive ? '● LIVE' : isRelFinished ? 'FT' : `📅 ${relDate}`}
                    </span>
                  </div>

                  {/* Teams Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Link
                      href={getTeamUrl(relHome)}
                      style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}
                    >
                      {rel.home_team?.crest && (
                        <img src={rel.home_team.crest} alt={`${relHome} Crest`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{relHome}</span>
                    </Link>

                    <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '0 0.4rem' }}>VS</span>

                    <Link
                      href={getTeamUrl(relAway)}
                      style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', flex: 1, textAlign: 'right' }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{relAway}</span>
                      {rel.away_team?.crest && (
                        <img src={rel.away_team.crest} alt={`${relAway} Crest`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      )}
                    </Link>
                  </div>

                  {/* Probabilities & Projected Score */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.3rem', fontWeight: 700 }}>
                      <span style={{ color: '#60a5fa' }}>{relHome} {rhp}%</span>
                      <span style={{ color: '#94a3b8' }}>Draw {rdp}%</span>
                      <span style={{ color: '#a78bfa' }}>{relAway} {rap}%</span>
                    </div>

                    <div style={{ display: 'flex', height: '5px', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                      <div style={{ width: `${rhp}%`, background: '#3b82f6' }} />
                      <div style={{ width: `${rdp}%`, background: '#64748b' }} />
                      <div style={{ width: `${rap}%`, background: '#8b5cf6' }} />
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#4ade80', fontWeight: 800, textAlign: 'center' }}>
                      Projected: {relHome} {rPredHome} – {rPredAway} {relAway}
                    </div>
                  </div>

                  {/* Prediction CTA Button */}
                  <Link
                    href={relUrl}
                    style={{
                      textAlign: 'center',
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.25)',
                      color: '#93c5fd',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.80rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    🎯 {relHome} vs {relAway} Prediction →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
            href={getLeagueUrl(compName, compCode)}
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
            href="/football-predictions-today"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#86efac',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🎯 Today&apos;s Tips
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
