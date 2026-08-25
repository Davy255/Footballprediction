'use client';

import React from 'react';
import Link from 'next/link';
import { StandingTableItem } from '@/lib/types';
import { getTeamUrl } from '@/lib/slugs';

interface LeagueTableProps {
  table: StandingTableItem[];
  leagueName: string;
}

export default function LeagueTable({ table, leagueName }: LeagueTableProps) {
  if (!table || table.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        No standings data available.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1.1rem' }}>
        🏆 {leagueName} Standings
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
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
            {table.map((item) => (
              <tr key={item.team.id}>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: item.position <= 4 ? 'var(--accent-green)' : item.position >= table.length - 3 ? 'var(--accent-red)' : 'var(--text-secondary)'
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
                      color: 'inherit',
                      fontWeight: 600,
                    }}
                  >
                    {item.team.crest && (
                      <img src={item.team.crest} alt={item.team.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600 }}>{item.team.name}</span>
                  </Link>
                </td>
                <td style={{ textAlign: 'center' }}>{item.playedGames}</td>
                <td style={{ textAlign: 'center' }}>{item.won}</td>
                <td style={{ textAlign: 'center' }}>{item.draw}</td>
                <td style={{ textAlign: 'center' }}>{item.lost}</td>
                <td style={{ textAlign: 'center' }}>{item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}</td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-blue)' }}>{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
