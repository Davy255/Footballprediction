'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { League, StandingTableItem } from '@/lib/types';
import { fetchLeagueStandings } from '@/lib/api';
import { getLeagueUrl } from '@/lib/slugs';
import LeagueTable from '@/components/LeagueTable';

interface LeaguesClientProps {
  initialLeagues: League[];
  initialSelectedLeague: League | null;
  initialStandings: StandingTableItem[];
}

export default function LeaguesClient({
  initialLeagues = [],
  initialSelectedLeague = null,
  initialStandings = [],
}: LeaguesClientProps) {
  const [leagues] = useState<League[]>(initialLeagues);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(initialSelectedLeague);
  const [standings, setStandings] = useState<StandingTableItem[]>(initialStandings);
  const [loadingStandings, setLoadingStandings] = useState(false);

  const handleSelectLeague = async (league: League) => {
    if (selectedLeague?.code === league.code) return;
    setSelectedLeague(league);
    setLoadingStandings(true);
    try {
      const res = await fetchLeagueStandings(league.code);
      const tableData = res?.standings?.[0]?.table || [];
      setStandings(tableData);
    } catch (err) {
      console.error('Error fetching league standings:', err);
      setStandings([]);
    } finally {
      setLoadingStandings(false);
    }
  };

  return (
    <div>
      {/* League Selection Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.8rem',
          marginBottom: '1.75rem',
          scrollbarWidth: 'thin',
        }}
        role="tablist"
        aria-label="Select Football League"
      >
        {leagues.map((lg) => {
          const isSelected = selectedLeague?.code === lg.code;
          return (
            <button
              key={lg.code}
              onClick={() => handleSelectLeague(lg)}
              role="tab"
              aria-selected={isSelected}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '30px',
                whiteSpace: 'nowrap',
                padding: '0.45rem 1rem',
                fontSize: '0.88rem',
                fontWeight: isSelected ? 700 : 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <span>{lg.flag}</span>
              <span>{lg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Standings Table Section */}
      {selectedLeague ? (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{selectedLeague.flag}</span>
              <span>{selectedLeague.name} Table &amp; Form</span>
            </h2>

            <Link
              href={getLeagueUrl(selectedLeague.name, selectedLeague.code)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                color: '#93c5fd',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View Full {selectedLeague.name} Hub &amp; Fixtures &rarr;
            </Link>
          </div>

          {loadingStandings ? (
            <div
              className="glass-panel"
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              Updating {selectedLeague.name} standings...
            </div>
          ) : (
            <LeagueTable table={standings} leagueName={selectedLeague.name} />
          )}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}
        >
          Select a league from the options above to view standings.
        </div>
      )}
    </div>
  );
}
