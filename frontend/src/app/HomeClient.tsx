'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchTodayMatches, fetchUpcomingMatches, fetchLiveMatches, fetchLeagues, fetchMatches, fetchMatchesFeed, fetchYesterdayMatches } from '@/lib/api';
import dynamic from 'next/dynamic';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';

const HowToPlayModal = dynamic(() => import('@/components/HowToPlayModal'), { ssr: false });
import AdBanner from '@/components/AdBanner';
import Link from 'next/link';
import { getLeagueUrl } from '@/lib/slugs';
import { useAuth } from '@/context/AuthContext';

function SkeletonCard() {
  return (
    <div className="skeleton-card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '16px' }} />
        <div className="skeleton" style={{ width: '60px', height: '16px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '45px', borderRadius: '8px', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ width: '100%', height: '45px', borderRadius: '8px' }} />
    </div>
  );
}

function getMatchDateKey(utc_date: string): { key: string; label: string; isToday: boolean; isTomorrow: boolean } {
  if (!utc_date) return { key: '9999-99-99', label: 'Other Fixtures', isToday: false, isTomorrow: false };
  try {
    let s = String(utc_date).trim();
    if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) s = s.replace(' ', 'T') + 'Z';
    else s = s.replace(' ', 'T');
    const d = new Date(s);
    if (isNaN(d.getTime())) return { key: '9999-99-99', label: 'Upcoming Matches', isToday: false, isTomorrow: false };

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
    'real': ['real madrid', 'real practical', 'real betis'],
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

interface HomeClientProps {
  initialMatches?: Match[];
  initialLeagues?: League[];
}

export default function HomeClient({ initialMatches = [], initialLeagues = [] }: HomeClientProps) {
  const { user } = useAuth();
  const [allMatches, setAllMatches] = useState<Match[]>(initialMatches);
  const [leagues, setLeagues] = useState<League[]>(initialLeagues);
  const [selectedStatus, setSelectedStatus] = useState<string>('SCHEDULED');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [showGuide, setShowGuide] = useState(false);

  const loadData = async (isInitial = true) => {
    try {
      const feed = await fetchMatchesFeed().catch(() => null);
      if (feed && Array.isArray(feed.matches) && feed.matches.length > 0) {
        const [yesterday, liveFresh] = await Promise.all([
          fetchYesterdayMatches().catch(() => []),
          fetchLiveMatches().catch(() => []),
        ]);
        const matchMap = new Map<number, Match>();
        [...(feed.matches), ...(yesterday || []), ...(liveFresh || [])].forEach((m) => {
          if (m && m.id) matchMap.set(m.id, m);
        });
        setAllMatches(Array.from(matchMap.values()));
        if (Array.isArray(feed.leagues) && feed.leagues.length > 0) {
          setLeagues(feed.leagues);
        }
        setLoading(false);
        return;
      }

      const [today, upcoming, live, finished, yesterday, lgs] = await Promise.all([
        fetchTodayMatches().catch(() => []),
        fetchUpcomingMatches(45).catch(() => []),
        fetchLiveMatches().catch(() => []),
        fetchMatches({ status: 'FINISHED', limit: 60 }).catch(() => []),
        fetchYesterdayMatches().catch(() => []),
        fetchLeagues().catch(() => []),
      ]);

      const matchMap = new Map<number, Match>();
      [...today, ...upcoming, ...live, ...finished, ...(yesterday || [])].forEach((m) => {
        if (m && m.id) matchMap.set(m.id, m);
      });

      const merged = Array.from(matchMap.values());
      if (merged.length > 0) {
        setAllMatches(merged);
      }

      if (lgs.length > 0) {
        setLeagues(lgs);
      }
    } catch (err) {
      console.error('Error loading homepage fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we do not have initial server matches, fetch immediately
    if (initialMatches.length === 0) {
      loadData(true);
    }

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === 'visible') {
            loadData(false);
          }
        }, 20000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(false);
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialMatches.length]);

  // Filter matches based on Search Query, selected Status & League
  const filteredMatches = allMatches.filter((m) => {
    if (!matchSatisfiesSearch(m, searchQuery)) {
      return false;
    }

    if (selectedLeague && (m.league.code !== selectedLeague && m.league.name !== selectedLeague)) {
      return false;
    }

    if (selectedStatus === 'LIVE') {
      return ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME', '1H', '2H', 'HT'].includes(m.status);
    }
    if (selectedStatus === 'FINISHED') {
      return ['FINISHED', 'AWARDED'].includes(m.status);
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
  const liveCount = allMatches.filter((m) => ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME', '1H', '2H', 'HT'].includes(m.status)).length;

  return (
    <div>
      {/* Sleek Mobile & Desktop Filter Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Universal Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, matches, leagues (e.g. Arsenal, Real Madrid)..."
            style={{
              width: '100%',
              padding: '0.62rem 2.2rem 0.62rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
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
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.70rem',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Segmented Status Tab Control (3 Equal Width Buttons) */}
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.35rem',
              background: 'var(--bg-card-hover)',
              padding: '0.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedStatus('SCHEDULED')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '0.48rem 0.2rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                background: selectedStatus === 'SCHEDULED' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
                color: selectedStatus === 'SCHEDULED' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: selectedStatus === 'SCHEDULED' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
              }}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('LIVE')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '0.48rem 0.2rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                background: selectedStatus === 'LIVE' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
                color: selectedStatus === 'LIVE' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: selectedStatus === 'LIVE' ? '0 2px 8px rgba(239, 68, 68, 0.4)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              {liveCount > 0 && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'inline-block',
                  }}
                />
              )}
              Live {liveCount > 0 ? `(${liveCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('FINISHED')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '0.48rem 0.2rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                background: selectedStatus === 'FINISHED' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: selectedStatus === 'FINISHED' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: selectedStatus === 'FINISHED' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
              }}
            >
              Finished
            </button>
          </div>
        </div>

        {/* League Horizontal Filter Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.3rem',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedLeague('')}
            style={{
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              padding: '0.3rem 0.75rem',
              fontSize: '0.76rem',
              fontWeight: !selectedLeague ? 800 : 500,
              border: !selectedLeague ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
              background: !selectedLeague ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
              color: !selectedLeague ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            All Competitions
          </button>
          {leagues.map((lg) => {
            const isSelected = selectedLeague === lg.code || selectedLeague === lg.name;
            return (
              <button
                key={lg.code}
                type="button"
                onClick={() => setSelectedLeague(isSelected ? '' : lg.code)}
                style={{
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 800 : 500,
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span>{lg.flag}</span> {lg.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches Display Section */}
      <div style={{ marginTop: '0.85rem' }}>
        {loading && allMatches.length === 0 ? (
          <div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : dateGroups.length > 0 ? (
          <div>
            {dateGroups.map((group) => {
              const leagueGroupsArray = Object.values(group.leagueGroups).sort((a, b) => {
                const nameA = a.league?.name || '';
                const nameB = b.league?.name || '';
                return nameA.localeCompare(nameB);
              });

              return (
                <div key={group.dateKey} style={{ marginBottom: '2.5rem' }}>
                  {/* Semantic Date Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      marginBottom: '1rem',
                      padding: '0.45rem 0.75rem',
                      background: group.isToday
                        ? 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, transparent 100%)'
                        : group.isTomorrow
                        ? 'linear-gradient(90deg, rgba(59,130,246,0.12) 0%, transparent 100%)'
                        : 'var(--bg-card-hover)',
                      borderLeft: group.isToday
                        ? '4px solid #22c55e'
                        : group.isTomorrow
                        ? '4px solid #3b82f6'
                        : '4px solid var(--border-color)',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>📅</span>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: group.isToday ? '#86efac' : group.isTomorrow ? '#93c5fd' : 'var(--text-primary)',
                      }}
                    >
                      {group.dateLabel}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        border: '1px solid var(--border-color)',
                        fontWeight: 700,
                      }}
                    >
                      {group.totalMatches} {group.totalMatches === 1 ? 'match' : 'matches'}
                    </span>
                  </div>

                  {/* League Sections under this Date */}
                  {leagueGroupsArray.map(({ league, matches: leagueMatches }) => (
                    <LeagueAccordionSection
                      key={`${group.dateKey}-${league?.id ? `league-${league.id}` : `league-${league?.code || league?.name || 'unknown'}`}`}
                      league={league}
                      matches={leagueMatches}
                      onPredictionChange={() => loadData(false)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ) : selectedStatus === 'LIVE' ? (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid var(--accent-red-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 1rem auto',
              }}
            >
              📡
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Matches Currently In-Play
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.84rem', maxWidth: '460px', margin: '0 auto 1.25rem auto' }}>
              There are no live games underway right now across our covered leagues. Matches will appear here automatically when they kick off.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedStatus('SCHEDULED')}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}
              >
                View Upcoming Matches
              </button>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}
              >
                🔄 Refresh Live Scores
              </button>
              <Link
                href="/live"
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                🔴 Live Match Centre &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>⚽</div>
            <p style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
              No matches found {searchQuery ? `matching "${searchQuery}"` : `for ${selectedStatus.toLowerCase()} status`}
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear search query
                </button>
              ) : (
                <>Try switching to <button onClick={() => setSelectedStatus('SCHEDULED')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Upcoming</button> or selecting another league.</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Responsive Content Ad Placement (Between Matches & Analytics Guide) */}
      <AdBanner slot="home-content-mid" />

      {/* Informational Cards & Platform Guide */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginTop: '1.75rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span>📐</span> Objective Football Analytics &amp; Statistical Modeling
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          FootballPredict is an independent football statistics and predictive modeling platform. We provide objective, data-driven pre-match probability distributions, projected scorelines, and form analytics across Europe&apos;s leading domestic and continental competitions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Predictive Engine</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Synthesizes 19-feature match vectors, calibrated +48.0 Elo home advantage offsets, and bivariate Poisson goal distributions.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>📊</div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Transparent Verification</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Every prediction is locked prior to kickoff and tracked in our public accuracy ledger evaluated against official final scores.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>📚</div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Educational Research Hub</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Read in-depth research articles detailing Poisson modeling, home advantage quantification, and margin normalization.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>👑</div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Non-Monetary Community</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Compete with fellow football fans on non-monetary leaderboards to test match prediction acumen without real-money staking.
            </div>
          </div>
        </div>

        {/* Model Limitations Notice */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          ⚖️ <strong>Model Limitations &amp; Uncertainty:</strong> Probability estimates reflect statistical tendencies across large sample sizes and do not guarantee single-match outcomes. Football inherently involves stochastic elements—including unexpected red cards, refereeing decisions, early-season form volatility, and sudden lineup rotations—that pre-match models cannot anticipate.
        </div>
      </section>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
