import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚽ 🔍</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#f8fafc', margin: '0 0 0.6rem 0' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.8rem 0' }}>
          The match, team profile, league, or page you are looking for does not exist or may have been moved.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/fixtures"
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
              textDecoration: 'none',
            }}
          >
            ⚽ View Today&apos;s Fixtures
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f8fafc',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
