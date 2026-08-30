'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Match } from '@/lib/types';
import { fetchLiveMatches } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';
import Breadcrumbs from '@/components/Breadcrumbs';

const REFRESH_INTERVAL = 15; // 15 seconds optimal live polling

// Compare match arrays to prevent re-rendering when data has not changed
function hasMatchesChanged(prev: Match[], next: Match[]): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    const p = prev[i];
    const n = next[i];
    if (
      p.id !== n.id ||
      p.status !== n.status ||
      p.home_score !== n.home_score ||
      p.away_score !== n.away_score ||
      p.home_score_ht !== n.home_score_ht ||
      p.away_score_ht !== n.away_score_ht ||
      p.utc_date !== n.utc_date
    ) {
      return true;
    }
  }
  return false;
}

// ──────────────────────────────────────────────────────────────
// Isolated Countdown & Controls Header Component
// Manages its own 1-second countdown ticker so the entire match
// list does NOT re-render every second (eliminates screen shaking)
// ──────────────────────────────────────────────────────────────
interface HeaderControlsProps {
  lastUpdated: Date | null;
  refreshing: boolean;
  isTabActive: boolean;
  onManualRefresh: () => void;
  matchesCount: number;
}

const LiveCountdownHeader = React.memo(function LiveCountdownHeader({
  lastUpdated,
  refreshing,
  isTabActive,
  onManualRefresh,
  matchesCount,
}: HeaderControlsProps) {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  // Reset countdown whenever a fresh update arrives
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL);
  }, [lastUpdated]);

  // Localized 1-second ticker that ONLY triggers re-renders inside this header
  useEffect(() => {
    if (!isTabActive) return;
    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [isTabActive]);

  const pct = Math.max(0, Math.min(100, (countdown / REFRESH_INTERVAL) * 100));

  return (
    <div
      style={{
        background: 'var(--gradient-hero)',
        border: '1px solid var(--accent-red-border)',
        borderRadius: '16px',
        padding: '1.75rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                background: 'rgba(239,68,68,0.2)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.4)',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              LIVE IN-PLAY
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                fontWeight: 900,
                margin: 0,
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Live Match Centre 🔴
            </h1>
            {matchesCount > 0 && (
              <span
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.25)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                }}
              >
                {matchesCount} in-play
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
            Real-time in-play scorelines, tactical match centers, and pre-match model baseline projections — auto-refreshes every {REFRESH_INTERVAL}s.
          </p>
        </div>

        {/* Refresh Controls & Stable Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastUpdated && (
            <div style={{ textAlign: 'right', minWidth: '130px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                  {isTabActive ? `Next in ${countdown}s` : 'Paused (tab hidden)'}
                </span>
                {isTabActive && (
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', width: '60px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: '#ef4444',
                        borderRadius: '3px',
                        transition: 'width 1s linear',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 700,
              minWidth: '105px', // Stable fixed width prevents horizontal layout jumping
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// ──────────────────────────────────────────────────────────────
// Main Live Page Component
// ──────────────────────────────────────────────────────────────
export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);

  const requestSeqRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Main Live Data Fetcher with race condition prevention
  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    const seq = ++requestSeqRef.current;

    try {
      const data = await fetchLiveMatches();
      if (!isMountedRef.current || seq !== requestSeqRef.current) return;

      const cleanData = Array.isArray(data) ? data : [];
      setMatches((prev) => (hasMatchesChanged(prev, cleanData) ? cleanData : prev));
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Live scores background refresh failed, retaining previous snapshot.');
    } finally {
      if (isMountedRef.current && seq === requestSeqRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Tab visibility tracker: pause polling if user minimizes or navigates away
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = document.visibilityState === 'visible';
      setIsTabActive(active);
      if (active) {
        load(true); // immediately refresh when user returns to tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [load]);

  // Live Auto-refresh interval (active only when tab is visible)
  useEffect(() => {
    if (!isTabActive) return;

    const interval = setInterval(() => {
      load(false); // Quiet background refresh without flashing button
    }, REFRESH_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [load, isTabActive]);

  // Stable deterministic sorting:
  // 1. Matches sorted by kickoff time + ID
  // 2. League sections sorted alphabetically by league name
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const timeA = new Date(a.utc_date).getTime();
      const timeB = new Date(b.utc_date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.id - b.id;
    });
  }, [matches]);

  const groupedByLeague = useMemo(() => {
    const map: Record<string, { league: any; matches: Match[] }> = {};
    sortedMatches.forEach((m) => {
      const key = String(m.league?.id || m.league?.code || m.league?.name || 'OTHER');
      if (!map[key]) {
        map[key] = {
          league: m.league,
          matches: [],
        };
      }
      map[key].matches.push(m);
    });
    return Object.values(map).sort((a, b) => {
      const nameA = a.league?.name || '';
      const nameB = b.league?.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [sortedMatches]);

  const handleManualRefresh = useCallback(() => {
    load(true);
  }, [load]);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Live Match Centre' },
        ]}
      />

      {/* Page Header (Isolated countdown avoids full list re-renders) */}
      <LiveCountdownHeader
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        isTabActive={isTabActive}
        onManualRefresh={handleManualRefresh}
        matchesCount={matches.length}
      />

      {/* Live Match List */}
      <div>
        {loading && matches.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: '180px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              background: 'var(--bg-card)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid var(--accent-red-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1rem auto',
              }}
            >
              📡
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No Live Matches In-Play Right Now
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              There are currently no active fixtures in-play across supported European leagues. In-play match centers will appear automatically as matches kick off.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/football-predictions-today" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}>
                🎯 Today&apos;s Match Predictions
              </Link>
              <Link href="/fixtures" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}>
                📅 View Upcoming Fixtures
              </Link>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}
              >
                🔄 Check Again
              </button>
            </div>
          </div>
        ) : (
          <div>
            {groupedByLeague.map(({ league, matches: leagueMatches }) => (
              <LeagueAccordionSection
                key={league?.id ? `league-${league.id}` : `league-${league?.code || league?.name || 'unknown'}`}
                league={league}
                matches={leagueMatches}
                onPredictionChange={handleManualRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exploration Footer */}
      <footer
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginTop: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}
      >
        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          Explore Full Prediction Hubs:
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link
            href="/football-predictions-today"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#86efac',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🎯 Today&apos;s Predictions
          </Link>
          <Link
            href="/accuracy"
            style={{
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.25)',
              color: '#7dd3fc',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📊 Model Accuracy Dashboard
          </Link>
          <Link
            href="/fixtures"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📅 All Fixtures
          </Link>
          <Link
            href="/leagues"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#93c5fd',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 Leagues &amp; Standings
          </Link>
        </div>
      </footer>
    </div>
  );
}
