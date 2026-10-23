'use client';

import React, { useState } from 'react';
import { Match, League } from '@/lib/types';
import TacticalPitch from '@/components/TacticalPitch';
import PlayerStatsTable from '@/components/PlayerStatsTable';

interface LineupsClientProps {
  initialMatches: Match[];
  initialLeagues: League[];
}

export default function LineupsClient({ initialMatches = [], initialLeagues = [] }: LineupsClientProps) {
  const [matches] = useState<Match[]>(initialMatches);
  const [leagues] = useState<League[]>(initialLeagues);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(initialMatches.length > 0 ? initialMatches[0] : null);

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

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
        No scheduled fixtures available at the moment.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      {/* Left Column: Match Selection List */}
      <div
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1.2rem',
          height: 'fit-content',
        }}
      >
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
                    Active &rarr;
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
  );
}
