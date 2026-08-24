'use client';

import React, { useEffect, useState } from 'react';
import { Match, League } from '@/lib/types';
import { fetchMatchesFeed } from '@/lib/api';
import TacticalPitch from '@/components/TacticalPitch';
import PlayerStatsTable from '@/components/PlayerStatsTable';
import Link from 'next/link';

export default function LineupsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchesFeed()
      .then((data) => {
        if (data && Array.isArray(data.matches)) {
          setMatches(data.matches);
          setLeagues(data.leagues || []);
          if (data.matches.length > 0) {
            setSelectedMatch(data.matches[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load lineups feed:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (!selectedLeague) return true;
    return m.league?.id === Number(selectedLeague) || m.league?.name === selectedLeague;
  });

  const activeMatch = selectedMatch || (filteredMatches.length > 0 ? filteredMatches[0] : null);

  let aiData: any = null;
  if (activeMatch?.prediction_description) {
    try {
      aiData = JSON.parse(activeMatch.prediction_description);
    } catch {}
  }

  const HN = activeMatch?.home_team?.short_name || activeMatch?.home_team?.name || 'Home Team';
  const AN = activeMatch?.away_team?.short_name || activeMatch?.away_team?.name || 'Away Team';

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(56,189,248,0.1) 100%)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: '16px',
        padding: '1.5rem 1.8rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', color: '#f0f6ff', margin: 0 }}>
            👕 Official &amp; Projected Match Lineups
          </h1>
          <p style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.92rem' }}>
            Interactive 2D tactical pitch formations, verified squad rosters, ratings, and player metrics.
          </p>
        </div>
        <Link
          href="/fixtures"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#38bdf8',
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          ⚽ View All Fixtures
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontWeight: 700 }}>Loading authentic match lineups &amp; tactical formations...</div>
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
          No scheduled fixtures available at the moment.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Match Selection List */}
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '1.2rem',
            height: 'fit-content',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Select Fixture
              </h2>
              {leagues.length > 0 && (
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f8fafc',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                  }}
                >
                  <option value="">All Leagues</option>
                  {leagues.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '650px', overflowY: 'auto' }}>
              {filteredMatches.map((m) => {
                const isSelected = activeMatch?.id === m.id;
                const homeName = m.home_team?.short_name || m.home_team?.name || 'Home';
                const awayName = m.away_team?.short_name || m.away_team?.name || 'Away';

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.90rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {homeName} vs {awayName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        {m.league?.name || 'League Match'}
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>
                        Active ➔
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tactical Pitch & Player Statistics */}
          {activeMatch && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              <div>
                <div style={{ marginBottom: '0.8rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                    🏟️ {HN} vs {AN}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                    {activeMatch.league?.name} · Match Day {activeMatch.matchday || 1}
                  </div>
                </div>

                <TacticalPitch
                  lineupData={aiData?.lineups}
                  homeName={HN}
                  awayName={AN}
                  homeFormation={aiData?.whoscored?.home_formation || '4-2-3-1'}
                  awayFormation={aiData?.whoscored?.away_formation || '4-3-3'}
                  homeManager={aiData?.whoscored?.home_manager}
                  awayManager={aiData?.whoscored?.away_manager}
                  isLiveOrFinished={activeMatch.status === 'IN_PLAY' || activeMatch.status === 'FINISHED'}
                />
              </div>

              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.8rem' }}>
                  🌟 Key Player Performance &amp; Leaderboards
                </div>
                <PlayerStatsTable
                  lineupData={aiData?.lineups}
                  homeName={HN}
                  awayName={AN}
                />
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
