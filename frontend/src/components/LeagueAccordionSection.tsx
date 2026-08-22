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

  return (
    <div style={{
      marginBottom: '1.25rem',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Competition Header (Sofascore style) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          background: 'var(--bg-card-hover)',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background 0.15s ease',
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
              fontSize: '1rem', color: isFavorite ? '#f59e0b' : 'var(--text-muted)',
              padding: 0, lineHeight: 1,
            }}
            title={isFavorite ? 'Remove favorite' : 'Add to favorite leagues'}
          >
            {isFavorite ? '★' : '☆'}
          </button>

          {/* League Flag & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>{league.flag || '⚽'}</span>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {league.country ? `${league.country} - ` : ''}{league.name}
            </span>
          </div>

          {/* Mini analytics icon */}
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-green)', opacity: 0.85 }} title="Full League Analytics Available">
            📊
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live indicator badge */}
          {liveCount > 0 && (
            <span className="status-badge status-live" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
              ● {liveCount} LIVE
            </span>
          )}

          {/* Match count */}
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
            background: 'var(--bg-card-hover)', padding: '0.2rem 0.55rem', borderRadius: '8px',
          }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>

          {/* Chevron */}
          <span style={{
            fontSize: '0.8rem', color: 'var(--text-muted)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Matches List */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {matches.map((match, idx) => (
            <MatchCard
              key={match.id}
              match={match}
              onPredictionChange={onPredictionChange}
              isLast={idx === matches.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
