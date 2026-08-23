'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchTodayMatches, fetchUpcomingMatches, fetchLeagues, fetchMatches } from '@/lib/api';
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

export default function HomePage() {
  const { user } = useAuth();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('SCHEDULED');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const loadData = async (isInitial = true) => {
    // Try restoring from instant client cache first
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
        fetchMatches({ limit: 60 }).catch(() => []),
        fetchLeagues().catch(() => []),
      ]);

      if (matchesData.length > 0) setAllMatches(matchesData);
      if (lgs.length > 0) setLeagues(lgs);

      // Save to instant client cache
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

  // Filter matches based on selected status & league
  const filteredMatches = allMatches.filter((m) => {
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

  const groupMatchesByLeague = (matchesList: Match[]) => {
    return matchesList.reduce<Record<string, { league: League; matches: Match[] }>>((acc, m) => {
      const code = m.league.code || m.league.name;
      if (!acc[code]) {
        acc[code] = { league: m.league, matches: [] };
      }
      acc[code].matches.push(m);
      return acc;
    }, {});
  };

  const groupedMatches = groupMatchesByLeague(filteredMatches);

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

          {/* Status & League Filter Card (Image Reference Layout) */}
          <div className="glass-panel" style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Status Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Status:</span>
              <button
                type="button"
                onClick={() => setSelectedStatus('SCHEDULED')}
                className={`btn ${selectedStatus === 'SCHEDULED' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem', borderRadius: '10px', fontWeight: 700 }}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('LIVE')}
                className={`btn ${selectedStatus === 'LIVE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem', borderRadius: '10px', fontWeight: 700 }}
              >
                🔴 Live
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('FINISHED')}
                className={`btn ${selectedStatus === 'FINISHED' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem', borderRadius: '10px', fontWeight: 700 }}
              >
                Completed
              </button>
            </div>

            {/* League Dropdown Selector */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', minWidth: '220px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>League:</span>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-hover)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
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

          {/* Match Fixtures List */}
          <div style={{ marginBottom: '2.5rem' }}>
            {loading ? (
              <div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : Object.keys(groupedMatches).length > 0 ? (
              <div>
                {Object.values(groupedMatches).map(({ league, matches }) => (
                  <LeagueAccordionSection
                    key={league.id || league.code}
                    league={league}
                    matches={matches}
                    onPredictionChange={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚽</div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  No matches found for {selectedStatus.toLowerCase()} status
                </p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>
                  Try switching to <button onClick={() => setSelectedStatus('SCHEDULED')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Upcoming</button> or select another league.
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
