'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchMatchesFeed, fetchMatches } from '@/lib/api';
import { Match } from '@/lib/types';
import { computeHistoricalPredictionPerformance, PredictionPerformanceMetrics } from '@/lib/historicalTracking';
import { getMatchPredictionUrl, getLeagueUrl, getTeamUrl } from '@/lib/slugs';

export default function AccuracyDashboardPage() {
  const [metrics, setMetrics] = useState<PredictionPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerformanceData() {
      try {
        let matches: Match[] = [];
        const feed = await fetchMatchesFeed().catch(() => null);
        if (feed && Array.isArray(feed.matches) && feed.matches.length > 0) {
          matches = feed.matches;
        } else {
          matches = await fetchMatches({ status: 'FINISHED', limit: 120 }).catch(() => []);
        }

        const perf = computeHistoricalPredictionPerformance(matches);
        setMetrics(perf);
      } catch (err) {
        console.error('Error computing prediction metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPerformanceData();
  }, []);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Prediction Performance & Accuracy' },
        ]}
      />

      {/* Hero Header Banner */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(17,24,39,0.95) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#86efac',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}>
            ● Real-Time Verification Active
          </span>
          <span style={{ fontSize: '0.80rem', color: '#94a3b8' }}>
            Audited Against Official Match Results
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
          fontWeight: 900,
          color: '#f8fafc',
          margin: '0 0 0.5rem 0',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.02em',
        }}>
          Prediction Performance &amp; Accuracy Dashboard 📊
        </h1>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '780px', lineHeight: 1.55 }}>
          Transparent tracking of FootballPredict&apos;s statistical models. Predictions are generated prior to kickoff and evaluated automatically against official final scores across 1X2 outcomes, scorelines, and confidence tiers.
        </p>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p style={{ fontWeight: 700, fontSize: '0.96rem' }}>Calculating model accuracy from historical fixtures...</p>
        </div>
      ) : !metrics || metrics.totalCompleted === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Historical Prediction Dataset Initializing
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Completed fixtures are continually evaluated as matchdays conclude. Check back as new official results are finalized!
          </p>
          <Link href="/football-predictions-today" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}>
            🎯 Explore Today&apos;s Predictions
          </Link>
        </div>
      ) : (
        <div>
          {/* Top Key Performance Indicator Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {/* Overall 1X2 Accuracy */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '14px',
              padding: '1.4rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.3rem' }}>
                Overall 1X2 Accuracy
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#4ade80' }}>
                {metrics.overallAccuracyPct}%
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                {metrics.outcomeCorrectCount} of {metrics.totalCompleted} verified completed fixtures
              </div>
            </div>

            {/* Exact Score Accuracy */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: '14px',
              padding: '1.4rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#7dd3fc', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.3rem' }}>
                Exact Scoreline Hit Rate
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#38bdf8' }}>
                {metrics.exactScoreAccuracyPct}%
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                {metrics.exactScoreCorrectCount} perfect scoreline predictions
              </div>
            </div>

            {/* High Confidence Accuracy */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '14px',
              padding: '1.4rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#d8b4fe', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.3rem' }}>
                High &amp; Very High Conviction
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#c084fc' }}>
                {metrics.byConfidence.VERY_HIGH.total + metrics.byConfidence.HIGH.total > 0
                  ? Number((((metrics.byConfidence.VERY_HIGH.correct + metrics.byConfidence.HIGH.correct) /
                      (metrics.byConfidence.VERY_HIGH.total + metrics.byConfidence.HIGH.total)) * 100).toFixed(1))
                  : metrics.overallAccuracyPct}%
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                Top-tier model conviction matches (&gt;55% prob)
              </div>
            </div>

            {/* Current Streak */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '1.4rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.3rem' }}>
                Current Prediction Form
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: metrics.currentStreak.type === 'WIN' ? '#4ade80' : '#ef4444' }}>
                {metrics.currentStreak.type === 'WIN' ? `🔥 ${metrics.currentStreak.count}W` : `❄️ ${metrics.currentStreak.count}L`}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                {metrics.currentStreak.type === 'WIN' ? 'Consecutive correct forecasts' : 'Consecutive missed forecasts'}
              </div>
            </div>
          </div>

          {/* Breakdown by Outcome & Confidence Tiers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Outcome Segment Performance */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎯 Accuracy by Match Outcome Market
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Home Win */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#60a5fa' }}>Home Win Predictions</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.homeWinPredictions.accuracyPct}% ({metrics.homeWinPredictions.correct}/{metrics.homeWinPredictions.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.homeWinPredictions.accuracyPct}%`, height: '100%', background: '#3b82f6' }} />
                  </div>
                </div>

                {/* Away Win */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#a78bfa' }}>Away Win Predictions</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.awayWinPredictions.accuracyPct}% ({metrics.awayWinPredictions.correct}/{metrics.awayWinPredictions.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.awayWinPredictions.accuracyPct}%`, height: '100%', background: '#8b5cf6' }} />
                  </div>
                </div>

                {/* Draw */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Draw Predictions</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.drawPredictions.accuracyPct}% ({metrics.drawPredictions.correct}/{metrics.drawPredictions.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.drawPredictions.accuracyPct}%`, height: '100%', background: '#64748b' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Tier Performance */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛡️ Accuracy by Model Confidence Tier
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Very High */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#4ade80' }}>Very High Confidence (&ge;65%)</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.byConfidence.VERY_HIGH.accuracyPct}% ({metrics.byConfidence.VERY_HIGH.correct}/{metrics.byConfidence.VERY_HIGH.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.byConfidence.VERY_HIGH.accuracyPct}%`, height: '100%', background: '#22c55e' }} />
                  </div>
                </div>

                {/* High */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#38bdf8' }}>High Confidence (55%–64%)</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.byConfidence.HIGH.accuracyPct}% ({metrics.byConfidence.HIGH.correct}/{metrics.byConfidence.HIGH.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.byConfidence.HIGH.accuracyPct}%`, height: '100%', background: '#38bdf8' }} />
                  </div>
                </div>

                {/* Moderate */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fde047' }}>Moderate Confidence (45%–54%)</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.byConfidence.MODERATE.accuracyPct}% ({metrics.byConfidence.MODERATE.correct}/{metrics.byConfidence.MODERATE.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.byConfidence.MODERATE.accuracyPct}%`, height: '100%', background: '#eab308' }} />
                  </div>
                </div>

                {/* Low Margin */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#cbd5e1' }}>Balanced / Low Margin (&lt;45%)</span>
                    <span style={{ color: '#f8fafc' }}>
                      {metrics.byConfidence.LOW.accuracyPct}% ({metrics.byConfidence.LOW.correct}/{metrics.byConfidence.LOW.total})
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${metrics.byConfidence.LOW.accuracyPct}%`, height: '100%', background: '#94a3b8' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Competition */}
          {Object.keys(metrics.byLeague).length > 0 && (
            <section style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2.5rem',
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0' }}>
                🏆 Accuracy by Football League
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
                {Object.values(metrics.byLeague).map((lg) => (
                  <div
                    key={lg.leagueCode}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <Link
                        href={getLeagueUrl(lg.leagueName, lg.leagueCode)}
                        style={{ color: '#93c5fd', fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}
                      >
                        {lg.leagueName}
                      </Link>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                        {lg.correct} / {lg.total} matches correct
                      </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: lg.accuracyPct >= 60 ? '#4ade80' : '#38bdf8' }}>
                      {lg.accuracyPct}%
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verified Recent Prediction Ledger Table */}
          {metrics.recentRecords.length > 0 && (
            <section style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2.5rem',
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.4rem 0' }}>
                📜 Recent Verified Prediction Ledger ({metrics.recentRecords.length})
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.2rem 0' }}>
                Real match-by-match validation log comparing pre-game model forecasts against final match results.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', fontSize: '0.84rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Match</th>
                      <th>Competition</th>
                      <th>Model Forecast</th>
                      <th>Actual Score</th>
                      <th style={{ textAlign: 'center' }}>Outcome Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentRecords.map((r) => {
                      const matchUrl = `/prediction/${r.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${r.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${r.matchId}`;

                      return (
                        <tr key={r.matchId}>
                          <td style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{r.matchDate}</td>
                          <td>
                            <Link href={matchUrl} style={{ color: '#f8fafc', fontWeight: 700, textDecoration: 'none' }}>
                              {r.homeTeam} vs {r.awayTeam}
                            </Link>
                          </td>
                          <td style={{ color: '#93c5fd' }}>{r.leagueName}</td>
                          <td>
                            <span style={{ fontWeight: 800, color: r.predictedOutcome === 'HOME_TEAM' ? '#60a5fa' : r.predictedOutcome === 'AWAY_TEAM' ? '#a78bfa' : '#cbd5e1' }}>
                              {r.predictedOutcome === 'HOME_TEAM' ? `${r.homeTeam} Win` : r.predictedOutcome === 'AWAY_TEAM' ? `${r.awayTeam} Win` : 'Draw'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                              (Exp: {r.predictedHomeScore}-{r.predictedAwayScore})
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: '#f8fafc' }}>
                            {r.actualHomeScore} – {r.actualAwayScore}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 900,
                              background: r.isOutcomeCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: r.isOutcomeCorrect ? '#4ade80' : '#f87171',
                              border: `1px solid ${r.isOutcomeCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}>
                              {r.isOutcomeCorrect ? '✓ Correct' : '✕ Miss'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Internal Linking Footer */}
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
              Explore Live Predictions &amp; Competitions:
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
                📅 Fixtures Schedule
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
                🏆 European Leagues
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
      )}

    </div>
  );
}
