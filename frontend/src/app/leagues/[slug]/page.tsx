import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLeagueDataBySlug, getMatchPredictionUrl, getTeamUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO Metadata Generation for Individual League Pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLeagueDataBySlug(slug);

  if (!data) {
    return {
      title: 'League Predictions & Standings | FootballPredict',
      description: 'Football league predictions, match statistics, fixtures, and standings on FootballPredict.',
      robots: { index: false, follow: false },
    };
  }

  const LN = data.league.name;
  const title = `${LN} Predictions, Fixtures & Standings | FootballPredict`;
  const description = `${LN} predictions, fixtures, standings, team form and football statistics from FootballPredict.`;
  const canonicalUrl = getCanonicalUrl(`/leagues/${slug}`);

  return {
    title,
    description,
    keywords: [
      `${LN} predictions`,
      `${LN} fixtures`,
      `${LN} standings`,
      `${LN} stats`,
      `${LN} odds`,
      `${LN} table`,
      'football league predictions',
    ],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: `/leagues/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        data.league.emblem
          ? { url: data.league.emblem, alt: `${LN} Emblem` }
          : { url: `${siteConfig.url}/og-image.png`, width: 1200, height: 630, alt: `${LN} — FootballPredict` },
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.league.emblem || `${siteConfig.url}/og-image.png`],
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

export default async function LeaguePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getLeagueDataBySlug(slug);

  if (!data) {
    notFound();
  }

  const { league, standings, teams, upcomingMatches, recentMatches } = data;
  const LN = league.name;
  const country = league.country || 'Global';

  // Schema.org Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: LN,
    sport: 'Football',
    logo: league.emblem || undefined,
    url: `${siteConfig.url}/leagues/${slug}`,
    location: league.country ? {
      '@type': 'Country',
      name: league.country,
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
            <Link href="/leagues" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Competitions
            </Link>
          </li>
          <li>›</li>
          <li style={{ color: '#f8fafc', fontWeight: 700 }} aria-current="page">
            {LN}
          </li>
        </ol>
      </nav>

      {/* League Header Hero Banner */}
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
        {league.emblem ? (
          <img
            src={league.emblem}
            alt={`${LN} Emblem`}
            style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        ) : (
          <div style={{ fontSize: '3.5rem' }}>{league.flag || '🏆'}</div>
        )}

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}>
              🌍 {country}
            </span>
            {league.current_season && (
              <span style={{
                background: 'rgba(168,85,247,0.15)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: '#d8b4fe',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}>
                📅 {league.current_season}
              </span>
            )}
          </div>
          <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
            {LN}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5 }}>
            FootballPredict provides match predictions, team form, fixtures, standings and statistical analysis for the {LN}.
          </p>
        </div>
      </header>

      {/* Upcoming League Predictions Section */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎯 Upcoming {LN} Predictions
          </h2>
          <Link
            href={`/fixtures?league=${league.code}`}
            style={{ fontSize: '0.82rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}
          >
            View all in Fixtures →
          </Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {upcomingMatches.slice(0, 6).map(m => {
              const HN = m.home_team?.short_name || m.home_team?.name || 'Home';
              const AN = m.away_team?.short_name || m.away_team?.name || 'Away';

              let ai: any = null;
              if (m.prediction_description) {
                try { ai = JSON.parse(m.prediction_description); } catch {}
              }

              const hp = m.ai_home_prob != null ? Math.round(m.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45);
              const dp = m.ai_draw_prob != null ? Math.round(m.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 27);
              const ap = m.ai_away_prob != null ? Math.round(m.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 28);

              const predHome = m.ai_predicted_home ?? ai?.score?.home ?? 1;
              const predAway = m.ai_predicted_away ?? ai?.score?.away ?? 1;

              const mDate = m.utc_date
                ? new Date(m.utc_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : 'Upcoming';

              return (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.8rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      <span>📅 {mDate}</span>
                      {m.matchday && <span>Matchday {m.matchday}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {m.home_team?.crest && (
                          <img src={m.home_team.crest} alt={HN} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        )}
                        <span>{HN}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 900 }}>VS</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{AN}</span>
                        {m.away_team?.crest && (
                          <img src={m.away_team.crest} alt={AN} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prediction Pill & Win Probs */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.3rem', fontWeight: 700 }}>
                      <span style={{ color: '#60a5fa' }}>{HN} {hp}%</span>
                      <span style={{ color: '#94a3b8' }}>Draw {dp}%</span>
                      <span style={{ color: '#a78bfa' }}>{AN} {ap}%</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#4ade80', fontWeight: 800, textAlign: 'center' }}>
                      Projected Score: {HN} {predHome} – {predAway} {AN}
                    </div>
                  </div>

                  <Link
                    href={getMatchPredictionUrl(m)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: 'rgba(56,189,248,0.1)',
                      border: '1px solid rgba(56,189,248,0.25)',
                      color: '#38bdf8',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.80rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    View Match Analysis →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.90rem' }}>
            No upcoming fixtures scheduled in the current matchday window for {LN}.
          </div>
        )}
      </section>

      {/* Official Standings Table */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
          🏆 {LN} Standings Table
        </h2>

        {standings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.78rem' }}>
                  <th style={{ padding: '0.6rem 0.4rem', width: '36px' }}>#</th>
                  <th style={{ padding: '0.6rem 0.6rem' }}>Team</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>P</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>W</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>D</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>L</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>GD</th>
                  <th style={{ padding: '0.6rem 0.6rem', textAlign: 'center', fontWeight: 800, color: '#38bdf8' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(item => (
                  <tr key={item.team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.84rem' }}>
                    <td style={{ padding: '0.6rem 0.4rem', fontWeight: 800, color: item.position <= 4 ? '#4ade80' : item.position >= standings.length - 3 ? '#ef4444' : '#94a3b8' }}>
                      {item.position}
                    </td>
                    <td style={{ padding: '0.6rem 0.6rem' }}>
                      <Link
                        href={getTeamUrl(item.team.name)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#f8fafc',
                          textDecoration: 'none',
                          fontWeight: 700,
                        }}
                      >
                        {item.team.crest && (
                          <img src={item.team.crest} alt={item.team.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        )}
                        <span>{item.team.name}</span>
                      </Link>
                    </td>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: '#cbd5e1' }}>{item.playedGames}</td>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: '#cbd5e1' }}>{item.won}</td>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: '#cbd5e1' }}>{item.draw}</td>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: '#cbd5e1' }}>{item.lost}</td>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: item.goalDifference > 0 ? '#4ade80' : item.goalDifference < 0 ? '#ef4444' : '#cbd5e1' }}>
                      {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                    </td>
                    <td style={{ padding: '0.6rem 0.6rem', textAlign: 'center', fontWeight: 900, color: '#38bdf8' }}>{item.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Standings table is not active or available for this competition format.
          </div>
        )}
      </section>

      {/* Participating Teams Directory */}
      {teams.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            👥 Teams in {LN}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
            {teams.map(t => (
              <Link
                key={t.id}
                href={getTeamUrl(t)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: 'none',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {t.crest && (
                  <img src={t.crest} alt={t.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                )}
                <span>{t.short_name || t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent League Results */}
      {recentMatches.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            📊 Recent {LN} Results
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {recentMatches.slice(0, 6).map(m => {
              const HN = m.home_team?.short_name || m.home_team?.name || 'Home';
              const AN = m.away_team?.short_name || m.away_team?.name || 'Away';
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.80rem', color: '#94a3b8' }}>📅 {mDate}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.90rem', color: '#f8fafc' }}>
                      {HN} {m.home_score ?? 0} – {m.away_score ?? 0} {AN}
                    </span>
                  </div>

                  <Link
                    href={getMatchPredictionUrl(m)}
                    style={{
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Match Preview &amp; Stats →
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
          Explore More Competitions &amp; Forecasts:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link
            href="/leagues"
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
            🌍 All Competitions
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
