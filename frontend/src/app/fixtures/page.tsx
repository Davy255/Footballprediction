'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Match, League } from '@/lib/types';
import { fetchMatches, fetchLeagues } from '@/lib/api';
import LeagueAccordionSection from '@/components/LeagueAccordionSection';
import { useSearchParams } from 'next/navigation';

function FixturesContent() {
  const searchParams = useSearchParams();
  const initialLeague = searchParams.get('league') || '';

  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(initialLeague);
  const initialStatus = searchParams.get('status') || 'SCHEDULED';
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues()
      .then(setLeagues)
      .catch(() => {});
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await fetchMatches({
        league_code: selectedLeague || undefined,
        status: selectedStatus || undefined,
        limit: 100,
      });
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [selectedLeague, selectedStatus]);

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

  const grouped = groupMatchesByLeague(matches);

  return (
    <div>
      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status:</span>
          {['SCHEDULED', 'LIVE', 'FINISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`btn ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            >
              {st === 'SCHEDULED' ? 'Upcoming' : st === 'LIVE' ? '🔴 Live' : 'Completed'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>League:</span>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              outline: 'none',
            }}
          >
            <option value="">All Leagues</option>
            {leagues.map((lg) => (
              <option key={lg.code} value={lg.code}>
                {lg.flag} {lg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches Accordion List */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading fixtures...
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div>
          {Object.values(grouped).map(({ league, matches: leagueMatches }) => (
            <LeagueAccordionSection
              key={league.id || league.code}
              league={league}
              matches={leagueMatches}
              onPredictionChange={loadMatches}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No matches found for the selected filters.
        </div>
      )}
    </div>
  );
}

export default function FixturesPage() {
  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Match Fixtures & Predictions ⚽</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse upcoming matches, view comprehensive probability breakdowns, and place your predictions.
        </p>
      </div>

      <Suspense fallback={<div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>Loading page...</div>}>
        <FixturesContent />
      </Suspense>
    </div>
  );
}
