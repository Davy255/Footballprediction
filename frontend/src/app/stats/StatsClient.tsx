'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMatchesFeed, fetchMatches } from '@/lib/api';
import { Match } from '@/lib/types';
import { computeHistoricalPredictionPerformance, PredictionPerformanceMetrics } from '@/lib/historicalTracking';

interface StatsClientProps {
  initialMetrics: PredictionPerformanceMetrics | null;
}

export default function StatsClient({ initialMetrics }: StatsClientProps) {
  const [metrics, setMetrics] = useState<PredictionPerformanceMetrics | null>(initialMetrics);
  const [loading, setLoading] = useState<boolean>(!initialMetrics);

  useEffect(() => {
    if (!initialMetrics) {
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
    }
  }, [initialMetrics]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
        <p style={{ fontWeight: 700, fontSize: '0.96rem' }}>Calculating model accuracy from historical fixtures...</p>
      </div>
    );
  }

  if (!metrics || metrics.totalCompleted === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Historical Prediction Dataset Updating
        </h3>
        <p style={{ fontSize: '0.88rem', maxWidth: '580px', margin: '0 auto 1.25rem auto', lineHeight: 1.6 }}>
          FootballPredict continuously records and benchmarks pre-match forecasts against official matchday outcomes across Europe&apos;s top leagues. Historical verification data updates automatically as full-time scores are confirmed.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/football-predictions-today" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}>
            🎯 Explore Today&apos;s Predictions
          </Link>
          <Link href="/articles/how-footballpredict-ai-calculates-win-probabilities" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 700 }}>
            📚 Read Methodology Guide
          </Link>
        </div>
      </div>
    );
  }

  return (
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

        {/* Confidence Tier Accuracy */}
        <div style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📶 Accuracy by Model Conviction Level
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(metrics.byConfidence).map(([tier, data]) => {
              const colors: Record<string, { label: string; bg: string; text: string }> = {
                VERY_HIGH: { label: 'Very High (≥65% win prob)', bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
                HIGH: { label: 'High (55%–64% win prob)', bg: 'rgba(56,189,248,0.15)', text: '#38bdf8' },
                MEDIUM: { label: 'Medium (45%–54% win prob)', bg: 'rgba(234,179,8,0.15)', text: '#fde047' },
                LOW: { label: 'Low (<45% win prob)', bg: 'rgba(148,163,184,0.15)', text: '#cbd5e1' },
              };
              const config = colors[tier] || { label: tier, bg: 'rgba(255,255,255,0.08)', text: '#f8fafc' };

              return (
                <div key={tier} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {data.total} matches analyzed
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.80rem',
                      fontWeight: 900,
                      background: config.bg,
                      color: config.text,
                    }}>
                      {data.accuracyPct}%
                    </span>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {data.correct}/{data.total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Prediction Ledger */}
      {metrics.recentRecords.length > 0 && (
        <section style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📜</span> Recent Verified Prediction Ledger
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', fontSize: '0.84rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Fixture</th>
                  <th>Competition</th>
                  <th>Predicted Result</th>
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

      {/* Accuracy Evaluation Methodology Guide */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>📐</span> Accuracy Audit Methodology &amp; Benchmark Standards
        </h2>
        <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: 0 }}>
            <strong>1. Pre-Kickoff Snapshot Locking:</strong> Every model prediction—including 1X2 win probabilities, projected integer scorelines, and confidence tiers—is permanently locked at kickoff. Predictions are never retroactively edited or adjusted after a match begins.
          </p>
          <p style={{ margin: 0 }}>
            <strong>2. Standard 1X2 Outcome Benchmark:</strong> An outcome forecast is counted as a <em>Correct Hit</em> if the highest-probability outcome predicted by the model (Home Win, Draw, or Away Win) exactly matches the official final result at the end of regular time (90 minutes plus stoppage time).
          </p>
          <p style={{ margin: 0 }}>
            <strong>3. The 3-Way Baseline Reality:</strong> Unlike binary 2-way sports (such as tennis or American football moneyline), European football features three distinct outcomes with draws occurring in ~25% of matches. In a 3-way distribution, naive random guessing yields ~33.3% accuracy; maintaining consistent 55%–65% hit rates across multi-hundred match samples represents a statistically significant predictive signal.
          </p>
          <p style={{ margin: 0 }}>
            <strong>4. Evaluation Limitations:</strong> Single match outcomes carry high stochastic variance (e.g., unexpected early red cards or missed penalties). Model performance should always be evaluated across aggregate cohorts rather than individual fixtures. Read our full <Link href="/articles/how-footballpredict-ai-calculates-win-probabilities" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Prediction Methodology Guide</Link> for detailed statistical formulas.
          </p>
        </div>
      </section>

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
            👑 Community Leaderboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
