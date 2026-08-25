import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLeagueDataBySlug, getMatchPredictionUrl, getTeamUrl } from '@/lib/slugs';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import { generateLeagueOverviewText } from '@/lib/contentGenerator';

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
        {
          url: `${siteConfig.url}/leagues/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${LN} — FootballPredict`,
        },
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteConfig.url}/leagues/${slug}/opengraph-image`],
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

  const { league, standings, upcomingMatches, recentMatches, teams } = data;
  const LN = league.name;

  // Generate deterministic content
  const leagueText = generateLeagueOverviewText(league, standings, upcomingMatches.length, teams.length);

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

      {/* Breadcrumb Navigation & Schema.org BreadcrumbList */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Leagues', url: '/leagues' },
          { name: LN },
        ]}
      />

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
            style={{ width: '84px', height: '84px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        ) : (
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{league.flag || '🏆'}</div>
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
              {league.country || 'Global'}
            </span>
            {league.current_season && (
              <span style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#86efac',
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

      {/* Data-Driven League Overview & Context Section */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
          📖 {LN} Competition Overview &amp; Analysis
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>{leagueText.overviewText}</p>
          <p style={{ margin: 0 }}>{leagueText.standingsSummary}</p>
          <p style={{ margin: 0 }}>{leagueText.fixturesSummary}</p>
        </div>
      </section>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>📅 {mDate}</span>
                    {m.matchday && <span>MD {m.matchday}</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Link href={getTeamUrl(HN)} style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {m.home_team?.crest && (
                        <img src={m.home_team.crest} alt={HN} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      )}
                      <span>{HN}</span>
                    </Link>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>VS</span>
                    <Link href={getTeamUrl(AN)} style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{AN}</span>
                      {m.away_team?.crest && (
                        <img src={m.away_team.crest} alt={AN} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      )}
                    </Link>
                  </div>

                  {/* Probabilities bar */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#60a5fa' }}>{HN} {hp}%</span>
                      <span style={{ color: '#94a3b8' }}>Draw {dp}%</span>
                      <span style={{ color: '#a78bfa' }}>{AN} {ap}%</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#4ade80', fontWeight: 800, textAlign: 'center' }}>
                      Projected: {HN} {predHome} – {predAway} {AN}
                    </div>
                  </div>

                  <Link
                    href={getMatchPredictionUrl(m)}
                    style={{
                      textAlign: 'center',
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.25)',
                      color: '#93c5fd',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    Match Analysis &amp; Tips →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            No upcoming fixtures currently scheduled for {LN}.
          </div>
        )}
      </section>

      {/* Standings Table Section */}
      {standings.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏆 {LN} Standings Table
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Team</th>
                  <th style={{ textAlign: 'center' }}>P</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>D</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>GD</th>
                  <th style={{ textAlign: 'center', fontWeight: 700 }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((item) => (
                  <tr key={item.team.id}>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: item.position <= 4 ? '#4ade80' : item.position >= standings.length - 3 ? '#ef4444' : '#94a3b8'
                      }}>
                        {item.position}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={getTeamUrl(item.team.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          textDecoration: 'none',
                          color: '#f8fafc',
                          fontWeight: 600,
                        }}
                      >
                        {item.team.crest && (
                          <img src={item.team.crest} alt={item.team.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        )}
                        <span>{item.team.name}</span>
                      </Link>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.playedGames}</td>
                    <td style={{ textAlign: 'center' }}>{item.won}</td>
                    <td style={{ textAlign: 'center' }}>{item.draw}</td>
                    <td style={{ textAlign: 'center' }}>{item.lost}</td>
                    <td style={{ textAlign: 'center' }}>{item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#38bdf8' }}>{item.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
            🛡️ Teams in {LN} ({teams.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.8rem' }}>
            {teams.map(t => (
              <Link
                key={t.id}
                href={getTeamUrl(t.name)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: 'none',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'background 0.2s',
                }}
              >
                {t.crest && (
                  <img src={t.crest} alt={t.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentMatches.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            📜 Recent {LN} Results
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentMatches.slice(0, 5).map(m => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{mDate}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
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
                    View Result Analysis →
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
          Explore More Competitions &amp; Match Predictions:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
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
            🎯 Today&apos;s Predictions
          </Link>
          <Link
            href="/leagues/premier-league"
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
            🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
          </Link>
          <Link
            href="/leagues/champions-league"
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
            ⭐ Champions League
          </Link>
          <Link
            href="/leagues/la-liga"
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
            🇪🇸 La Liga
          </Link>
          <Link
            href="/leagues/serie-a"
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
            🇮🇹 Serie A
          </Link>
          <Link
            href="/leagues/bundesliga"
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
            🇩🇪 Bundesliga
          </Link>
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