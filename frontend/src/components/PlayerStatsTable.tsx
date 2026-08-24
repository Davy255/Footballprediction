'use client';

import React, { useState, useMemo } from 'react';
import { Player, LineupData, resolveTeamLineup } from './TacticalPitch';

interface PlayerStatsTableProps {
  lineupData?: LineupData;
  homeName: string;
  awayName: string;
}

type CategoryKey = 'goals' | 'assists' | 'tackles' | 'rating';

export default function PlayerStatsTable({ lineupData, homeName, awayName }: PlayerStatsTableProps) {
  const [category, setCategory] = useState<CategoryKey>('goals');

  const homeLineup = useMemo(() => {
    if (lineupData?.home?.starting_xi && lineupData.home.starting_xi.length > 0) return lineupData.home;
    return resolveTeamLineup(homeName, '4-2-3-1', true);
  }, [lineupData, homeName]);

  const awayLineup = useMemo(() => {
    if (lineupData?.away?.starting_xi && lineupData.away.starting_xi.length > 0) return lineupData.away;
    return resolveTeamLineup(awayName, '4-3-3', false);
  }, [lineupData, awayName]);

  const allPlayers = useMemo(() => {
    const list: Player[] = [];
    homeLineup.starting_xi.forEach(p => list.push({ ...p, team: homeName, is_home: true }));
    awayLineup.starting_xi.forEach(p => list.push({ ...p, team: awayName, is_home: false }));
    return list;
  }, [homeLineup, awayLineup, homeName, awayName]);

  const list = useMemo(() => {
    const sorted = [...allPlayers];
    if (category === 'goals') {
      return sorted.sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0) || b.rating - a.rating).slice(0, 6);
    } else if (category === 'assists') {
      return sorted.sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0) || (b.key_passes ?? 0) - (a.key_passes ?? 0) || b.rating - a.rating).slice(0, 6);
    } else if (category === 'tackles') {
      return sorted.sort((a, b) => (b.tackles ?? 0) - (a.tackles ?? 0) || b.rating - a.rating).slice(0, 6);
    } else {
      return sorted.sort((a, b) => b.rating - a.rating).slice(0, 6);
    }
  }, [allPlayers, category]);

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
            type="button"
            onClick={() => setCategory(cat.key as CategoryKey)}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.80rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: category === cat.key ? 'var(--accent-blue, #2563eb)' : 'rgba(255,255,255,0.06)',
              color: category === cat.key ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'var(--bg-card, #111827)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted, #64748b)' }}>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700 }}>#</th>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700 }}>Player</th>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700 }}>Club</th>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700 }}>Pos</th>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700, textAlign: 'center' }}>
                {category === 'goals' ? 'Goals' : category === 'assists' ? 'Assists' : category === 'tackles' ? 'Tackles/match' : 'Key Impact'}
              </th>
              <th style={{ padding: '0.7rem 0.9rem', fontWeight: 700, textAlign: 'right' }}>Rating</th>
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
                <td style={{ padding: '0.65rem 0.9rem', fontWeight: 800, color: 'var(--text-muted, #64748b)' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '0.65rem 0.9rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: p.is_home ? 'rgba(56,189,248,0.15)' : 'rgba(239,68,68,0.15)',
                      color: p.is_home ? '#38bdf8' : '#f87171',
                    }}>
                      #{p.number}
                    </span>
                    <span>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.65rem 0.9rem', color: p.is_home ? '#38bdf8' : '#f87171', fontWeight: 700 }}>
                  {p.team || (p.is_home ? homeName : awayName)}
                </td>
                <td style={{ padding: '0.65rem 0.9rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                  {p.pos}
                </td>
                <td style={{ padding: '0.65rem 0.9rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  {category === 'goals'
                    ? `${p.goals ?? 0} ⚽`
                    : category === 'assists'
                    ? `${p.assists ?? 0} 🎯`
                    : category === 'tackles'
                    ? `${p.tackles ?? 1.5} 🛡️`
                    : `${p.key_passes ?? 1.2} key passes/g`}
                </td>
                <td style={{ padding: '0.65rem 0.9rem', textAlign: 'right', fontWeight: 800, color: '#4ade80' }}>
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