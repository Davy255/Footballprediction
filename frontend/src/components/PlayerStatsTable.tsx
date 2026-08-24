'use client';

import React, { useState } from 'react';
import { Player, LineupData } from './TacticalPitch';

interface PlayerStatsTableProps {
  lineupData?: LineupData;
  homeName: string;
  awayName: string;
}

type CategoryKey = 'goals' | 'assists' | 'tackles' | 'rating';

export default function PlayerStatsTable({ lineupData, homeName, awayName }: PlayerStatsTableProps) {
  const [category, setCategory] = useState<CategoryKey>('goals');

  const leaders = lineupData?.leaders;
  const list =
    category === 'goals'
      ? leaders?.top_scorers || []
      : category === 'assists'
      ? leaders?.top_playmakers || []
      : category === 'tackles'
      ? leaders?.top_defenders || []
      : leaders?.highest_rated || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Category Pills Switcher */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {[
          { key: 'goals', label: '⚽ Top Scorers' },
          { key: 'assists', label: '🎯 Key Playmakers' },
          { key: 'tackles', label: '🛡️ Defensive Leaders' },
          { key: 'rating', label: '⭐ Highest Rated' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key as CategoryKey)}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: category === cat.key ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
              color: category === cat.key ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>#</th>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>Player</th>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>Club</th>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>Pos</th>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700, textAlign: 'center' }}>
                {category === 'goals' ? 'Goals' : category === 'assists' ? 'Assists' : category === 'tackles' ? 'Tackles/g' : 'WhoScored'}
              </th>
              <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700, textAlign: 'right' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, idx) => (
              <tr
                key={`${p.name}-${idx}`}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '0.55rem 0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '0.55rem 0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {p.name}
                </td>
                <td style={{ padding: '0.55rem 0.8rem', color: p.is_home ? '#38bdf8' : '#f87171', fontWeight: 700 }}>
                  {p.team || (p.is_home ? homeName : awayName)}
                </td>
                <td style={{ padding: '0.55rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {p.pos}
                </td>
                <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {category === 'goals'
                    ? `${p.goals ?? 0} ⚽`
                    : category === 'assists'
                    ? `${p.assists ?? 0} 🎯`
                    : category === 'tackles'
                    ? `${p.tackles ?? 1.5} 🛡️`
                    : `⭐ ${p.rating.toFixed(2)}`}
                </td>
                <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', fontWeight: 800, color: '#4ade80' }}>
                  ⭐ {p.rating.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}