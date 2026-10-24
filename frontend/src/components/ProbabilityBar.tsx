'use client';

import React from 'react';

export interface ProbabilityBarProps {
  homeProb: number | null | undefined;
  drawProb: number | null | undefined;
  awayProb: number | null | undefined;
  homeTeamName?: string;
  awayTeamName?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProbabilityBar({
  homeProb,
  drawProb,
  awayProb,
  homeTeamName,
  awayTeamName,
  showLabels = true,
  size = 'md',
  className = '',
}: ProbabilityBarProps) {
  // Validate whether real probabilities exist and are valid positive numbers
  const hasValidProbs =
    homeProb != null &&
    drawProb != null &&
    awayProb != null &&
    !isNaN(homeProb) &&
    !isNaN(drawProb) &&
    !isNaN(awayProb) &&
    homeProb >= 0 &&
    drawProb >= 0 &&
    awayProb >= 0 &&
    homeProb + drawProb + awayProb > 0;

  if (!hasValidProbs) {
    return (
      <div
        className={`fp-prob-pending ${className}`}
        style={{
          background: 'var(--color-brand-emerald-subtle, rgba(16, 185, 129, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          textAlign: 'center',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}
      >
        <span aria-hidden="true">⏳</span>
        <span>Probability calculation scheduled prior to kickoff</span>
      </div>
    );
  }

  // Calculate proportional segment widths while preserving reported integer percentages
  const sum = (homeProb as number) + (drawProb as number) + (awayProb as number);
  const homeWidth = ((homeProb as number) / sum) * 100;
  const drawWidth = ((drawProb as number) / sum) * 100;
  const awayWidth = ((awayProb as number) / sum) * 100;

  const barHeight = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';
  const labelFontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.86rem' : '0.78rem';

  const homeLabel = homeTeamName ? `${homeTeamName} Win` : 'Home Win';
  const awayLabel = awayTeamName ? `${awayTeamName} Win` : 'Away Win';

  return (
    <div className={`fp-probability-container ${className}`} style={{ width: '100%' }}>
      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: labelFontSize,
            fontWeight: 700,
            marginBottom: '0.35rem',
            gap: '0.25rem',
          }}
        >
          {/* Home Win Label */}
          <span
            style={{
              color: 'var(--prob-home, #10B981)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={`${homeLabel}: ${homeProb}%`}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--prob-home, #10B981)',
                display: 'inline-block',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span>{homeLabel}</span>
            <strong style={{ fontWeight: 800 }}>({homeProb}%)</strong>
          </span>

          {/* Draw Label */}
          <span
            style={{
              color: 'var(--prob-draw, #F59E0B)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title={`Draw: ${drawProb}%`}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--prob-draw, #F59E0B)',
                display: 'inline-block',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span>Draw</span>
            <strong style={{ fontWeight: 800 }}>({drawProb}%)</strong>
          </span>

          {/* Away Win Label */}
          <span
            style={{
              color: 'var(--prob-away, #3B82F6)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              justifyContent: 'flex-end',
            }}
            title={`${awayLabel}: ${awayProb}%`}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--prob-away, #3B82F6)',
                display: 'inline-block',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span>{awayLabel}</span>
            <strong style={{ fontWeight: 800 }}>({awayProb}%)</strong>
          </span>
        </div>
      )}

      {/* Segmented Horizontal Bar */}
      <div
        role="progressbar"
        aria-label={`Win probabilities: ${homeLabel} ${homeProb}%, Draw ${drawProb}%, ${awayLabel} ${awayProb}%`}
        aria-valuenow={homeProb as number}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          display: 'flex',
          height: barHeight,
          borderRadius: '999px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
          width: '100%',
        }}
      >
        <div
          style={{
            width: `${homeWidth}%`,
            background: 'var(--prob-home, #10B981)',
            transition: 'width 0.3s ease',
          }}
          title={`${homeLabel}: ${homeProb}%`}
        />
        <div
          style={{
            width: `${drawWidth}%`,
            background: 'var(--prob-draw, #F59E0B)',
            transition: 'width 0.3s ease',
          }}
          title={`Draw: ${drawProb}%`}
        />
        <div
          style={{
            width: `${awayWidth}%`,
            background: 'var(--prob-away, #3B82F6)',
            transition: 'width 0.3s ease',
          }}
          title={`${awayLabel}: ${awayProb}%`}
        />
      </div>
    </div>
  );
}
