'use client';

import React, { useEffect, useState } from 'react';
import { Match } from '@/lib/types';
import { fetchLiveMatches } from '@/lib/api';
import Link from 'next/link';

function parseUtcDate(utc_date: string): Date {
  if (!utc_date) return new Date();
  let s = String(utc_date).trim();
  if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) {
    s = s.replace(' ', 'T') + 'Z';
  } else {
    s = s.replace(' ', 'T');
  }
  return new Date(s);
}

export default function LiveScoreTicker() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);

  useEffect(() => {
    const loadLive = () => {
      fetchLiveMatches()
        .then((data) => setLiveMatches(data))
        .catch(() => setLiveMatches([]));
    };
    loadLive();
    const interval = setInterval(loadLive, 5000);
    return () => clearInterval(interval);
  }, []);

  if (liveMatches.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(239,68,68,0.14) 0%, rgba(220,38,38,0.06) 100%)',
      borderBottom: '1px solid rgba(239,68,68,0.25)',
      padding: '0.5rem 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Live badge — links to /live page */}
        <Link
          href="/live"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            flexShrink: 0, textDecoration: 'none',
          }}
        >
          <span className="status-badge status-live" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
            ● LIVE ({liveMatches.length})
          </span>
        </Link>

        {/* Scrollable score chips */}
        <div style={{
          display: 'flex', gap: '0.6rem',
          overflowX: 'auto', paddingBottom: '0.1rem',
          scrollbarWidth: 'none', flex: 1,
        }}>
          {liveMatches.map((m) => {
            const isHT = m.status === 'HALFTIME' || m.status === 'PAUSED';
            const startMs = parseUtcDate(m.utc_date).getTime();
            const elapsed = Math.max(1, Math.floor((Date.now() - startMs) / 60000));
            const minuteText = isHT ? 'HT' : elapsed <= 45 ? `${elapsed}'` : elapsed <= 60 ? 'HT' : elapsed <= 105 ? `${Math.min(90, 45 + (elapsed - 60))}'` : "90+'";

            return (
              <Link
                key={m.id}
                href="/live"
                style={{ textDecoration: 'none', flexShrink: 0 }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  fontSize: '0.82rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}>
                  <span style={{
                    display: 'inline-block', width: '5px', height: '5px',
                    borderRadius: '50%', background: isHT ? 'var(--accent-amber)' : '#ef4444',
                    animation: 'pulseBadge 1.5s infinite'
                  }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.home_team.short_name || m.home_team.name}
                  </span>
                  <span style={{
                    fontWeight: 900, color: 'var(--accent-red)',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                    background: 'rgba(239,68,68,0.12)',
                    padding: '0.05rem 0.4rem', borderRadius: '6px',
                  }}>
                    {m.home_score ?? 0} – {m.away_score ?? 0}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.away_team.short_name || m.away_team.name}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: isHT ? 'var(--accent-amber)' : 'var(--accent-red)',
                    fontWeight: 800,
                    background: isHT ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '4px',
                  }}>
                    {minuteText}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All link */}
        <Link
          href="/live"
          style={{
            fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--accent-red)', flexShrink: 0,
            whiteSpace: 'nowrap', textDecoration: 'none',
            opacity: 0.9,
          }}
        >
          View All →
        </Link>
      </div>
    </div>
  );
}
