'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { submitPrediction } from '@/lib/api';

interface PredictionModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

type Outcome = 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';

function ScoreStepper({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card-hover)',
            cursor: 'pointer', fontSize: '1.1rem',
            color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, flexShrink: 0,
          }}
        >
          −
        </button>
        <div style={{
          width: '52px', height: '52px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900,
          fontFamily: 'Outfit, sans-serif',
          borderRadius: '12px',
          border: '2px solid var(--border-glow)',
          background: 'var(--bg-card-hover)',
          color: 'var(--text-primary)',
          userSelect: 'none',
        }}>
          {value}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(15, value + 1))}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card-hover)',
            cursor: 'pointer', fontSize: '1.1rem',
            color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, flexShrink: 0,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PredictionModal({ match, onClose, onSuccess }: PredictionModalProps) {
  const [outcome, setOutcome] = useState<Outcome>('HOME_TEAM');
  const [includeScore, setIncludeScore] = useState<boolean>(false);
  const [homeScore, setHomeScore] = useState<number>(match.ai_predicted_home ?? 1);
  const [awayScore, setAwayScore] = useState<number>(match.ai_predicted_away ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeName = match.home_team.short_name || match.home_team.name;
  const awayName = match.away_team.short_name || match.away_team.name;

  const OUTCOMES: { key: Outcome; label: string; sublabel: string; color: string }[] = [
    { key: 'HOME_TEAM', label: homeName, sublabel: 'Home Win', color: 'var(--accent-green)' },
    { key: 'DRAW',      label: 'Draw',   sublabel: '(X)',      color: 'var(--accent-amber)' },
    { key: 'AWAY_TEAM', label: awayName, sublabel: 'Away Win', color: 'var(--accent-blue)'  },
  ];

  const handleHomeScoreChange = (newHome: number) => {
    setHomeScore(newHome);
    setIncludeScore(true);
    setOutcome(newHome > awayScore ? 'HOME_TEAM' : awayScore > newHome ? 'AWAY_TEAM' : 'DRAW');
  };

  const handleAwayScoreChange = (newAway: number) => {
    setAwayScore(newAway);
    setIncludeScore(true);
    setOutcome(homeScore > newAway ? 'HOME_TEAM' : newAway > homeScore ? 'AWAY_TEAM' : 'DRAW');
  };

  const handleOutcomeClick = (key: Outcome) => {
    setOutcome(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalOutcome = outcome;
    if (includeScore) {
      if (homeScore > awayScore) finalOutcome = 'HOME_TEAM';
      else if (awayScore > homeScore) finalOutcome = 'AWAY_TEAM';
      else if (homeScore === awayScore) finalOutcome = 'DRAW';
    }

    try {
      await submitPrediction({
        match_id: match.id,
        predicted_outcome: finalOutcome,
        predicted_home_score: includeScore ? homeScore : undefined,
        predicted_away_score: includeScore ? awayScore : undefined,
      });
      onSuccess();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('⚠️ Connection error. Please check your internet connection or re-login.');
      } else {
        setError(msg || 'Failed to submit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Prediction Modal"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px', width: '30px', height: '30px',
            cursor: 'pointer', fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.3rem' }}>
          🎯 Submit Prediction
        </h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.2rem', fontWeight: 600 }}>
          {homeName} vs {awayName}
        </p>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: '1.5rem' }}>
          {match.league.flag} {match.league.name} &bull;{' '}
          {new Date(match.utc_date).toLocaleDateString(undefined, {
            weekday: 'short', day: 'numeric', month: 'short',
          })}
        </p>

        {/* AI Suggestion */}
        {match.ai_home_prob != null && (
          <div style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.14)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            <span>📊</span>
            <span>
              <strong style={{ color: 'var(--accent-blue)' }}>Match Forecast:</strong>{' '}
              {match.ai_home_prob >= (match.ai_away_prob ?? 0) && match.ai_home_prob >= (match.ai_draw_prob ?? 0)
                ? `${homeName} Win`
                : (match.ai_away_prob ?? 0) >= (match.ai_draw_prob ?? 0)
                ? `${awayName} Win`
                : 'Draw'
              }
              {' '}&bull; Projected score: {match.ai_predicted_home ?? 1}–{match.ai_predicted_away ?? 0}
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ── STEP 1: OUTCOME ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.65rem',
            }}>
              Step 1 — Select Result
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              {OUTCOMES.map(({ key, label, sublabel, color }) => {
                const selected = outcome === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleOutcomeClick(key)}
                    style={{
                      padding: '0.75rem 0.25rem',
                      borderRadius: '12px',
                      border: `2px solid ${selected ? color : 'var(--border-color)'}`,
                      background: selected ? `${color}20` : 'var(--bg-card-hover)',
                      color: selected ? color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.1rem',
                      boxShadow: selected ? `0 0 14px ${color}30` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.2, wordBreak: 'break-word', textAlign: 'center' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      {sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── STEP 2: SCORE ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.65rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>Step 2 — Exact Scoreline</span>
              <span style={{ color: 'var(--accent-amber)', fontSize: '0.72rem' }}>+5 bonus pts</span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '1.5rem',
              background: 'var(--bg-card-hover)',
              borderRadius: '14px',
              padding: '1rem',
              border: '1px solid var(--border-color)',
            }}>
              <ScoreStepper label={homeName} value={homeScore} onChange={handleHomeScoreChange} />
              <span style={{
                fontSize: '2rem', fontWeight: 900,
                color: 'var(--text-muted)',
                fontFamily: 'Outfit, sans-serif',
              }}>:</span>
              <ScoreStepper label={awayName} value={awayScore} onChange={handleAwayScoreChange} />
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.4rem' }}>
              Score is optional but earns bonus points if exact
            </p>
          </div>

          {/* ── CONFIRM SUMMARY ── */}
          <div style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
            color: 'var(--accent-green)',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            Your pick: {OUTCOMES.find(o => o.key === outcome)?.label}{' '}
            ({OUTCOMES.find(o => o.key === outcome)?.sublabel})
            {includeScore ? ` • Exact Score: ${homeScore}–${awayScore}` : ''}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent"
              style={{ flex: 2 }}
            >
              {loading ? (
                <><span className="spinner" /> Submitting...</>
              ) : (
                '🎯 Confirm Prediction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
