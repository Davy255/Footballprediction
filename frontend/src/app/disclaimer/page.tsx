import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sports Prediction Disclaimer — FootballPredict',
  description: 'Informational and entertainment disclaimer for FootballPredict.',
};

export default function DisclaimerPage() {
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
          Disclaimer &amp; Responsible Gaming
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: August 23, 2026
        </p>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. For Entertainment &amp; Informational Purposes Only
          </h2>
          <p>
            All mathematical models, match probabilities, Poisson projections, WhoScored tactical breakdowns, and historical statistics provided on <strong>FootballPredict</strong> are strictly for entertainment, statistical study, and educational discussion.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. No Gambling or Real Money Wagering
          </h2>
          <p>
            FootballPredict is not a bookmaker, betting operator, or gambling site. We do not accept bets, handle deposits, or distribute financial winnings. Points earned on our platform are virtual leaderboard scores only.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Responsible Gaming
          </h2>
          <p>
            If you choose to participate in sports wagering with licensed third-party operators in your jurisdiction, please do so responsibly and never wager more than you can afford to lose. If you or someone you know is struggling with gambling-related issues, please contact organizations such as <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>BeGambleAware.org</a> or <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>NCPG</a>.
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
