'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { LeaderboardEntry } from '@/lib/types';
import { fetchLeaderboard, fetchMyRank } from '@/lib/api';
import Leaderboard from '@/components/Leaderboard';
import AdBanner from '@/components/AdBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number | null; total_users: number; total_points: number; accuracy: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState<'points' | 'accuracy' | 'scores'>('points');

  useEffect(() => {
    Promise.all([
      fetchLeaderboard(50).then(setEntries).catch(() => []),
      user ? fetchMyRank().then(setMyRank).catch(() => null) : Promise.resolve(null),
    ]).finally(() => setLoading(false));
  }, [user]);

  const sortedEntries = useMemo(() => {
    const list = [...entries];
    if (sortFilter === 'accuracy') {
      return list.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
    }
    if (sortFilter === 'scores') {
      return list.sort((a, b) => (b.correct_scores || 0) - (a.correct_scores || 0));
    }
    return list.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
  }, [entries, sortFilter]);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Community Leaderboard & Model Rankings' },
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Global Predictor Leaderboard 👑
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '640px' }}>
          Real-time performance rankings based on verified, finished football results. Compare community tipsters against the official FootballPredict AI model baseline.
        </p>
      </div>

      <AdBanner slot="hero-top" />

      {/* Algorithmic Model Baseline vs Community Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Model Baseline Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(17,24,39,0.95) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '14px',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
              🤖 AI Model Baseline
            </span>
            <Link href="/accuracy" style={{ fontSize: '0.74rem', color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
              Full Audit →
            </Link>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.4rem' }}>
            FootballPredict Primary Engine
          </div>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 0.8rem 0' }}>
            Audited historical 1X2 outcome prediction benchmark across verified domestic &amp; continental league matches.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
              Verified Outcome Tracking
            </span>
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
              Deterministic Elo + Poisson
            </span>
          </div>
        </div>

        {/* User Rank Card */}
        {user && myRank && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(17,24,39,0.95) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '14px',
            padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              👤 Your Performance Standing
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc' }}>
                  {myRank.rank ? `#${myRank.rank}` : 'Unranked'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  out of {myRank.total_users} active tipsters
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80' }}>
                  {myRank.total_points} pts
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                  {myRank.accuracy}% accuracy
                </div>
              </div>
            </div>
            <Link href="/dashboard" style={{ fontSize: '0.76rem', color: '#6ee7b7', fontWeight: 800, textDecoration: 'none' }}>
              View Personal Dashboard &amp; My Picks →
            </Link>
          </div>
        )}
      </div>

      {/* Leaderboard Sorting Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#cbd5e1' }}>
          Top Predictors ({sortedEntries.length})
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: 'points', label: '🏆 Total Points' },
            { key: 'accuracy', label: '🎯 Accuracy %' },
            { key: 'scores', label: '🔢 Exact Scores' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSortFilter(item.key as any)}
              style={{
                background: sortFilter === item.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                border: sortFilter === item.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: sortFilter === item.key ? '#93c5fd' : '#cbd5e1',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table Component */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading predictor leaderboard rankings...
        </div>
      ) : (
        <Leaderboard entries={sortedEntries} hideHeader={true} />
      )}

      {/* Internal Navigation Gateway */}
      <div style={{
        marginTop: '2.5rem',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
          Want to test your football prediction skills against the community and AI?
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link href="/football-predictions-today" className="btn btn-primary btn-sm" style={{ fontWeight: 800, fontSize: '0.80rem' }}>
            Submit Today&apos;s Predictions
          </Link>
          <Link href="/accuracy" className="btn btn-secondary btn-sm" style={{ fontWeight: 700, fontSize: '0.80rem' }}>
            AI Accuracy Audit
          </Link>
        </div>
      </div>

      <AdBanner slot="leaderboard-footer" />
    </div>
  );
}
