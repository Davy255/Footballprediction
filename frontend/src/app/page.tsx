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
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="hero-tag">
            🏆 Expert Football Intelligence &amp; Match Prediction Hub
          </div>
          <h1 className="hero-title">
            Expert Match Predictions<br />
            <span style={{ background: 'var(--gradient-badge)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Backed by 87,000+ Match History
            </span>
          </h1>
          <p className="hero-subtitle">
            Statistical outcome breakdowns, live bookmaker odds, historical Head-to-Head records, 
            multi-market analysis (BTTS, O/U 2.5, Double Chance), and competitive points settlement.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/fixtures" className="btn btn-primary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>
              Explore Fixtures 🎯
            </Link>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              📖 How to Play &amp; Rules
            </button>
            <Link href="/leaderboard" className="btn btn-secondary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>
              👑 Leaderboard
            </Link>
            {!user && (
              <Link href="/register" className="btn btn-secondary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>
                Sign Up Free 🚀
              </Link>
            )}
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
        </div>
      </section>

      {/* Main Content - Centered Fixtures Column */}
      <div className="container" style={{ marginTop: '1.5rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* League Pills Bar */}
          {leagues.length > 0 && (
            <div className="league-pills" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
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
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="section-header">
              <h2 className="section-title">🔥 Matches Today &amp; Imminent</h2>
              <Link href="/fixtures" className="section-link">View All →</Link>
            </div>

            {loading ? (
              <div>
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
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No matches scheduled for today</p>
                <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>Check the upcoming fixtures below!</p>
              </div>
            )}
          </div>

          {/* Leaderboard Ad Placement Slot */}
          <AdBanner />

          {/* Upcoming Matches Section */}
          <div>
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
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No upcoming matches found</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
