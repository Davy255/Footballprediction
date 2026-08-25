'use client';

import React, { useEffect, useState, Suspense } from 'react';
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

function FixturesContent() {
  const searchParams = useSearchParams();
  const initialLeague = searchParams.get('league') || '';

  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(initialLeague);
  const initialStatus = searchParams.get('status') || 'SCHEDULED';
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues()
      .then(setLeagues)
      .catch(() => {});
  }, []);

  const loadMatches = async (useCache = true) => {
    const cacheKey = `fp_fix_${selectedLeague}_${selectedStatus}`;
    if (useCache && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
        if (cached) {
          setMatches(JSON.parse(cached));
          setLoading(false);
        }
      } catch {}
    }

    try {
      const data = await fetchMatches({
        league_code: selectedLeague || undefined,
        status: selectedStatus || undefined,
        limit: 150,
      });
      if (Array.isArray(data)) {
        setMatches(data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches(true);
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

    return true;
  });

  // Group filtered matches chronologically by Date, then by League
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

      const leagueCode = m.league.code || m.league.name;
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
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{
        padding: '1.1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
      }}>
        {/* Universal Search Bar */}
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
            🎯 Today&apos;s Tips
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
          {leagues.slice(0, 6).map((lg) => (
            <Link
              key={lg.code}
              href={getLeagueUrl(lg.name, lg.code)}
              style={{
                background: 'var(--accent-blue-bg)',
                border: '1px solid var(--accent-blue-border)',
                color: 'var(--accent-blue)',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {lg.flag || '🏆'} {lg.name}
            </Link>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Status buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Status:</span>
            {['SCHEDULED', 'LIVE', 'FINISHED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`btn ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.80rem', padding: '0.35rem 0.9rem', borderRadius: '8px', fontWeight: 700 }}
              >
                {st === 'SCHEDULED' ? 'Upcoming' : st === 'LIVE' ? '🔴 Live' : 'Completed'}
              </button>
            ))}
          </div>

          {/* League dropdown */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: '220px', flex: '1 1 200px', maxWidth: '300px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>League:</span>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              style={{
                flex: 1,
                padding: '0.42rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-hover)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">🚩 All Leagues</option>
              {leagues.map((lg) => (
                <option key={lg.code} value={lg.code}>
                  {lg.flag} {lg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Hero Ad Banner */}
      <AdBanner slot="hero-top" />

      {/* Matches Categorized by Date & Day */}
      {loading ? (
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
      ) : selectedStatus === 'LIVE' ? (
        <div className="glass-panel" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1rem auto'
          }}>
            📡
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No Live Matches In-Play Right Now
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.4rem auto', lineHeight: 1.5 }}>
            There are currently no games actively in-play across supported leagues. New live fixtures appear automatically as matches kick off!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedStatus('SCHEDULED')}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}
            >
              📅 View Upcoming Matches
            </button>
            <button
              type="button"
              onClick={() => loadMatches(false)}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}
            >
              🔄 Refresh Live Scores
            </button>
            <a
              href="/live"
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              🔴 Live Match Centre ➔
            </a>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
            No matches found for the selected filters.
          </p>
          <button
            onClick={() => { setSelectedStatus('SCHEDULED'); setSelectedLeague(''); setSearchQuery(''); }}
            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Explore More Predictions Footer */}
      <footer style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
          Explore Match Predictions &amp; Competition Standings:
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link
            href="/football-predictions-today"
            style={{
              background: 'var(--accent-green-bg)',
              border: '1px solid var(--accent-green-border)',
              color: 'var(--accent-green)',
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
              background: 'var(--accent-red-bg)',
              border: '1px solid var(--accent-red-border)',
              color: 'var(--accent-red)',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🔴 Real-Time Live Scores
          </Link>
          <Link
            href="/leagues"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#d8b4fe',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 Top European Leagues
          </Link>
          <Link
            href="/leaderboard"
            style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.25)',
              color: '#fde047',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            👑 Tipster Leaderboard
          </Link>
          <Link
            href="/stats"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: 'var(--accent-blue)',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📊 AI Accuracy Statistics
          </Link>
        </div>
      </footer>

      {/* Bottom Ad Placement */}
      <AdBanner slot="merch-sports" />
    </div>
  );
}

export default function FixturesPage() {
  return (
    <div className="container" style={{ marginTop: '1.25rem', paddingBottom: '2.5rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}>
            Match Fixtures &amp; Predictions <span style={{ fontSize: '1.5rem' }}>⚽</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Browse upcoming matches, view comprehensive probability breakdowns, and place your predictions.
          </p>
        </div>

        <Suspense fallback={<div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>Loading page...</div>}>
          <FixturesContent />
        </Suspense>
      </div>
    </div>
  );
}
