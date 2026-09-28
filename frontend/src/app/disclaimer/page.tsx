import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Football Prediction & Data Disclaimer — FootballPredict',
  description: 'Mathematical modeling, prediction estimates, and statistical information disclaimer for FootballPredict.',
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
          Football Prediction &amp; Data Disclaimer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: September 2026
        </p>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Statistical &amp; Informational Purpose
          </h2>
          <p>
            All mathematical models, win probabilities, Poisson goal distributions, tactical profiles, and historical performance statistics published on <strong>FootballPredict</strong> are algorithmic estimates generated for statistical study, football analysis, and entertainment discussion. Football matches are inherently unpredictable, and model outputs are not guarantees of future match outcomes.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Not a Bookmaker or Gambling Operator
          </h2>
          <p>
            FootballPredict is strictly an independent football analytics and statistical insights platform. <strong>FootballPredict is not a bookmaker, betting operator, or gambling service.</strong> We do not accept bets, facilitate wagers, operate a sportsbook, handle deposits, hold player funds, or provide financial winnings.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Non-Monetary Community Predictions
          </h2>
          <p>
            All community prediction activities and leaderboard rankings on FootballPredict are 100% non-monetary virtual engagement features. Points awarded on leaderboards have no cash value and cannot be converted into real currency or financial compensation.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Limitation of Liability
          </h2>
          <p>
            Past statistical accuracy and historical model performance do not guarantee future results. Users are solely responsible for how they interpret and use public football data. FootballPredict assumes no liability for decisions made based on statistical projections or data displayed on this website.
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
