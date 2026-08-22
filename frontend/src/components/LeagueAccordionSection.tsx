'use client';

import React, { useState } from 'react';
import { Match, League } from '@/lib/types';
import MatchCard from './MatchCard';

interface Props {
  league: League;
  matches: Match[];
  onPredictionChange?: () => void;
  defaultExpanded?: boolean;
}

// Sofascore & FootyStats inspired league accent palettes
const LEAGUE_THEMES: Record<string, { bg: string; border: string; accent: string; flagBg: string }> = {
  PL:  { bg: 'linear-gradient(135deg, #38003c 0%, #200024 100%)', border: '#00ff85', accent: '#00ff85', flagBg: 'rgba(0,255,133,0.15)' },
  PD:  { bg: 'linear-gradient(135deg, #991b1b 0%, #5b0d0d 100%)', border: '#fbbf24', accent: '#fbbf24', flagBg: 'rgba(251,191,36,0.15)' },
  SA:  { bg: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)', border: '#38bdf8', accent: '#38bdf8', flagBg: 'rgba(56,189,248,0.15)' },
  BL1: { bg: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', border: '#fbbf24', accent: '#fbbf24', flagBg: 'rgba(251,191,36,0.15)' },
  FL1: { bg: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', border: '#a3e635', accent: '#a3e635', flagBg: 'rgba(163,230,53,0.15)' },
  DED: { bg: 'linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)', border: '#fb923c', accent: '#fb923c', flagBg: 'rgba(251,146,60,0.15)' },
  PPL: { bg: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', border: '#facc15', accent: '#facc15', flagBg: 'rgba(250,204,21,0.15)' },
  BSA: { bg: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)', border: '#eab308', accent: '#eab308', flagBg: 'rgba(234,179,8,0.15)' },
  CL:  { bg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '#67e8f9', accent: '#67e8f9', flagBg: 'rgba(103,232,249,0.15)' },
  ELC: { bg: 'linear-gradient(135deg, #3730a3 0%, #1e1b4b 100%)', border: '#f43f5e', accent: '#f43f5e', flagBg: 'rgba(244,63,94,0.15)' },
  WC:  { bg: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)', border: '#fbbf24', accent: '#fbbf24', flagBg: 'rgba(251,191,36,0.15)' },
  EC:  { bg: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)', border: '#38bdf8', accent: '#38bdf8', flagBg: 'rgba(56,189,248,0.15)' },
};

const DEFAULT_THEME = {
  bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  border: '#3b82f6',
  accent: '#60a5fa',
  flagBg: 'rgba(59,130,246,0.15)',
};

export default function LeagueAccordionSection({
  league,
  matches,
  onPredictionChange,
  defaultExpanded = true,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFavorite, setIsFavorite] = useState(false);

  if (matches.length === 0) return null;

  const liveCount = matches.filter((m) =>
    ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status)
  ).length;

  const theme = LEAGUE_THEMES[league.code] || DEFAULT_THEME;

  return (
    <div style={{
      marginBottom: '1.5rem',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Competition Colored Header Strip */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          background: theme.bg,
          borderLeft: `6px solid ${theme.border}`,
          borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.08)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Favorite star */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.1rem', color: isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.4)',
              padding: 0, lineHeight: 1, transition: 'color 0.2s ease',
            }}
            title={isFavorite ? 'Remove favorite' : 'Add to favorite leagues'}
          >
            {isFavorite ? '★' : '☆'}
          </button>

          {/* League Flag & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              fontSize: '1.2rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.12)',
            }}>
              {league.flag || '⚽'}
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff', letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              {league.country ? `${league.country} - ` : ''}{league.name}
            </span>
          </div>

          {/* Mini analytics badge */}
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, color: theme.accent,
            background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '12px',
            border: `1px solid ${theme.border}`, display: 'inline-flex', alignItems: 'center', gap: '3px',
          }}>
            <span>📊</span> Analytics
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live indicator badge */}
          {liveCount > 0 && (
            <span className="status-badge status-live" style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>
              ● {liveCount} LIVE
            </span>
          )}

          {/* Match count */}
          <span style={{
            fontSize: '0.78rem', fontWeight: 800, color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.7rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>

          {/* Chevron */}
          <span style={{
            fontSize: '0.85rem', color: '#ffffff',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease', opacity: 0.85,
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Matches List with Zebra Striping */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {matches.map((match, idx) => (
            <MatchCard
              key={match.id}
              match={match}
              onPredictionChange={onPredictionChange}
              isLast={idx === matches.length - 1}
              isEven={idx % 2 === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
