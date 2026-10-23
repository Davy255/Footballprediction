'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Match, League } from '@/lib/types';
import { fetchMatches, fetchLeagues } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';
import Link from 'next/link';
import { getLeagueUrl } from '@/lib/slugs';
import AdBanner from '@/components/AdBanner';
import { useSearchParams } from 'next/navigation';

function getMatchDateKey(utc_date: string): { key: string; label: string; isToday: boolean; isTomorrow: boolean } {
  if (!utc_date) return { key: '9999-99-99', label: 'Other Fixtures', isToday: false, isTomorrow: false };
  try {
    let s = String(utc_date).trim();
    if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) s = s.replace(' ', 'T') + 'Z';
    else s = s.replace(' ', 'T');
    const d = new Date(s);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const weekday = d.toLocaleDateString([], { weekday: 'long' });
    const dayMonth = d.toLocaleDateString([], { day: 'numeric', month: 'short' });

    let label = `${weekday}, ${dayMonth}`;
    if (isToday) label = `Today — ${weekday}, ${dayMonth}`;
    else if (isTomorrow) label = `Tomorrow — ${weekday}, ${dayMonth}`;
    else if (isYesterday) label = `Yesterday — ${weekday}, ${dayMonth}`;
    else label = `${weekday}, ${d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return { key: dateKey, label, isToday, isTomorrow };
  } catch {
    return { key: '9999-99-99', label: 'Upcoming Matches', isToday: false, isTomorrow: false };
  }
}

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  leagueGroups: Record<string, { league: League; matches: Match[] }>;
  totalMatches: number;
}

function matchSatisfiesSearch(m: Match, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  const normQ = searchQuery.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hn = (m.home_team?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hsn = (m.home_team?.short_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const an = (m.away_team?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const asn = (m.away_team?.short_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ln = (m.league?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lc = (m.league?.country || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lcode = (m.league?.code || '').toLowerCase();

  const fullFixture = `${hn} ${hsn} vs ${an} ${asn} ${ln} ${lc} ${lcode}`;
  if (fullFixture.includes(normQ)) return true;

  const tokens = normQ.split(/[\s\-_/]+/).filter((t) => t.length > 0 && !['vs', 'v', 'at', 'the'].includes(t));
  if (tokens.length > 1) {
    const allTokensFound = tokens.every(
      (token) =>
        hn.includes(token) ||
        hsn.includes(token) ||
        an.includes(token) ||
        asn.includes(token) ||
        ln.includes(token) ||
        lcode.includes(token)
    );
    if (allTokensFound) return true;
  }

  const ALIAS_MAP: Record<string, string[]> = {
    'man utd': ['manchester united', 'man united'],
    'man city': ['manchester city', 'man city'],
    'barca': ['barcelona'],
    'real': ['real madrid', 'real sociedad', 'real betis'],
    'atleti': ['atletico', 'atletico madrid'],
    'psg': ['paris'],
    'inter': ['internazionale', 'inter'],
    'la liga': ['la liga', 'primera division', 'pd'],
    'champions': ['champions league', 'cl'],
    'prem': ['premier league', 'pl'],
    'epl': ['premier league', 'pl'],
  };

  for (const [alias, targets] of Object.entries(ALIAS_MAP)) {
    if (normQ.includes(alias)) {
      if (targets.some((t) => fullFixture.includes(t))) return true;
    }
  }

  return false;
}

interface FixturesClientProps {
  initialMatches?: Match[];
  initialLeagues?: League[];
}

export default function FixturesClient({ initialMatches = [], initialLeagues = [] }: FixturesClientProps) {
  const searchParams = useSearchParams();
  const initialLeague = searchParams.get('league') || '';

  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [leagues, setLeagues] = useState<League[]>(initialLeagues);
  const [selectedLeague, setSelectedLeague] = useState<string>(initialLeague);
  const initialStatus = searchParams.get('status') || 'SCHEDULED';
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (leagues.length === 0) {
      fetchLeagues()
        .then(setLeagues)
        .catch(() => {});
    }
  }, [leagues.length]);

  const loadMatches = async (showLoading = true) => {
    if (showLoading && matches.length === 0) setLoading(true);
    try {
      const data = await fetchMatches({
        league_code: selectedLeague || undefined,
        status: selectedStatus === 'ALL' ? undefined : (selectedStatus || undefined),
        limit: 300,
      });
      if (Array.isArray(data)) {
        setMatches(data);
      }
    } catch (err) {
      console.error('Error loading fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      // If we already have server pre-rendered matches for the default view, skip first client fetch
      if (initialMatches.length > 0 && !selectedLeague && selectedStatus === 'SCHEDULED') {
        const interval = setInterval(() => {
          loadMatches(false);
        }, 20000);
        return () => clearInterval(interval);
      }
    }

    loadMatches(true);
    const interval = setInterval(() => {
      loadMatches(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedLeague, selectedStatus]);

  // Filter matches based on search query
  const filteredMatches = matches.filter((m) => {
    if (!matchSatisfiesSearch(m, searchQuery)) {
      return false;
    }

    if (selectedStatus === 'SCHEDULED') {
      if (!['SCHEDULED', 'TIMED'].includes(m.status)) return false;
      try {
        const matchTime = new Date(m.utc_date).getTime();
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        return matchTime >= startOfToday;
      } catch {
        return true;
      }
    }

    if (selectedStatus === 'LIVE') {
      return ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME', '1H', '2H', 'HT'].includes(m.status);
    }

    if (selectedStatus === 'FINISHED') {
      return ['FINISHED', 'AWARDED'].includes(m.status);
    }

    return true;
  });

  const groupMatchesByDateAndLeague = (matchesList: Match[]): DateGroup[] => {
    const dateMap: Record<string, DateGroup> = {};

    matchesList.forEach((m) => {
      const dateInfo = getMatchDateKey(m.utc_date);
      if (!dateMap[dateInfo.key]) {
        dateMap[dateInfo.key] = {
          dateKey: dateInfo.key,
          dateLabel: dateInfo.label,
          isToday: dateInfo.isToday,
          isTomorrow: dateInfo.isTomorrow,
          leagueGroups: {},
          totalMatches: 0,
        };
      }

      const leagueCode = m.league?.code || m.league?.name || 'OTHER';
      if (!dateMap[dateInfo.key].leagueGroups[leagueCode]) {
        dateMap[dateInfo.key].leagueGroups[leagueCode] = {
          league: m.league,
          matches: [],
        };
      }

      dateMap[dateInfo.key].leagueGroups[leagueCode].matches.push(m);
      dateMap[dateInfo.key].totalMatches += 1;
    });

    if (selectedStatus === 'FINISHED') {
      return Object.values(dateMap).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    }
    return Object.values(dateMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  };

  const dateGroups = groupMatchesByDateAndLeague(filteredMatches);

  return (
    <div>
      {/* Search & Filter Controls Panel */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, teams, or leagues (e.g. Man City, Arsenal, Real Madrid, Premier League)..."
            style={{
              width: '100%',
              padding: '0.65rem 2.2rem 0.65rem 2.5rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              fontWeight: 500,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Competition Discovery Pills */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quick Links:</span>
          <Link
            href="/football-predictions-today"
            style={{
              background: 'var(--accent-green-bg)',
              border: '1px solid var(--accent-green-border)',
              color: 'var(--accent-green)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🎯 Today&apos;s Predictions
          </Link>
          <Link
            href="/live"
            style={{
              background: 'var(--accent-red-bg)',
              border: '1px solid var(--accent-red-border)',
              color: 'var(--accent-red)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🔴 Live Matches
          </Link>
          <Link
            href="/leagues"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid var(--gradient-hero-border)',
              color: '#93c5fd',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 All Leagues
          </Link>
        </div>

        {/* Match Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'SCHEDULED', label: '📅 Upcoming' },
            { id: 'ALL', label: '🌐 All Matches' },
            { id: 'LIVE', label: '🔴 Live Now' },
            { id: 'FINISHED', label: '✅ Completed Results' },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`btn btn-sm ${selectedStatus === status.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* League Horizontal Pill Filter */}
        {leagues.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
            <button
              onClick={() => setSelectedLeague('')}
              className={`btn btn-sm ${selectedLeague === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 700 }}
            >
              All Competitions
            </button>
            {leagues.map((lg) => (
              <button
                key={lg.code || lg.id}
                onClick={() => setSelectedLeague(selectedLeague === lg.code ? '' : lg.code)}
                className={`btn btn-sm ${selectedLeague === lg.code ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                <span>{lg.flag || '🏆'}</span>
                <span>{lg.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Hero Ad Banner */}
      <AdBanner slot="hero-top" />

      {/* Matches Categorized by Date & Day */}
      {loading && matches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading fixtures...
        </div>
      ) : dateGroups.length > 0 ? (
        <div>
          {dateGroups.map((group, groupIdx) => (
            <React.Fragment key={group.dateKey}>
              <div style={{ marginBottom: '2rem' }}>
                {/* Date Header Ribbon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: group.isToday
                    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)'
                    : 'var(--bg-card-hover)',
                  border: group.isToday ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  marginBottom: '0.85rem',
                  boxShadow: group.isToday ? '0 0 15px rgba(59, 130, 246, 0.1)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📅</span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      color: group.isToday ? 'var(--accent-blue)' : 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}>
                      {group.dateLabel}
                    </span>
                    {group.isToday && (
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        background: 'rgba(37, 99, 235, 0.2)',
                        color: '#60a5fa',
                        fontWeight: 800,
                      }}>
                        Today
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {group.totalMatches} {group.totalMatches === 1 ? 'game' : 'games'}
                  </span>
                </div>

                {/* Leagues for this Date */}
                {Object.values(group.leagueGroups).map(({ league, matches: leagueMatches }) => (
                  <LeagueAccordionSection
                    key={`${group.dateKey}-${league.id || league.code}`}
                    league={league}
                    matches={leagueMatches}
                    onPredictionChange={loadMatches}
                  />
                ))}
              </div>

              {/* In-feed Ad after first date */}
              {groupIdx === 0 && <AdBanner slot="in-feed-match" />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚽</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No Matches Found
          </h3>
          <p style={{ fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            {searchQuery
              ? `No fixtures matching "${searchQuery}". Try checking team names or clearing your search filter.`
              : `There are currently no fixtures matching the selected ${selectedStatus.toLowerCase()} status or competition.`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-primary"
                style={{ borderRadius: '10px', padding: '0.55rem 1.25rem', fontSize: '0.84rem' }}
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => { setSelectedStatus('SCHEDULED'); setSelectedLeague(''); setSearchQuery(''); }}
              className="btn btn-secondary"
              style={{ borderRadius: '10px', padding: '0.55rem 1.25rem', fontSize: '0.84rem' }}
            >
              Reset All Filters
            </button>
            <Link
              href="/football-predictions-today"
              className="btn btn-secondary"
              style={{ borderRadius: '10px', padding: '0.55rem 1.25rem', fontSize: '0.84rem', color: '#86efac' }}
            >
              🎯 Today&apos;s Predictions
            </Link>
          </div>
        </div>
      )}

      {/* Internal SEO Navigation Links */}
      <footer style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}>
        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
          Explore Match Forecasts &amp; Competitions:
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link
            href="/football-predictions-today"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#86efac',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🎯 Today&apos;s Match Predictions
          </Link>
          <Link
            href="/live"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🔴 Live In-Play Scores
          </Link>
          <Link
            href="/leagues"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid var(--gradient-hero-border)',
              color: '#93c5fd',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 League Tables &amp; Standings
          </Link>
          <Link
            href="/stats"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📊 Prediction Accuracy Audit
          </Link>
        </div>
      </footer>

      {/* Bottom Ad Placement */}
      <AdBanner slot="merch-sports" />
    </div>
  );
}
