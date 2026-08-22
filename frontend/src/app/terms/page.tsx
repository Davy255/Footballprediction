import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — FootballPredict',
  description: 'Terms of service and usage conditions for FootballPredict.',
};

export default function TermsPage() {
  return (
    <div className="container" style={{ maxWidth: '820px', margin: '2rem auto', paddingBottom: '4rem' }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: August 23, 2026
        </p>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>FootballPredict</strong>, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Nature of the Service
          </h2>
          <p>
            FootballPredict is an informational and entertainment platform providing statistical football match projections, historical performance data, and non-monetary community score prediction competitions. <strong>We do not accept real-money bets or offer gambling services.</strong>
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. User Accounts &amp; Conduct
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their account credentials. Any abusive behavior, spamming, automated scraping, or attempts to disrupt service stability may result in account suspension.
          </p>
        </section>

        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Limitation of Liability
          </h2>
          <p>
            Statistical models and predictions are for analytical purposes only. FootballPredict and its creators are not liable for any financial or personal decisions made based on information displayed on this website.
          </p>
        </section>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
