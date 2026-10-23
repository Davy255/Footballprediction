'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchModal from '@/components/SearchModal';

export default function NotFound() {
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/fixtures?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setShowSearchModal(true);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '580px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚽ 🔍</div>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: '1.85rem',
            color: 'var(--text-primary)',
            margin: '0 0 0.6rem 0',
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.94rem',
            lineHeight: 1.6,
            margin: '0 0 1.5rem 0',
          }}
        >
          The match prediction, team profile, league, or page you are looking for does not exist or may have been relocated.
        </p>

        {/* Search bar directly on 404 page */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '440px',
            margin: '0 auto 1.8rem auto',
          }}
        >
          <input
            type="text"
            placeholder="Search team, league, or fixture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.95rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
              minHeight: '44px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--accent-blue)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Search
          </button>
        </form>

        {/* Primary Helpful Navigation Destinations */}
        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/football-predictions-today"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 800,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            🎯 Today&apos;s Predictions
          </Link>
          <Link
            href="/fixtures"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            ⚽ Fixtures
          </Link>
          <Link
            href="/leagues"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            🏆 Leagues
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            🏠 Home
          </Link>
        </div>
      </div>

      {showSearchModal && (
        <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      )}
    </div>
  );
}
