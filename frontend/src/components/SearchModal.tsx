'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { searchFootballEntities } from '@/lib/api';
import { getMatchPredictionUrl, getTeamUrl, getLeagueUrl } from '@/lib/slugs';
import { Match } from '@/lib/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'teams' | 'leagues' | 'matches'>('all');
  const [results, setResults] = useState<{
    teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number }>;
    leagues: Array<{ id: number; name: string; code: string; country: string; flag: string }>;
    matches: Match[];
  }>({ teams: [], leagues: [], matches: [] });

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRequestIdRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setResults({ teams: [], leagues: [], matches: [] });
      setError(false);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const executeSearch = useCallback((searchQuery: string) => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setResults({ teams: [], leagues: [], matches: [] });
      setLoading(false);
      setError(false);
      return;
    }

    const currentRequestId = ++searchRequestIdRef.current;
    setLoading(true);
    setError(false);

    searchFootballEntities(cleanQuery)
      .then((res) => {
        // Only accept if this is the most recent request
        if (currentRequestId === searchRequestIdRef.current) {
          setResults({
            teams: res?.teams || [],
            leagues: res?.leagues || [],
            matches: res?.matches || [],
          });
          setSelectedIndex(-1);
        }
      })
      .catch((err) => {
        if (currentRequestId === searchRequestIdRef.current) {
          console.error('Search API error:', err);
          setError(true);
        }
      })
      .finally(() => {
        if (currentRequestId === searchRequestIdRef.current) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeSearch(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, executeSearch]);

  // Flattened active results list for keyboard navigation
  const visibleItems = React.useMemo(() => {
    const items: Array<{ type: 'team' | 'league' | 'match'; url: string; label: string }> = [];
    if (activeFilter === 'all' || activeFilter === 'teams') {
      results.teams.forEach((t) => items.push({ type: 'team', url: getTeamUrl(t.name), label: t.name }));
    }
    if (activeFilter === 'all' || activeFilter === 'leagues') {
      results.leagues.forEach((l) => items.push({ type: 'league', url: getLeagueUrl(l.name, l.code), label: l.name }));
    }
    if (activeFilter === 'all' || activeFilter === 'matches') {
      results.matches.forEach((m) => items.push({ type: 'match', url: getMatchPredictionUrl(m), label: `${m.home_team?.name} vs ${m.away_team?.name}` }));
    }
    return items;
  }, [activeFilter, results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < visibleItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : visibleItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < visibleItems.length) {
        e.preventDefault();
        router.push(visibleItems[selectedIndex].url);
        onClose();
      }
    }
  };

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
            placeholder="Search teams (Arsenal), leagues (Premier League), or matches (Arsenal vs Chelsea)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
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
                onClick={() => { setActiveFilter(cat); setSelectedIndex(-1); }}
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
            gap: '0.85rem',
          }}
        >
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
              <div style={{ fontWeight: 600 }}>Searching teams, leagues &amp; matches...</div>
            </div>
          )}

          {error && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <div style={{ fontWeight: 700 }}>Search is temporarily unavailable.</div>
              <button
                onClick={() => executeSearch(query)}
                className="fp-btn-secondary"
                style={{ marginTop: '0.75rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && query.trim().length < 2 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>⚽</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Search Teams, Competitions &amp; Fixtures</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                Type at least 2 letters to search clubs (e.g. &ldquo;Arsenal&rdquo;), leagues (&ldquo;Premier League&rdquo;), or matches (&ldquo;Arsenal vs Chelsea&rdquo;).
              </div>
            </div>
          )}

          {!loading && !error && query.trim().length >= 2 && totalResults === 0 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>No results found for &ldquo;{query}&rdquo;</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                Try checking the spelling or searching by club name, league, or fixture.
              </div>
            </div>
          )}

          {/* Teams Group */}
          {!loading && !error && (activeFilter === 'all' || activeFilter === 'teams') && results.teams.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                ⚽ Clubs &amp; Teams
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.45rem' }}>
                {results.teams.map((t) => (
                  <Link
                    key={t.id}
                    href={getTeamUrl(t.name)}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.8rem',
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
                      <Image src={t.crest} alt={t.name} width={26} height={26} style={{ objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          {!loading && !error && (activeFilter === 'all' || activeFilter === 'leagues') && results.leagues.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                🏆 Competitions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.45rem' }}>
                {results.leagues.map((l) => (
                  <Link
                    key={l.id}
                    href={getLeagueUrl(l.name, l.code)}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:border-[var(--accent-blue)]"
                  >
                    <span style={{ fontSize: '1.25rem' }}>{l.flag || '🏆'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          {!loading && !error && (activeFilter === 'all' || activeFilter === 'matches') && results.matches.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                🎯 Match Predictions &amp; Fixtures
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {results.matches.map((m) => {
                  const hName = m.home_team?.short_name || m.home_team?.name || 'Home';
                  const aName = m.away_team?.short_name || m.away_team?.name || 'Away';
                  const predUrl = getMatchPredictionUrl(m);

                  return (
                    <Link
                      key={m.id}
                      href={predUrl}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⚽</span>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {hName} vs {aName}
                        </div>
                        {m.league && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="hidden sm:inline">
                            · {m.league.name}
                          </span>
                        )}
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
