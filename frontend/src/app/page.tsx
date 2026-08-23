'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchTodayMatches, fetchUpcomingMatches, fetchLiveMatches, fetchLeagues, fetchMatches } from '@/lib/api';
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
    if (isInitial && typeof window !== 'undefined') {
      try {
        const cachedMatches = sessionStorage.getItem('fp_cache_all_matches');
        const cachedLeagues = sessionStorage.getItem('fp_cache_leagues');
        if (cachedMatches && cachedLeagues) {
          const parsed = JSON.parse(cachedMatches);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllMatches(parsed);
            setLeagues(JSON.parse(cachedLeagues));
            setLoading(false);
          }
        }
      } catch {}
    }

    try {
      const [today, upcoming, live, finished, lgs] = await Promise.all([
        fetchTodayMatches().catch(() => []),
        fetchUpcomingMatches(45).catch(() => []),
        fetchLiveMatches().catch(() => []),
        fetchMatches({ status: 'FINISHED', limit: 40 }).catch(() => []),
        fetchLeagues().catch(() => []),
      ]);

      const matchMap = new Map<number, Match>();
      [...today, ...upcoming, ...live, ...finished].forEach((m) => {
        if (m && m.id) matchMap.set(m.id, m);
      });

      const merged = Array.from(matchMap.values());
      if (merged.length > 0) {
        setAllMatches(merged);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('fp_cache_all_matches', JSON.stringify(merged));
          } catch {}
        }
      }

      if (lgs.length > 0) {
        setLeagues(lgs);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('fp_cache_leagues', JSON.stringify(lgs));
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error loading homepage fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Filter matches based on Search Query, selected Status & League
  const filteredMatches = allMatches.filter((m) => {
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

    if (selectedLeague && (m.league.code !== selectedLeague && m.league.name !== selectedLeague)) {
      return false;
    }

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
      <div className="container" style={{ marginTop: '0.85rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* Hero Header Title */}
          <div style={{ marginBottom: '1rem', padding: '0 0.2rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.35rem, 5.5vw, 1.85rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              marginBottom: '0.35rem',
            }}>
              Match Fixtures &amp; Predictions ⚽
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Browse upcoming matches, view comprehensive probability breakdowns, and place your predictions.
            </p>
          </div>

          {/* Sleek Mobile & Desktop Filter Card */}
          <div className="glass-panel" style={{
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Universal Search Bar */}
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.95rem', color: 'var(--text-muted)', pointerEvents: 'none'
              }}>
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
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.70rem',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Status Tab Control (3 Equal Width Buttons) */}
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.35rem',
                background: 'var(--bg-card-hover)',
                padding: '0.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('SCHEDULED')}
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 0.2rem',
                    fontSize: '0.80rem',
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
                    padding: '0.45rem 0.2rem',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    background: selectedStatus === 'LIVE' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'transparent',
                    color: selectedStatus === 'LIVE' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: selectedStatus === 'LIVE' ? '0 2px 8px rgba(220, 38, 38, 0.4)' : 'none',
                  }}
                >
                  🔴 Live
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('FINISHED')}
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 0.2rem',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    background: selectedStatus === 'FINISHED' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                    color: selectedStatus === 'FINISHED' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: selectedStatus === 'FINISHED' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
                  }}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* League Dropdown Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-hover)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">🚩 All Leagues &amp; Competitions</option>
                {leagues.map((lg) => (
                  <option key={lg.code} value={lg.code}>
                    {lg.flag} {lg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Hero Ad Banner */}
          <AdBanner slot="hero-top" />

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
                {dateGroups.map((group, groupIdx) => (
                  <React.Fragment key={group.dateKey}>
                    <div style={{ marginBottom: '1.75rem' }}>
                      {/* Clean Date Header Ribbon */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: group.isToday
                          ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)'
                          : 'var(--bg-card-hover)',
                        border: group.isToday ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '0.55rem 0.9rem',
                        marginBottom: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '1rem' }}>📅</span>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            color: group.isToday ? 'var(--accent-blue)' : 'var(--text-primary)',
                            letterSpacing: '-0.01em',
                          }}>
                            {group.dateLabel}
                          </span>
                          {group.isToday && (
                            <span style={{
                              fontSize: '0.66rem',
                              padding: '0.12rem 0.45rem',
                              borderRadius: '12px',
                              background: 'rgba(37, 99, 235, 0.25)',
                              color: '#60a5fa',
                              fontWeight: 800,
                            }}>
                              Today
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
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

                    {/* In-feed Ad after 1st date group */}
                    {groupIdx === 0 && <AdBanner slot="in-feed-match" />}

                    {/* In-feed Ad after 3rd date group */}
                    {groupIdx === 2 && <AdBanner slot="vip-coach-ai" />}
                  </React.Fragment>
                ))}
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

          {/* Bottom Merch & Sports Gear Ad Placement */}
          <AdBanner slot="merch-sports" />

          {/* Leaderboard Rewards Ad Placement */}
          <AdBanner slot="leaderboard-footer" />

          {/* Informational Cards & How It Works (Bottom of page) */}
          <section style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginTop: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🏆</span> Football Intelligence &amp; Multi-Market Predictions
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              Explore tactical form ratings, H2H statistics, Over/Under 2.5 projections, and Both Teams to Score (BTTS) probabilities powered by deep match analytics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>🤖</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Coach AI Assistant</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Real-time match forecasts &amp; supporter</div>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>WhoScored Tactical Hub</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Formations, referee stats &amp; style</div>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>👑</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Global Leaderboard</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Compete with fans &amp; earn points</div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
