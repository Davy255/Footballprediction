import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTeamDataBySlug, getMatchPredictionUrl, slugifyTeamName, getLeagueUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO Metadata Generation for Individual Team Pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTeamDataBySlug(slug);

  if (!data) {
    return {
      title: 'Team Profile | FootballPredict',
      description: 'Football team statistics, form, upcoming fixtures, and match predictions on FootballPredict.',
      robots: { index: false, follow: false },
    };
  }

  const TN = data.team.name;
  const title = `${TN} Predictions, Stats & Upcoming Matches | FootballPredict`;
  const description = `${TN} predictions, team form, statistics, upcoming fixtures and FootballPredict match analysis.`;
  const canonicalUrl = getCanonicalUrl(`/teams/${slug}`);

  return {
    title,
    description,
    keywords: [
      `${TN} predictions`,
      `${TN} stats`,
      `${TN} fixtures`,
      `${TN} form`,
      `${TN} win probability`,
      `${TN} next match`,
      'football team analytics',
    ],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: `/teams/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        data.team.crest
          ? { url: data.team.crest, alt: `${TN} Crest` }
          : { url: `${siteConfig.url}/og-image.png`, width: 1200, height: 630, alt: `${TN} — FootballPredict` },
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.team.crest || `${siteConfig.url}/og-image.png`],
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

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTeamDataBySlug(slug);

  if (!data) {
    notFound();
  }

  const { team, league, nextMatch, upcomingMatches, recentMatches, stats } = data;
  const TN = team.name;
  const shortName = team.short_name || team.name;
  const compName = league?.name || 'Football League';
  const compCode = league?.code || 'PL';

  // Schema.org Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: TN,
    sport: 'Football',
    logo: team.crest || undefined,
    url: `${siteConfig.url}/teams/${slug}`,
    memberOf: league ? {
      '@type': 'SportsOrganization',
      name: league.name,
    } : undefined,
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem 1rem', minHeight: '80vh' }}>
      
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
              Teams
            </Link>
          </li>
          <li>›</li>
          {league && (
            <>
              <li>
                <Link href={getLeagueUrl(compName, compCode)} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  {compName}
                </Link>
              </li>
              <li>›</li>
            </>
          )}
          <li style={{ color: '#f8fafc', fontWeight: 700 }} aria-current="page">
            {TN}
          </li>
        </ol>
      </nav>

      {/* Team Header Hero Banner */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(17,24,39,0.95) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {team.crest && (
          <img
            src={team.crest}
            alt={`${TN} Crest`}
            style={{ width: '84px', height: '84px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        )}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <Link
              href={getLeagueUrl(compName, compCode)}
              style={{
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#93c5fd',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              🏆 {compName}
            </Link>
            {team.elo_rating && (
              <span style={{
                background: 'rgba(168,85,247,0.15)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: '#d8b4fe',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}>
                ⭐ Elo {Math.round(team.elo_rating)}
              </span>
            )}
          </div>
          <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
            {TN}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.90rem', lineHeight: 1.5 }}>
            Comprehensive statistical profile, recent match form, win probabilities, and AI predictions for {TN} on FootballPredict.
          </p>
        </div>
      </header>

      {/* Next Match Prediction Hero Section */}
      {nextMatch ? (() => {
        const isHome = nextMatch.home_team?.id === team.id;
        const opp = isHome ? nextMatch.away_team : nextMatch.home_team;
        const oppName = opp?.short_name || opp?.name || 'Opponent';

        let ai: any = null;
        if (nextMatch.prediction_description) {
          try { ai = JSON.parse(nextMatch.prediction_description); } catch {}
        }

        const teamProb = isHome
          ? (nextMatch.ai_home_prob != null ? Math.round(nextMatch.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45))
          : (nextMatch.ai_away_prob != null ? Math.round(nextMatch.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 30));
        
        const oppProb = isHome
          ? (nextMatch.ai_away_prob != null ? Math.round(nextMatch.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 30))
          : (nextMatch.ai_home_prob != null ? Math.round(nextMatch.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45));

        const drawProb = nextMatch.ai_draw_prob != null ? Math.round(nextMatch.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 25);

        const predHomeScore = nextMatch.ai_predicted_home ?? ai?.score?.home ?? 1;
        const predAwayScore = nextMatch.ai_predicted_away ?? ai?.score?.away ?? 1;
        const predScoreText = isHome ? `${predHomeScore} – ${predAwayScore}` : `${predAwayScore} – ${predHomeScore}`;

        const matchDate = nextMatch.utc_date
          ? new Date(nextMatch.utc_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : 'Upcoming';

        return (
          <section style={{
            background: '#111827',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚡ Next Match Prediction
              </h2>
              <span style={{ fontSize: '0.80rem', color: '#94a3b8' }}>
                📅 {matchDate} · {isHome ? 'Home Fixture' : 'Away Fixture'}
              </span>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.2rem',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>
                  Fixture
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
                  {isHome ? `${shortName} vs ${oppName}` : `${oppName} vs ${shortName}`}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {nextMatch.league?.name || compName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>
                  {shortName} Win Probability
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8' }}>
                  {teamProb}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Draw: {drawProb}% · {oppName}: {oppProb}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>
                  Projected Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4ade80' }}>
                  {predScoreText}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Model forecast
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link
                  href={getMatchPredictionUrl(nextMatch)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '0.7rem 1.2rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                  }}
                >
                  🎯 View Match Analysis →
                </Link>
              </div>
            </div>
          </section>
        );
      })() : (
        <div style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.2rem 1.5rem',
          marginBottom: '2rem',
          color: '#94a3b8',
          fontSize: '0.90rem',
        }}>
          ℹ️ No upcoming matches scheduled in the active round window for {TN}.
        </div>
      )}

      {/* Team Performance Stats Grid */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 Team Statistics &amp; Performance Overview
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Matches</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>{stats.totalPlayed}</div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 800 }}>Wins</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', marginTop: '0.2rem' }}>{stats.wins}</div>
          </div>
          <div style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 800 }}>Draws</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#eab308', marginTop: '0.2rem' }}>{stats.draws}</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 800 }}>Losses</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>{stats.losses}</div>
          </div>
          <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#7dd3fc', textTransform: 'uppercase', fontWeight: 800 }}>Win Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>{stats.winRate}%</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Clean Sheets</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>{stats.cleanSheets}</div>
          </div>
        </div>

        {/* Detailed Attack / Defence / Venue Split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              ⚽ Goal Scoring Metrics
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Goals Scored:</span>
              <strong style={{ color: '#f8fafc' }}>{stats.goalsFor}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Goals Conceded:</span>
              <strong style={{ color: '#f8fafc' }}>{stats.goalsAgainst}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Goal Difference:</span>
              <strong style={{ color: stats.goalDifference >= 0 ? '#4ade80' : '#ef4444' }}>
                {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
              </strong>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              🏟️ Venue Performance
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Home Record:</span>
              <strong style={{ color: '#f8fafc' }}>{stats.homeWins}W - {stats.homeDraws}D - {stats.homeLosses}L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Away Record:</span>
              <strong style={{ color: '#f8fafc' }}>{stats.awayWins}W - {stats.awayDraws}D - {stats.awayLosses}L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>BTTS Matches:</span>
              <strong style={{ color: '#38bdf8' }}>{stats.bttsMatches} ({stats.totalPlayed > 0 ? Math.round((stats.bttsMatches / stats.totalPlayed) * 100) : 0}%)</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Match Form */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
          📈 Recent Matches &amp; Results Form
        </h2>

        {recentMatches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {recentMatches.slice(0, 5).map(m => {
              const isHome = m.home_team?.id === team.id;
              const opp = isHome ? m.away_team : m.home_team;
              const oppName = opp?.short_name || opp?.name || 'Opponent';
              const tScore = isHome ? (m.home_score ?? 0) : (m.away_score ?? 0);
              const oppScore = isHome ? (m.away_score ?? 0) : (m.home_score ?? 0);
              const isWin = tScore > oppScore;
              const isDraw = tScore === oppScore;
              const isLoss = tScore < oppScore;

              const badgeLetter = isWin ? 'W' : isDraw ? 'D' : 'L';
              const badgeBg = isWin ? '#16a34a' : isDraw ? '#ca8a04' : '#dc2626';

              const mDate = m.utc_date
                ? new Date(m.utc_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';

              return (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: badgeBg,
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.80rem',
                    }}>
                      {badgeLetter}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
                        {isHome ? `${shortName} ${tScore} - ${oppScore} ${oppName}` : `${shortName} ${tScore} - ${oppScore} ${oppName}`}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {m.league?.name || compName} · {mDate}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={getMatchPredictionUrl(m)}
                    style={{
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    View Match Stats →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            No completed match results recorded yet in this dataset.
          </div>
        )}
      </section>

      {/* Upcoming Fixtures Schedule */}
      {upcomingMatches.length > 1 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            📅 Upcoming {shortName} Fixtures
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {upcomingMatches.slice(1, 5).map(m => {
              const isHome = m.home_team?.id === team.id;
              const opp = isHome ? m.away_team : m.home_team;
              const oppName = opp?.short_name || opp?.name || 'Opponent';
              const mDate = m.utc_date
                ? new Date(m.utc_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : '';

              return (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
                      {isHome ? `${shortName} vs ${oppName}` : `${oppName} vs ${shortName}`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {m.league?.name || compName} · {mDate} ({isHome ? 'Home' : 'Away'})
                    </div>
                  </div>

                  <Link
                    href={getMatchPredictionUrl(m)}
                    style={{
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 700,
                      background: 'rgba(56,189,248,0.1)',
                      border: '1px solid rgba(56,189,248,0.25)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Prediction Preview →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Internal Navigation Links */}
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
          Explore More Teams &amp; Predictions:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {league && (
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
          )}
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
