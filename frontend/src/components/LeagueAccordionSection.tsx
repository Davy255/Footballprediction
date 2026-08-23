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
    <div className="footystats-league-card">
      {/* FootyStats Style League Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="footystats-league-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          {/* League Flag */}
          <span style={{ fontSize: '1.15rem', display: 'inline-flex', alignItems: 'center' }}>
            {league.flag || '⚽'}
          </span>

          {/* League Title */}
          <span className="footystats-league-title">
            {league.country ? `${league.country} - ` : ''}{league.name}
          </span>

          {/* Favorite star */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1rem', color: isFavorite ? '#fbbf24' : 'var(--text-muted)',
              padding: 0, lineHeight: 1, transition: 'color 0.2s ease', marginLeft: '0.25rem',
            }}
            title={isFavorite ? 'Remove favorite' : 'Add to favorite leagues'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {liveCount > 0 && (
            <span className="status-badge status-live" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
              ● {liveCount} LIVE
            </span>
          )}

          <span className="footystats-hide-btn">
            {isExpanded ? '▲ Hide' : '▼ Show'} ({matches.length})
          </span>
        </div>
      </div>

      {/* Column Sub-Header Bar (FootyStats layout) */}
      {isExpanded && (
        <div className="footystats-sub-header">
          <div className="fs-sub-home">
            <span>Home</span>
            <span>Form</span>
          </div>
          <div className="fs-sub-center"></div>
          <div className="fs-sub-away">
            <span>Form</span>
            <span>Away</span>
          </div>
        </div>
      )}

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
