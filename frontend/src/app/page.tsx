'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchTodayMatches, fetchUpcomingMatches, fetchLeagues } from '@/lib/api';
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
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const loadData = async (isInitial = true) => {
    // Try restoring from instant client cache first
    if (isInitial && typeof window !== 'undefined') {
      try {
        const cachedToday = sessionStorage.getItem('fp_cache_today');
        const cachedUpcoming = sessionStorage.getItem('fp_cache_upcoming');
        const cachedLeagues = sessionStorage.getItem('fp_cache_leagues');
        if (cachedToday && cachedLeagues) {
          setTodayMatches(JSON.parse(cachedToday));
          setLeagues(JSON.parse(cachedLeagues));
          if (cachedUpcoming) setUpcomingMatches(JSON.parse(cachedUpcoming));
          setLoading(false);
        }
      } catch {}
    }

    try {
      const [today, upcoming, lgs] = await Promise.all([
        fetchTodayMatches().catch(() => []),
        fetchUpcomingMatches(10).catch(() => []),
        fetchLeagues().catch(() => []),
      ]);

      if (today.length > 0) setTodayMatches(today);
      if (upcoming.length > 0) setUpcomingMatches(upcoming);
      if (lgs.length > 0) setLeagues(lgs);

      // Save to instant client cache
      if (typeof window !== 'undefined') {
        try {
          if (today.length > 0) sessionStorage.setItem('fp_cache_today', JSON.stringify(today));
          if (upcoming.length > 0) sessionStorage.setItem('fp_cache_upcoming', JSON.stringify(upcoming));
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

  const groupedToday = groupMatchesByLeague(todayMatches);
  const groupedUpcoming = groupMatchesByLeague(upcomingMatches);

  return (
    <div>
      {/* Compact, Clean Top Header Bar */}
      <section style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚽</span>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                Football Intelligence &amp; Match Predictions
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                AI Projections • WhoScored Analytics • Live Odds &amp; Leaderboards
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              📖 Rules
            </button>
            <Link href="/leaderboard" className="btn btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.80rem' }}>
              👑 Leaderboard
            </Link>
            {!user && (
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.80rem' }}>
                Sign Up 🚀
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Fixtures Column */}
      <div className="container" style={{ marginTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* League Pills Bar */}
          {leagues.length > 0 && (
            <div className="league-pills" style={{ marginBottom: '1.25rem' }}>
              <Link href="/fixtures" className="league-pill">
                🌍 All Leagues
              </Link>
              {leagues.map((lg) => (
                <Link
                  key={lg.code}
                  href={`/fixtures?league=${lg.code}`}
                  className="league-pill"
                >
                  <span>{lg.flag}</span>
                  <span>{lg.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Today's Matches Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">🔥 Matches Today &amp; Imminent</h2>
              <Link href="/fixtures" className="section-link">View All →</Link>
            </div>

            {loading ? (
              <div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : Object.keys(groupedToday).length > 0 ? (
              <div>
                {Object.values(groupedToday).map(({ league, matches }) => (
                  <LeagueAccordionSection
                    key={league.id || league.code}
                    league={league}
                    matches={matches}
                    onPredictionChange={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No matches scheduled for today</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>Check the upcoming fixtures below!</p>
              </div>
            )}
          </div>

          {/* Leaderboard Ad Placement Slot */}
          <AdBanner />

          {/* Upcoming Matches Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2 className="section-title">📅 Upcoming Featured Fixtures</h2>
              <Link href="/fixtures?status=SCHEDULED" className="section-link">View All Fixtures →</Link>
            </div>

            {loading ? (
              <div>
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : Object.keys(groupedUpcoming).length > 0 ? (
              <div>
                {Object.values(groupedUpcoming).map(({ league, matches }) => (
                  <LeagueAccordionSection
                    key={league.id || league.code}
                    league={league}
                    matches={matches}
                    onPredictionChange={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No upcoming matches found</p>
              </div>
            )}
          </div>

          {/* Bottom Platform Feature & Historical Stats Banner */}
          <section style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div className="hero-tag" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
              🏆 Expert Football Intelligence Hub
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Backed by 87,000+ Match History
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Statistical outcome breakdowns, live bookmaker odds, historical Head-to-Head records, 
              multi-market analysis (BTTS, O/U 2.5, Double Chance), and competitive community points settlement.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <Link href="/fixtures" className="btn btn-primary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>
                Explore All Fixtures 🎯
              </Link>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
              >
                📖 How Scoring Works
              </button>
            </div>

            {/* Stats Row Strip */}
            <div className="stats-row">
              {[
                { value: '87k+', label: 'Historical Matches', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
                { value: '12', label: 'Top Leagues', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
                { value: '+5pts', label: 'Exact Score Bonus', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
                { value: '+3pts', label: 'Outcome Winner', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)' },
                { value: '+2pts', label: 'BTTS & O/U 2.5', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
                { value: '⚡ Live', label: 'Real-time Data', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
              ].map((s) => (
                <div className="stat-item" key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}35` }}>
                  <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
