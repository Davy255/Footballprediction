'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for diagnostic purposes
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div
      className="container"
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
      role="alert"
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: '1.75rem',
            color: 'var(--text-primary)',
            margin: '0 0 0.6rem 0',
          }}
        >
          Something Went Wrong
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            margin: '0 0 1.8rem 0',
          }}
        >
          We encountered an unexpected error while loading this page. Our live data services and match models remain operational.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            🔄 Try Again
          </button>
          <Link
            href="/fixtures"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            ⚽ View Fixtures
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            🏠 Back to Home
          </Link>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.2rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          Need assistance?{' '}
          <Link href="/contact" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
            Contact our support desk
          </Link>.
        </div>
      </div>
    </div>
  );
}
