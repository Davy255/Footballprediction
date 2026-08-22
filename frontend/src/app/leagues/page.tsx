'use client';

import React, { useEffect, useState } from 'react';
import { League, StandingTableItem } from '@/lib/types';
import { fetchLeagues, fetchLeagueStandings } from '@/lib/api';
import LeagueTable from '@/components/LeagueTable';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<StandingTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(false);

  useEffect(() => {
    fetchLeagues()
      .then((data) => {
        setLeagues(data);
        if (data.length > 0) {
          setSelectedLeague(data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      setLoadingStandings(true);
      fetchLeagueStandings(selectedLeague.code)
        .then((res) => {
          const tableData = res?.standings?.[0]?.table || [];
          setStandings(tableData);
        })
        .catch(() => setStandings([]))
        .finally(() => setLoadingStandings(false));
    }
  }, [selectedLeague]);

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Competitions & Standings 🌍</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore top global football leagues and real-time league tables.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>Loading leagues...</div>
      ) : (
        <div>
          {/* League Pills */}
          <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
            {leagues.map((lg) => {
              const isSelected = selectedLeague?.code === lg.code;
              return (
                <button
                  key={lg.code}
                  onClick={() => setSelectedLeague(lg)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '30px', whiteSpace: 'nowrap' }}
                >
                  <span>{lg.flag}</span>
                  <span>{lg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Standings Table */}
          {selectedLeague && (
            <div>
              {loadingStandings ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  Loading {selectedLeague.name} standings...
                </div>
              ) : (
                <LeagueTable table={standings} leagueName={selectedLeague.name} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
