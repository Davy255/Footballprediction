import React from 'react';

export default function RootLoading() {
  return (
    <div
      className="container"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem 1rem',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-blue)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-hidden="true"
      />
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        Loading football analytics &amp; predictions...
      </div>
    </div>
  );
}
