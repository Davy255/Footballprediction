'use client';

import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Match Analytics & Insights 📊</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed performance metrics and statistical breakdown of match predictions across major leagues.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Prediction Accuracy Rating</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-green)', margin: '0.4rem 0' }}>
            58.4%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Overall 1X2 outcome accuracy on 2024–2026 European league matches.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Statistical Database Depth</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.4rem 0' }}>
            87,000+ Matches
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Historical match database spanning 8 top European divisions across 33 seasons.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Metrics Analyzed</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.4rem 0' }}>
            19 Indicators
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Elo rating differentials, 5/10 match rolling form, home/away goal ratios, and head-to-head records.
          </p>
        </div>
      </div>

      {/* Model Strategy Grid */}
      <div className="grid-2col" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>
            📊 How FootballPredict Analysis Works
          </h2>
          <div style={{ display: 'grid', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>1. Dynamic Elo Strength Ratings:</strong>
              <p>Calculates team strength ratings updated after every official match result to reflect current quality.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>2. Sliding Form Indicators:</strong>
              <p>Evaluates goal differentials, clean sheets, and points earned over 5-match and 10-match sliding windows.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>3. Outcome Percentage Projections:</strong>
              <p>Combines home advantage factors, head-to-head history, and team form to calculate Win/Draw/Loss probability percentages and projected scorelines.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
            📈 Accuracy Breakdown by Outcome Type
          </h2>
          <div style={{ display: 'grid', gap: '0.8rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Home Win Prediction</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>66.2%</span>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '66.2%', height: '100%', background: 'var(--accent-green)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Away Win Prediction</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>58.1%</span>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '58.1%', height: '100%', background: 'var(--accent-blue)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Draw Prediction</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>38.4%</span>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '38.4%', height: '100%', background: 'var(--accent-amber)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
