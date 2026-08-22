'use client';

import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'var(--bg-modal, #0f1c35)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: '20px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.15)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>
              📖
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                How to Play & Prediction Guide
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Master football predictions, AI analytics, and climb the leaderboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              width: '32px', height: '32px', borderRadius: '50%',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Section 1: Making a Prediction */}
          <div style={{
            background: 'var(--bg-card-hover, rgba(22,34,58,0.7))',
            border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                1. How to Make a Prediction
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.8rem 0' }}>
              Select any upcoming or live match from the homepage or fixtures list. Click the fixture to open the <strong>All-In-One Match Hub</strong>:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '0.2rem' }}>Home Win (1)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predict the home team to win</div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '0.2rem' }}>Draw (X)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predict a tie scoreline</div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.2rem' }}>Away Win (2)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predict the away team to win</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.8rem', margin: '0.8rem 0 0 0' }}>
              💡 <em>Optional: Use the score counters to predict the exact scoreline (e.g., 2 - 1) for extra bonus points!</em>
            </p>
          </div>

          {/* Section 2: Points & Scoring System */}
          <div style={{
            background: 'var(--bg-card-hover, rgba(22,34,58,0.7))',
            border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🏆</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                2. Automated Points & Scoring Rules
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.8rem 0' }}>
              As soon as a match ends, our automated system scores your prediction and deposits points directly into your account:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--accent-green)' }}>🎯 Exact Scoreline Bonus</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>You predicted both exact goals and the winner (e.g. 2-1)</div>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-green)' }}>
                  +5 Pts
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--accent-blue)' }}>⚡ 1X2 Correct Match Outcome</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>You got the winner or draw right (Home / Draw / Away)</div>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-blue)' }}>
                  +3 Pts
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#a855f7' }}>⚽ Both Teams To Score (BTTS)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Correctly predicted Yes or No for both teams scoring</div>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#a855f7' }}>
                  +2 Pts
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#f59e0b' }}>📊 Over / Under 2.5 Goals</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Correctly predicted Over 2.5 or Under 2.5 goals</div>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#f59e0b' }}>
                  +2 Pts
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.9rem', borderRadius: '10px',
                background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#06b6d4' }}>🛡️ Double Chance (1X / X2 / 12)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Correctly covered two of the three outcomes</div>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#06b6d4' }}>
                  +1 Pt
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)', padding: '0.6rem 0.9rem', borderRadius: '8px',
                textAlign: 'center', fontSize: '0.78rem', color: '#22c55e', fontWeight: 700,
              }}>
                🏆 Max Potential Points Per Match: Up to +13 Points! Match fixtures update in real-time.
              </div>
            </div>
          </div>

          {/* Section 3: Understanding Match Probabilities & Analytics */}
          <div style={{
            background: 'var(--bg-card-hover, rgba(22,34,58,0.7))',
            border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                3. Understanding Match Probabilities & Market Analytics
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.8rem 0' }}>
              Our statistical intelligence engine analyzes 87,000+ historical database fixtures, team power ratings, and recent goal form:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>⚽ Over / Under 2.5 Goals</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Probability of 3 or more total match goals being scored.</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>🥅 Both Teams To Score (BTTS)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Probability that both clubs find the net at least once.</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>🛡️ Double Chance (1X / X2)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High-safety coverage combining Win + Draw.</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>⚔️ Head-to-Head (H2H)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Direct past encounters, previous scorelines, and win rates.</div>
              </div>
            </div>
          </div>

          {/* Section 4: Global Leaderboard */}
          <div style={{
            background: 'var(--bg-card-hover, rgba(22,34,58,0.7))',
            border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>👑</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                4. Climbing the Global Leaderboard
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Points earned from your correct predictions are tallied on the global leaderboard. Track your rank, prediction accuracy %, and correct score milestones in real-time under the <strong>Leaderboard</strong> and <strong>My Picks</strong> tabs!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.2)',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
        }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '0.6rem 2rem', fontSize: '0.9rem' }}
          >
            Got It, Let's Play! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
