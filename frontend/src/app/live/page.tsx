'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Match } from '@/lib/types';
import { fetchLiveMatches } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLeagueUrl } from '@/lib/slugs';

const REFRESH_INTERVAL = 15; // 15 seconds optimal live polling

function CountdownBar({ seconds, total }: { seconds: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  return (
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', width: '80px' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: '#ef4444',
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
  const [isTabActive, setIsTabActive] = useState(true);

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await fetchLiveMatches();
      setMatches(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      // silently keep current data on transient network error
      console.warn('Live scores refresh failed, retaining previous snapshot.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        load(true); // immediately refresh when user returns
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [load]);

  // Live Auto-refresh interval (active only when tab is visible)
  useEffect(() => {
    if (!isTabActive) return;

    const interval = setInterval(() => {
      load(true);
    }, REFRESH_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [load, isTabActive]);

  // Countdown ticker
  useEffect(() => {
    if (!isTabActive) return;

    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [isTabActive]);

  // Group live matches by league
  const groupedByLeague = matches.reduce<Record<string, { league: any; matches: Match[] }>>((acc, m) => {
    const key = m.league?.id || m.league?.code || m.league?.name || 'OTHER';
    if (!acc[key]) {
      acc[key] = {
        league: m.league,
        matches: [],
      };
    }
    acc[key].matches.push(m);
    return acc;
  }, {});

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Live Match Centre' },
        ]}
      />

      {/* Page Header */}
      <div style={{
        background: 'var(--gradient-hero)',
        border: '1px solid var(--accent-red-border)',
        borderRadius: '16px',
        padding: '1.75rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{
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
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                LIVE IN-PLAY
              </span>
              <h1 style={{
                fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                fontWeight: 900,
                margin: 0,
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif',
              }}>
                Live Match Centre 🔴
              </h1>
              {matches.length > 0 && (
                <span style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.25)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                }}>
                  {matches.length} in-play
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              Real-time in-play scorelines, tactical match centers, and pre-match model baseline projections — auto-refreshes every {REFRESH_INTERVAL}s.
            </p>
          </div>

          {/* Refresh Controls & Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lastUpdated && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {isTabActive ? `Next in ${countdown}s` : 'Paused (tab hidden)'}
                  </span>
                  {isTabActive && <CountdownBar seconds={countdown} total={REFRESH_INTERVAL} />}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Match List */}
      <div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: '180px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="glass-panel" style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)', border: '1px solid var(--accent-red-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1rem auto'
            }}>
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
                onClick={() => load(true)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}
              >
                🔄 Check Again
              </button>
            </div>
          </div>
        ) : (
          <div>
            {Object.values(groupedByLeague).map(({ league, matches: leagueMatches }) => (
              <LeagueAccordionSection
                key={league?.id || league?.code || league?.name}
                league={league}
                matches={leagueMatches}
                onPredictionChange={load}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exploration Footer */}
      <footer style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '1.5rem',
        marginTop: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}>
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
