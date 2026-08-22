'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Match } from '@/lib/types';
import { fetchLiveMatches } from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';

const REFRESH_INTERVAL = 5; // seconds

function CountdownBar({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100;
  return (
    <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', width: '80px' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'var(--accent-red)',
        borderRadius: '3px',
        transition: 'width 1s linear',
      }} />
    </div>
  );
}

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await fetchLiveMatches();
      setMatches(data);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch {
      // silently keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => load(true), REFRESH_INTERVAL * 1000);
    return () => clearInterval(interval);
  }, [load]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const groupedByLeague = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.league.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.05) 100%)',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
        padding: '2rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <span className="status-badge status-live" style={{ fontSize: '0.78rem' }}>
                  ● LIVE
                </span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>Live Matches</h1>
                {matches.length > 0 && (
                  <span style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: 'var(--accent-red)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                  }}>
                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Real-time scores and live predictions — auto-refreshes every {REFRESH_INTERVAL}s
              </p>
            </div>

            {/* Refresh Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {lastUpdated && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Updated {lastUpdated.toLocaleTimeString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Next in {countdown}s</span>
                    <CountdownBar seconds={countdown} total={REFRESH_INTERVAL} />
                  </div>
                </div>
              )}
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Live Matches Right Now</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              There are no matches currently in play. Check back during match times or browse upcoming fixtures.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/fixtures" className="btn btn-primary">Browse Fixtures</a>
              <a href="/" className="btn btn-secondary">Go Home</a>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2rem' }}>
              This page auto-refreshes every {REFRESH_INTERVAL} seconds
            </p>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
              <span>⚡</span>
              <span>
                <strong>Live Predictions Active</strong> — You can still submit predictions on matches currently in play.
                Scores update automatically every {REFRESH_INTERVAL} seconds.
              </span>
            </div>

            {/* Matches grouped by League Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {Object.values(groupedByLeague).map((leagueMatches) => (
                <LeagueAccordionSection
                  key={leagueMatches[0].league.id || leagueMatches[0].league.code}
                  league={leagueMatches[0].league}
                  matches={leagueMatches}
                  onPredictionChange={() => load(false)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
