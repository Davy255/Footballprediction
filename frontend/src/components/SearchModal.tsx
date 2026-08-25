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
  const [activeFilter, setActiveFilter] = useState<'all' | 'teams' | 'leagues' | 'matches'>('all');
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2.5rem 1rem 1rem 1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search football clubs, leagues, and fixtures"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-card-hover)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-elevated)',
          }}
        >
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search clubs (Arsenal), leagues, or matches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.2rem',
              }}
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Esc
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.6rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            overflowX: 'auto',
          }}
        >
          {(['all', 'teams', 'leagues', 'matches'] as const).map((cat) => {
            const count =
              cat === 'all'
                ? totalResults
                : cat === 'teams'
                ? results.teams.length
                : cat === 'leagues'
                ? results.leagues.length
                : results.matches.length;
            const isActive = activeFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--accent-blue-bg)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} {query.trim().length >= 2 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
              <div>Searching clubs, leagues &amp; matches...</div>
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>⚽</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Instant Football Search</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Type at least 2 letters to search teams, competitions, and match predictions.
              </div>
            </div>
          )}

          {!loading && query.trim().length >= 2 && totalResults === 0 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No results found for &ldquo;{query}&rdquo;</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Try searching for a team (e.g. &ldquo;Real Madrid&rdquo;) or competition.
              </div>
            </div>
          )}

          {/* Teams Group */}
          {!loading && (activeFilter === 'all' || activeFilter === 'teams') && results.teams.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Clubs &amp; Teams
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.4rem' }}>
                {results.teams.map((t) => (
                  <Link
                    key={t.id}
                    href={getTeamUrl(t.name)}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:border-[var(--accent-blue)]"
                  >
                    {t.crest ? (
                      <Image src={t.crest} alt={t.name} width={24} height={24} style={{ objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Elo: {Math.round(t.elo_rating || 1500)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Leagues Group */}
          {!loading && (activeFilter === 'all' || activeFilter === 'leagues') && results.leagues.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Competitions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.4rem' }}>
                {results.leagues.map((l) => (
                  <Link
                    key={l.id}
                    href={getLeagueUrl(l.name, l.code)}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:border-[var(--accent-blue)]"
                  >
                    <span style={{ fontSize: '1.2rem' }}>{l.flag || '🏆'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.country}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matches Group */}
          {!loading && (activeFilter === 'all' || activeFilter === 'matches') && results.matches.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Match Predictions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {results.matches.map((m) => {
                  const hName = m.home_team?.short_name || m.home_team?.name || 'Home';
                  const aName = m.away_team?.short_name || m.away_team?.name || 'Away';
                  const predUrl = getMatchPredictionUrl(hName, aName, m.id);

                  return (
                    <Link
                      key={m.id}
                      href={predUrl}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[var(--accent-blue)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⚽</span>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {hName} vs {aName}
                        </div>
                      </div>
                      <span className="fp-badge fp-badge-blue" style={{ fontSize: '0.72rem' }}>
                        Prediction →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
