'use client';

import React, { useEffect, useState } from 'react';
import { Prediction } from '@/lib/types';
import { fetchMyPredictions, deletePrediction, fetchMyRank } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function AuthGatePage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Track Your Predictions</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Log in to submit match predictions, track your accuracy, view points earned, and see your global ranking.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login?redirect=/predictions" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            Login Now
          </Link>
          <Link href="/register" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem' }}>
            Create Account
          </Link>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Free to join &bull; Earn up to 8 points per match
        </p>
      </div>
    </div>
  );
}

export default function MyPredictionsPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number | null; total_users: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'correct' | 'wrong'>('all');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [data, rank] = await Promise.all([
        fetchMyPredictions().catch(() => []),
        fetchMyRank().catch(() => null),
      ]);
      setPredictions(data);
      setMyRank(rank);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Cancel this prediction?')) return;
    try {
      await deletePrediction(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel prediction');
    }
  };

  if (!user) return <AuthGatePage />;

  const filtered = predictions.filter((p) => {
    if (filter === 'pending') return !p.is_scored;
    if (filter === 'correct') return p.is_scored && p.outcome_correct;
    if (filter === 'wrong') return p.is_scored && !p.outcome_correct;
    return true;
  });

  const renderPicksBadges = (p: Prediction) => {
    const badges = [];

    if (p.predicted_outcome) {
      const label = p.predicted_outcome === 'HOME_TEAM' 
        ? (p.match.home_team.short_name || p.match.home_team.name || 'Home Win')
        : p.predicted_outcome === 'AWAY_TEAM'
        ? (p.match.away_team.short_name || p.match.away_team.name || 'Away Win')
        : 'Draw (X)';
      badges.push(
        <span key="outcome" className="status-badge status-scheduled" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
          {label}
        </span>
      );
    }

    if (p.predicted_dc) {
      badges.push(
        <span key="dc" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
          DC: {p.predicted_dc.toUpperCase()}
        </span>
      );
    }

    if (p.predicted_btts) {
      badges.push(
        <span key="btts" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
          BTTS: {p.predicted_btts.toUpperCase()}
        </span>
      );
    }

    if (p.predicted_over25) {
      badges.push(
        <span key="ou" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
          O/U: {p.predicted_over25.toUpperCase()} 2.5
        </span>
      );
    }

    if (badges.length === 0) {
      badges.push(
        <span key="none" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          —
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
        {badges}
      </div>
    );
  };

  const getResultBadge = (p: Prediction) => {
    if (!p.is_scored) return <span className="result-pending">⏳ Pending</span>;
    if (p.score_correct) return <span className="result-exact">🎯 Exact Score</span>;
    if (p.outcome_correct || p.points_earned > 0) return <span className="result-correct">✅ Won (+{p.points_earned} pts)</span>;
    return <span className="result-wrong">❌ Missed</span>;
  };

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>My Predictions 🎯</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review your past and pending predictions, points earned, and accuracy.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Points', value: `${user.total_points}`, unit: 'pts', color: 'var(--accent-green)' },
          { label: 'Accuracy', value: `${user.accuracy}`, unit: '%', color: 'var(--accent-blue)' },
          { label: 'Correct Results', value: `${user.correct_results}/${user.total_predictions}`, unit: '', color: 'var(--accent-purple)' },
          { label: 'Exact Scores', value: `${user.correct_scores}`, unit: '', color: 'var(--accent-amber)' },
          ...(myRank?.rank ? [{ label: 'Global Rank', value: `#${myRank.rank}`, unit: `of ${myRank.total_users}`, color: 'var(--accent-pink)' }] : []),
        ].map((s) => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            {s.unit && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.unit}</div>
            )}
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {([
          { key: 'all', label: `All (${predictions.length})` },
          { key: 'pending', label: `Pending (${predictions.filter(p => !p.is_scored).length})` },
          { key: 'correct', label: `Correct (${predictions.filter(p => p.is_scored && p.outcome_correct).length})` },
          { key: 'wrong', label: `Wrong (${predictions.filter(p => p.is_scored && !p.outcome_correct).length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: `1px solid ${filter === key ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              background: filter === key ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
              color: filter === key ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Predictions Table */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading predictions...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Match</th>
                  <th style={{ textAlign: 'center' }}>My Pick</th>
                  <th style={{ textAlign: 'center' }}>My Score</th>
                  <th style={{ textAlign: 'center' }}>Result</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Points</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {p.match.home_team.short_name || p.match.home_team.name} vs {p.match.away_team.short_name || p.match.away_team.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {p.match.league.flag} {p.match.league.name} &bull; {new Date(p.match.utc_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {renderPicksBadges(p)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                      {p.predicted_home_score !== null && p.predicted_home_score !== undefined && p.predicted_away_score !== null && p.predicted_away_score !== undefined ? (
                        `${p.predicted_home_score} : ${p.predicted_away_score}`
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                      {p.match.status === 'FINISHED'
                        ? `${p.match.home_score} – ${p.match.away_score}`
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Pending</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getResultBadge(p)}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900 }}>
                      <span style={{
                        color: p.points_earned > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontSize: '1rem',
                      }}>
                        {p.points_earned > 0 ? `+${p.points_earned}` : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {!p.is_scored && p.match.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)',
                            border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No predictions yet</p>
          <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Head over to Fixtures to start making picks and earning points!
          </p>
          <Link href="/fixtures" className="btn btn-primary">
            Browse Fixtures
          </Link>
        </div>
      )}
    </div>
  );
}
