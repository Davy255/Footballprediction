'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const POPULAR_SEARCH_PRESETS = [
  'Arsenal',
  'Real Madrid',
  'Manchester City',
  'Barcelona',
  'Bayern Munich',
  'Liverpool',
  'Premier League',
  'Champions League',
  'La Liga',
];

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
  const resultsListRef = useRef<HTMLDivElement>(null);
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

  // 300ms debounce interval for balanced responsiveness and network efficiency
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, executeSearch]);

  // Flattened active results list for keyboard navigation
  const visibleItems = useMemo(() => {
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

  // Auto-scroll the selected element into view during keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && resultsListRef.current) {
      const selectedEl = resultsListRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

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
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search teams, leagues, or fixtures..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            aria-label="Search query"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
                minWidth: '32px',
                minHeight: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'color 0.15s ease',
              }}
              className="hover:text-[var(--text-primary)]"
              aria-label="Clear search input"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close search modal"
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
          role="tablist"
          aria-label="Filter search results by type"
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
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => { setActiveFilter(cat); setSelectedIndex(-1); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid var(--color-brand-emerald)' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: isActive ? 'var(--color-brand-emerald)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  minHeight: '36px',
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} {query.trim().length >= 2 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={resultsListRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
          role="region"
          aria-live="polite"
        >
          {loading && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg
                style={{
                  width: '28px',
                  height: '28px',
                  margin: '0 auto 0.6rem',
                  display: 'block',
                  animation: 'spin 1s linear infinite',
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brand-emerald)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Searching teams, leagues &amp; fixtures...
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--accent-red)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.6rem', display: 'block' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Search is temporarily unavailable.</div>
              <button
                type="button"
                onClick={() => executeSearch(query)}
                className="fp-btn-secondary"
                style={{ marginTop: '0.85rem', padding: '0.5rem 1.1rem', fontSize: '0.82rem', minHeight: '44px' }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && query.trim().length < 2 && (
            <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>⚽</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Search Teams, Competitions &amp; Fixtures</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                Type at least 2 letters to search clubs, leagues, or matches.
              </div>

              {/* Popular Search Presets */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Popular Searches
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'center' }}>
                  {POPULAR_SEARCH_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuery(preset)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minHeight: '36px',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[var(--color-brand-emerald)] hover:text-[var(--color-brand-emerald)]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && query.trim().length >= 2 && totalResults === 0 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.6rem', display: 'block', opacity: 0.6 }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
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
                ⚽ Clubs &amp; Teams ({results.teams.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.45rem' }}>
                {results.teams.map((t, tIdx) => {
                  const itemIndex = activeFilter === 'all' ? tIdx : activeFilter === 'teams' ? tIdx : -1;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <Link
                      key={t.id}
                      href={getTeamUrl(t.name)}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      data-selected={isSelected ? 'true' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
                        border: isSelected ? '1px solid var(--color-brand-emerald)' : '1px solid var(--border-color)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s ease',
                        minHeight: '44px',
                      }}
                      className="hover:border-[var(--color-brand-emerald)]"
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Leagues Group */}
          {!loading && !error && (activeFilter === 'all' || activeFilter === 'leagues') && results.leagues.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                🏆 Competitions ({results.leagues.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.45rem' }}>
                {results.leagues.map((l, lIdx) => {
                  const itemIndex =
                    activeFilter === 'all'
                      ? results.teams.length + lIdx
                      : activeFilter === 'leagues'
                      ? lIdx
                      : -1;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <Link
                      key={l.id}
                      href={getLeagueUrl(l.name, l.code)}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      data-selected={isSelected ? 'true' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
                        border: isSelected ? '1px solid var(--color-brand-emerald)' : '1px solid var(--border-color)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s ease',
                        minHeight: '44px',
                      }}
                      className="hover:border-[var(--color-brand-emerald)]"
                    >
                      <span style={{ fontSize: '1.25rem' }}>{l.flag || '🏆'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.country}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matches Group */}
          {!loading && !error && (activeFilter === 'all' || activeFilter === 'matches') && results.matches.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                🎯 Match Predictions &amp; Fixtures ({results.matches.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {results.matches.map((m, mIdx) => {
                  const hName = m.home_team?.short_name || m.home_team?.name || 'Home';
                  const aName = m.away_team?.short_name || m.away_team?.name || 'Away';
                  const predUrl = getMatchPredictionUrl(m);
                  const itemIndex =
                    activeFilter === 'all'
                      ? results.teams.length + results.leagues.length + mIdx
                      : activeFilter === 'matches'
                      ? mIdx
                      : -1;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <Link
                      key={m.id}
                      href={predUrl}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      data-selected={isSelected ? 'true' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
                        border: isSelected ? '1px solid var(--color-brand-emerald)' : '1px solid var(--border-color)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                        minHeight: '44px',
                      }}
                      className="hover:border-[var(--color-brand-emerald)]"
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
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: 'var(--color-brand-emerald)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          flexShrink: 0,
                        }}
                      >
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
