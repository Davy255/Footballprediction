'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { searchFootballEntities } from '@/lib/api';
import { getMatchPredictionUrl, getTeamUrl, getLeagueUrl } from '@/lib/slugs';
import { Match } from '@/lib/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number }>;
    leagues: Array<{ id: number; name: string; code: string; country: string; flag: string }>;
    matches: Match[];
  }>({ teams: [], leagues: [], matches: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ teams: [], leagues: [], matches: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ teams: [], leagues: [], matches: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      searchFootballEntities(query)
        .then((res) => setResults({ teams: res.teams || [], leagues: res.leagues || [], matches: res.matches || [] }))
        .catch((err) => console.error('Search error:', err))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.teams.length + results.leagues.length + results.matches.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '3rem 1rem 1rem 1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0f172a',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search teams (Arsenal), competitions (Premier League), or matches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          />
          {loading && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Searching...</span>}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#cbd5e1',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            ESC
          </button>
        </div>

        {/* Search Results Body */}
        <div style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {query.trim().length < 2 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
              Type at least 2 characters to search across teams, competitions, and fixtures.
            </div>
          ) : totalResults === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>⚽</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>No results found for &ldquo;{query}&rdquo;</div>
              <div style={{ fontSize: '0.80rem' }}>Try searching by club name, league name, or country.</div>
            </div>
          ) : (
            <>
              {/* Category 1: Teams */}
              {results.teams.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    Clubs &amp; Teams ({results.teams.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {results.teams.map((t) => (
                      <Link
                        key={t.id}
                        href={getTeamUrl(t.name)}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '0.6rem 0.8rem',
                          textDecoration: 'none',
                        }}
                      >
                        {t.crest && (
                          <Image src={t.crest} alt={t.name} width={24} height={24} style={{ objectFit: 'contain' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.84rem' }}>{t.name}</div>
                          <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>Elo: {Math.round(t.elo_rating || 1500)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Competitions */}
              {results.leagues.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#fde047', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    Competitions &amp; Leagues ({results.leagues.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {results.leagues.map((lg) => (
                      <Link
                        key={lg.id}
                        href={getLeagueUrl(lg.name, lg.code)}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '0.6rem 0.8rem',
                          textDecoration: 'none',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{lg.flag || '🏆'}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.84rem' }}>{lg.name}</div>
                          <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>{lg.country}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Matches & Predictions */}
              {results.matches.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    Matches &amp; Predictions ({results.matches.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {results.matches.map((m) => {
                      const hn = m.home_team?.short_name || m.home_team?.name || 'Home';
                      const an = m.away_team?.short_name || m.away_team?.name || 'Away';
                      const matchUrl = getMatchPredictionUrl(m);

                      return (
                        <Link
                          key={m.id}
                          href={matchUrl}
                          onClick={onClose}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '10px',
                            padding: '0.65rem 0.9rem',
                            textDecoration: 'none',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem' }}>
                              {hn} vs {an}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {m.league?.name} • {m.utc_date ? new Date(m.utc_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Upcoming'}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 700 }}>
                            Prediction →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
