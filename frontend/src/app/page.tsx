'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchLeagues, fetchMatches } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';
import HowToPlayModal from '@/components/HowToPlayModal';
import AdBanner from '@/components/AdBanner';
import Link from 'next/link';
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

export default function HomePage() {
  const { user } = useAuth();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('SCHEDULED');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const loadData = async (isInitial = true) => {
    // Try client cache first
    if (isInitial && typeof window !== 'undefined') {
      try {
        const cachedMatches = sessionStorage.getItem('fp_cache_all_matches');
        const cachedLeagues = sessionStorage.getItem('fp_cache_leagues');
        if (cachedMatches && cachedLeagues) {
          setAllMatches(JSON.parse(cachedMatches));
          setLeagues(JSON.parse(cachedLeagues));
          setLoading(false);
        }
      } catch {}
    }

    try {
      const [matchesData, lgs] = await Promise.all([
        fetchMatches({ limit: 100 }).catch(() => []),
        fetchLeagues().catch(() => []),
      ]);

      if (matchesData.length > 0) setAllMatches(matchesData);
      if (lgs.length > 0) setLeagues(lgs);

      if (typeof window !== 'undefined') {
        try {
          if (matchesData.length > 0) sessionStorage.setItem('fp_cache_all_matches', JSON.stringify(matchesData));
          if (lgs.length > 0) sessionStorage.setItem('fp_cache_leagues', JSON.stringify(lgs));
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Filter matches based on Search Query, selected Status & League
  const filteredMatches = allMatches.filter((m) => {
    // Search Query filter (checks team names, league names, countries)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const hn = (m.home_team?.name || '').toLowerCase();
      const hsn = (m.home_team?.short_name || '').toLowerCase();
      const an = (m.away_team?.name || '').toLowerCase();
      const asn = (m.away_team?.short_name || '').toLowerCase();
      const ln = (m.league?.name || '').toLowerCase();
      const lc = (m.league?.country || '').toLowerCase();
      const lcode = (m.league?.code || '').toLowerCase();

      const matchFound =
        hn.includes(q) ||
        hsn.includes(q) ||
        an.includes(q) ||
        asn.includes(q) ||
        ln.includes(q) ||
        lc.includes(q) ||
        lcode.includes(q);

      if (!matchFound) return false;
    }

    // League filter
    if (selectedLeague && (m.league.code !== selectedLeague && m.league.name !== selectedLeague)) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'LIVE') {
      return ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status);
    }
    if (selectedStatus === 'FINISHED') {
      return ['FINISHED', 'AWARDED'].includes(m.status);
    }
    if (selectedStatus === 'SCHEDULED') {
      return ['SCHEDULED', 'TIMED', 'POSTPONED'].includes(m.status);
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

    return Object.values(dateMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  };

  const dateGroups = groupMatchesByDateAndLeague(filteredMatches);

  return (
    <div>
      {/* Main Content Container */}
      <div className="container" style={{ marginTop: '1.25rem', paddingBottom: '2.5rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* Hero Header Title */}
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

          {/* Status, Search & League Filter Card */}
          <div className="glass-panel" style={{
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
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

            {/* Filter Controls Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Status:</span>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('SCHEDULED')}
                  className={`btn ${selectedStatus === 'SCHEDULED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.80rem', padding: '0.35rem 0.9rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('LIVE')}
                  className={`btn ${selectedStatus === 'LIVE' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.80rem', padding: '0.35rem 0.9rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  🔴 Live
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('FINISHED')}
                  className={`btn ${selectedStatus === 'FINISHED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.80rem', padding: '0.35rem 0.9rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  Completed
                </button>
              </div>

              {/* League Dropdown Selector */}
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

          {/* Matches Categorized by Date & Day */}
          <div style={{ marginBottom: '2.5rem' }}>
            {loading ? (
              <div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : dateGroups.length > 0 ? (
              <div>
                {dateGroups.map((group) => (
                  <div key={group.dateKey} style={{ marginBottom: '2rem' }}>
                    {/* Clean Date Header Ribbon */}
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
                    {Object.values(group.leagueGroups).map(({ league, matches }) => (
                      <LeagueAccordionSection
                        key={`${group.dateKey}-${league.id || league.code}`}
                        league={league}
                        matches={matches}
                        onPredictionChange={loadData}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>⚽</div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
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

          {/* Ad Banner Placement */}
          <AdBanner />

          {/* Informational Cards & How It Works (Bottom of page) */}
          <section style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🏆</span> Football Intelligence &amp; Multi-Market Predictions
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Explore tactical form ratings, H2H statistics, Over/Under 2.5 projections, and Both Teams to Score (BTTS) probabilities powered by deep match analytics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🤖</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Coach AI Assistant</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time match forecasts &amp; supporter</div>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>WhoScored Tactical Hub</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formations, referee stats &amp; style</div>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>👑</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Global Leaderboard</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compete with fans &amp; earn points</div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
