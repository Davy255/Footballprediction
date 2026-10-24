'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Match } from '@/lib/types';
import AdBanner from '@/components/AdBanner';
import { fetchLiveMatches } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';

const REFRESH_INTERVAL = 15; // 15 seconds optimal live polling

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

  useEffect(() => {
    setCountdown(REFRESH_INTERVAL);
  }, [lastUpdated]);

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
            <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
              Real-time score updates across active European matches
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              margin: '0 0 0.35rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Match Centre: Real-Time Scores
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {matchesCount > 0
              ? `${matchesCount} match${matchesCount === 1 ? '' : 'es'} currently in action with live score tracking`
              : 'Standby for kickoff across European fixtures'}
          </p>
        </div>

        {/* Polling indicator & manual refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.8rem',
              borderRadius: '10px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: `conic-gradient(#ef4444 ${pct}%, rgba(255,255,255,0.1) 0%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--bg-card)' }} />
            </div>
            <span>{refreshing ? 'Syncing...' : `Next check: ${countdown}s`}</span>
          </div>

          <button
            type="button"
            onClick={onManualRefresh}
            disabled={refreshing}
            style={{
              background: refreshing ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)',
              border: '1px solid var(--accent-red-border)',
              color: '#f87171',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }}>
              🔄
            </span>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
});

interface LiveClientProps {
  initialMatches: Match[];
}

export default function LiveClient({ initialMatches = [] }: LiveClientProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [isTabActive, setIsTabActive] = useState<boolean>(true);

  const requestSeqRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = document.visibilityState === 'visible';
      setIsTabActive(active);
      if (active) {
        load(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [load]);

  useEffect(() => {
    if (!isTabActive) return;

    const interval = setInterval(() => {
      load(false);
    }, REFRESH_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [load, isTabActive]);

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
    <div>
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

      {/* Responsive Content Ad Placement (Below Live Content, Above Footer) */}
      <AdBanner slot="live-scores-bottom" />

      {/* Exploration Footer */}
      <footer
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
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
            href="/stats"
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
