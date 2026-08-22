'use client';

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/lib/types';
import { fetchLeaderboard, fetchMyRank } from '@/lib/api';
import Leaderboard from '@/components/Leaderboard';
import { useAuth } from '@/context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number | null; total_users: number; total_points: number; accuracy: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchLeaderboard(50).then(setEntries).catch(() => []),
      user ? fetchMyRank().then(setMyRank).catch(() => null) : Promise.resolve(null),
    ]).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Global Leaderboard 👑</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          See where you stand against the top football predictors in the community.
        </p>
      </div>

      {user && myRank && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Global Rank</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                {myRank.rank ? `#${myRank.rank}` : 'Unranked'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>of {myRank.total_users} users</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Points</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-green)' }}>{myRank.total_points} pts</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy Rate</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{myRank.accuracy}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading leaderboard rankings...
        </div>
      ) : (
        <Leaderboard entries={entries} />
      )}
    </div>
  );
}
