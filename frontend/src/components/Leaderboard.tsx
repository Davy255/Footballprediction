'use client';

import React from 'react';
import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  hideHeader?: boolean;
}

export default function Leaderboard({ entries, hideHeader = false }: LeaderboardProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No predictions submitted yet. Be the first on the leaderboard! 🚀
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {!hideHeader && (
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1.1rem' }}>
          👑 Global Leaderboard
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Rank</th>
              <th>Predictor</th>
              <th style={{ textAlign: 'center' }}>Picks</th>
              <th style={{ textAlign: 'center' }}>Correct Results</th>
              <th style={{ textAlign: 'center' }}>Exact Scores</th>
              <th style={{ textAlign: 'center' }}>Accuracy</th>
              <th style={{ textAlign: 'center', fontWeight: 700 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <div className={`rank-badge ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--gradient-badge)',
                      color: '#white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{entry.username}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>{entry.total_predictions}</td>
                <td style={{ textAlign: 'center' }}>{entry.correct_results}</td>
                <td style={{ textAlign: 'center' }}>{entry.correct_scores}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    color: entry.accuracy >= 60 ? 'var(--accent-green)' : entry.accuracy >= 40 ? 'var(--accent-amber)' : 'var(--text-secondary)',
                    fontWeight: 600
                  }}>
                    {entry.accuracy}%
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-green)', fontSize: '1.05rem' }}>
                  {entry.total_points} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
