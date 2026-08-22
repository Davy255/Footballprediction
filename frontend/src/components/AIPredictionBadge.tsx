'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────── */
interface MatchHistoryItem {
  result: 'W' | 'D' | 'L';
  score: string;
  opponent: string;
  is_home: boolean;
  date: string;
}

interface AnalysisPayload {
  v: number;
  home_name: string;
  away_name: string;
  summary: string;
  probs: { home_pct: number; draw_pct: number; away_pct: number };
  odds: { home: number; draw: number; away: number };
  score: { home: number; away: number };
  home_stats: { elo: number; gf5: number; ga5: number; pts5: number; gf10: number; ga10: number; form: string; last5_matches?: MatchHistoryItem[] };
  away_stats: { elo: number; gf5: number; ga5: number; pts5: number; gf10: number; ga10: number; form: string; last5_matches?: MatchHistoryItem[] };
  h2h: { total: number; home_wins: number; draws: number; away_wins: number; avg_goals: number; btts_pct: number; recent_scores: string[] };
  markets: {
    over25_pct: number; over25_odds: number;
    under25_pct: number; under25_odds: number;
    btts_yes_pct: number; btts_yes_odds: number;
    btts_no_pct: number; btts_no_odds: number;
    dc_1x_pct: number; dc_1x_odds: number;
    dc_x2_pct: number; dc_x2_odds: number;
    dc_12_pct: number; dc_12_odds: number;
  };
  picks: { primary: string; primary_odds: number; safety: string; safety_odds: number; goal_pick: string; goal_odds: number; scoreline: string };
}

/* ─── Sub-components ─────────────────────────────────────── */

function ProbBar({ label, pct, color, odds }: { label: string; pct: number; color: string; odds: number }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
            @ {typeof odds === 'number' ? odds.toFixed(2) : odds}
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 900, color, fontFamily: 'Outfit, sans-serif' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: '8px', background: 'var(--bg-card-hover)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function StatRow({ label, homeVal, awayVal, higherIsBetter = true, isElo = false }: {
  label: string; homeVal: number; awayVal: number; higherIsBetter?: boolean; isElo?: boolean;
}) {
  const homeWins = higherIsBetter ? homeVal >= awayVal : homeVal <= awayVal;
  const winColor = 'var(--accent-green)';
  const neutral = 'var(--text-primary)';
  const formatVal = (v: number) => isElo ? Math.round(v).toString() : (typeof v === 'number' ? v.toFixed(2) : v);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', padding: '0.45rem 0',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: homeWins ? winColor : neutral, textAlign: 'left' }}>
        {formatVal(homeVal)}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 0.5rem' }}>{label}</span>
      <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: !homeWins ? winColor : neutral, textAlign: 'right' }}>
        {formatVal(awayVal)}
      </span>
    </div>
  );
}

function FormGuideColumn({ teamName, matches, color }: { teamName: string; matches?: MatchHistoryItem[]; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: '220px', background: 'var(--bg-card-hover)', borderRadius: '12px', padding: '0.85rem', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color, marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{teamName}</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Last 5 Matches</span>
      </div>

      {matches && matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {matches.map((m, idx) => {
            const resColor = m.result === 'W' ? '#10b981' : m.result === 'D' ? '#f59e0b' : '#ef4444';
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: '0.75rem', padding: '0.25rem 0.4rem', borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '4px',
                    fontSize: '0.65rem', fontWeight: 900,
                    background: `${resColor}25`, color: resColor,
                    border: `1px solid ${resColor}50`,
                  }}>
                    {m.result}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    vs {m.opponent} {m.is_home ? '(H)' : '(A)'}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                  {m.score}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.6rem 0' }}>
          Season opener — first match of campaign
        </div>
      )}
    </div>
  );
}

function MarketCard({ label, pct, odds }: { label: string; pct: number; odds: number }) {
  const color = pct >= 60 ? 'var(--accent-green)' : pct >= 45 ? 'var(--accent-amber)' : 'var(--accent-red)';
  return (
    <div style={{
      background: 'var(--bg-card-hover)',
      border: `1px solid ${pct >= 55 ? color + '40' : 'var(--border-color)'}`,
      borderRadius: '12px', padding: '0.9rem',
      display: 'flex', flexDirection: 'column', gap: '0.4rem',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>
        {pct}%
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Odds: <strong style={{ color: 'var(--text-primary)' }}>@ {typeof odds === 'number' ? odds.toFixed(2) : odds}</strong>
      </div>
      <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.2rem' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px' }} />
      </div>
    </div>
  );
}

function PickCard({ icon, label, pick, odds, accent }: { icon: string; label: string; pick: string; odds: number; accent: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}14 0%, ${accent}08 100%)`,
      border: `1px solid ${accent}30`,
      borderRadius: '12px',
      padding: '0.9rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.85rem',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${accent}20`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.1rem', lineHeight: 1.2 }}>
          {pick}
        </div>
      </div>
      <div style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 900,
        fontSize: '1.05rem', color: accent, flexShrink: 0,
      }}>
        @ {typeof odds === 'number' ? odds.toFixed(2) : odds}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
interface Props { match: Match; }

export default function AIPredictionBadge({ match }: Props) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Parse structured JSON or fall back to old text
  let analysis: AnalysisPayload | null = null;
  if (match?.prediction_description) {
    try {
      const parsed = JSON.parse(match.prediction_description);
      if (parsed.v === 2) analysis = parsed;
    } catch {
      // legacy plain text fallback
    }
  }

  const homePct = match?.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : null;
  const drawPct = match?.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : null;
  const awayPct = match?.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : null;

  if (!match || homePct == null) return null;

  const homeOdds = match.odds_home ?? analysis?.odds.home ?? (1 / (match.ai_home_prob! * 1.04));
  const drawOdds = match.odds_draw ?? analysis?.odds.draw ?? (1 / (match.ai_draw_prob! * 1.04));
  const awayOdds = match.odds_away ?? analysis?.odds.away ?? (1 / (match.ai_away_prob! * 1.04));

  const homeName = match.home_team.short_name || match.home_team.name;
  const awayName = match.away_team.short_name || match.away_team.name;

  // Determine favourite colour
  const maxPct = Math.max(homePct!, drawPct!, awayPct!);
  const favColor = homePct === maxPct ? 'var(--accent-green)' : awayPct === maxPct ? 'var(--accent-blue)' : 'var(--accent-amber)';

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {/* ── Compact Summary Bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>📊 Forecast</span>

        {/* Mini probability pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: homeName, pct: homePct, color: 'var(--accent-green)', odds: homeOdds },
            { label: 'X', pct: drawPct, color: 'var(--accent-amber)', odds: drawOdds },
            { label: awayName, pct: awayPct, color: 'var(--accent-blue)', odds: awayOdds },
          ].map((o) => (
            <div key={o.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'var(--bg-card-hover)',
              border: `1px solid ${o.pct === maxPct ? o.color + '60' : 'var(--border-color)'}`,
              borderRadius: '8px', padding: '0.2rem 0.55rem',
              boxShadow: o.pct === maxPct ? `0 0 8px ${o.color}30` : 'none',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
              <span style={{ fontWeight: 900, fontSize: '0.82rem', color: o.color, fontFamily: 'Outfit, sans-serif' }}>{o.pct}%</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@ {typeof o.odds === 'number' ? o.odds.toFixed(2) : o.odds}</span>
            </div>
          ))}
        </div>

        {/* Predicted score */}
        {match.ai_predicted_home != null && (
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: '0.88rem', color: 'var(--text-primary)',
            background: 'var(--bg-card-hover)',
            padding: '0.2rem 0.6rem', borderRadius: '8px',
            border: '1px solid var(--border-color)', flexShrink: 0,
          }}>
            {match.ai_predicted_home} – {match.ai_predicted_away}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--accent-blue)', flexShrink: 0,
            padding: '0.2rem 0',
          }}
        >
          {expanded ? '▲ Hide' : '▼ Full Analysis'}
        </button>
      </div>

      {/* ── Full Analysis Panel ── */}
      {expanded && (
        <div style={{
          marginTop: '0.75rem',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.06) 100%)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                📊 Match Tactical Analysis
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {homeName} vs {awayName}
              </div>
            </div>
            {match.ai_confidence != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Top Probability</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: favColor }}>
                  {Math.round(match.ai_confidence * 100)}%
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '1.25rem' }}>

            {!user ? (
              /* ── Auth Gate ── */
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Login to view full analysis</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Includes Elo ratings, form history, goal markets & expert picks</p>
                <Link href="/login" className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}>
                  Login Free →
                </Link>
              </div>
            ) : analysis ? (
              /* ── Rich Structured Analysis ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Summary */}
                <div style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.14)',
                  borderRadius: '10px', padding: '0.85rem 1rem',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7,
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>📋 Overview — </strong>
                  {analysis.summary}
                </div>

                {/* ── Section 1: Win Probabilities ── */}
                <div>
                  <div className="analysis-section-title">Win Probability</div>
                  <ProbBar label={`${homeName} Win`}  pct={analysis.probs.home_pct} color="var(--accent-green)" odds={analysis.odds.home} />
                  <ProbBar label="Draw (X)"            pct={analysis.probs.draw_pct} color="var(--accent-amber)" odds={analysis.odds.draw} />
                  <ProbBar label={`${awayName} Win`}   pct={analysis.probs.away_pct} color="var(--accent-blue)"  odds={analysis.odds.away} />
                </div>

                {/* ── Section 2: Team Stats ── */}
                <div>
                  <div className="analysis-section-title">Team Statistics Comparison</div>
                  {/* Column headers */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    padding: '0.3rem 0', marginBottom: '0.25rem',
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-green)' }}>{homeName}</span>
                    <span style={{ width: '80px', textAlign: 'center' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-blue)', textAlign: 'right' }}>{awayName}</span>
                  </div>
                  <StatRow label="Elo Rating"   homeVal={analysis.home_stats.elo}  awayVal={analysis.away_stats.elo} isElo={true} />
                  <StatRow label="Avg Goals (L5)" homeVal={analysis.home_stats.gf5} awayVal={analysis.away_stats.gf5} />
                  <StatRow label="Avg Conceded (L5)" homeVal={analysis.home_stats.ga5} awayVal={analysis.away_stats.ga5} higherIsBetter={false} />
                  <StatRow label="Avg Goals (L10)" homeVal={analysis.home_stats.gf10} awayVal={analysis.away_stats.gf10} />
                  <StatRow label="Pts/Game (L5)"   homeVal={analysis.home_stats.pts5}  awayVal={analysis.away_stats.pts5} />
                  {/* Form badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    {[
                      { name: homeName, form: analysis.home_stats.form, color: 'var(--accent-green)' },
                      { name: awayName, form: analysis.away_stats.form, color: 'var(--accent-blue)' },
                    ].map((t) => {
                      const fc = t.form === 'Excellent' ? '#10b981' : t.form === 'Good' ? '#3b82f6' : t.form === 'Mixed' ? '#f59e0b' : '#ef4444';
                      return (
                        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Form:</span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 800,
                            color: fc, background: fc + '18',
                            padding: '0.1rem 0.45rem', borderRadius: '6px',
                            border: `1px solid ${fc}30`,
                          }}>{t.form}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Section 3: Last 5 Match Form Guide ── */}
                <div>
                  <div className="analysis-section-title">📅 Last 5 Matches — Form Guide</div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <FormGuideColumn teamName={homeName} matches={analysis.home_stats.last5_matches} color="var(--accent-green)" />
                    <FormGuideColumn teamName={awayName} matches={analysis.away_stats.last5_matches} color="var(--accent-blue)" />
                  </div>
                </div>

                {/* ── Section 4: Head to Head ── */}
                <div>
                  <div className="analysis-section-title">
                    Head-to-Head History
                    {analysis.h2h.total > 0 && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        (last {analysis.h2h.total} meetings)
                      </span>
                    )}
                  </div>

                  {analysis.h2h.total > 0 ? (
                    <>
                      {/* H2H bar */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                            {homeName}: {analysis.h2h.home_wins}W
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {analysis.h2h.draws}D
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                            {analysis.h2h.away_wins}W: {awayName}
                          </span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                          {analysis.h2h.home_wins > 0 && (
                            <div style={{ flex: analysis.h2h.home_wins, background: 'var(--accent-green)', borderRadius: '5px 0 0 5px' }} />
                          )}
                          {analysis.h2h.draws > 0 && (
                            <div style={{ flex: analysis.h2h.draws, background: 'var(--accent-amber)' }} />
                          )}
                          {analysis.h2h.away_wins > 0 && (
                            <div style={{ flex: analysis.h2h.away_wins, background: 'var(--accent-blue)', borderRadius: '0 5px 5px 0' }} />
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '10px', padding: '0.5rem 0.9rem', flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Avg Goals</div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                            {typeof analysis.h2h.avg_goals === 'number' ? analysis.h2h.avg_goals.toFixed(2) : analysis.h2h.avg_goals}
                          </div>
                        </div>
                        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '10px', padding: '0.5rem 0.9rem', flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>BTTS Rate</div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: 'var(--accent-purple)' }}>
                            {analysis.h2h.btts_pct}%
                          </div>
                        </div>
                      </div>

                      {analysis.h2h.recent_scores.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Recent Scores</div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {analysis.h2h.recent_scores.map((s, i) => (
                              <span key={i} style={{
                                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.82rem',
                                background: 'var(--bg-card-hover)',
                                border: '1px solid var(--border-color)',
                                padding: '0.2rem 0.55rem', borderRadius: '8px',
                                color: 'var(--text-primary)',
                              }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No historical H2H data available in database — first or rare encounter.
                    </p>
                  )}
                </div>

                {/* ── Section 5: Goal Markets ── */}
                <div>
                  <div className="analysis-section-title">Goal Markets</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                    <MarketCard label="Over 2.5 Goals"  pct={analysis.markets.over25_pct}    odds={analysis.markets.over25_odds} />
                    <MarketCard label="Under 2.5 Goals" pct={analysis.markets.under25_pct}   odds={analysis.markets.under25_odds} />
                    <MarketCard label="BTTS Yes"         pct={analysis.markets.btts_yes_pct}  odds={analysis.markets.btts_yes_odds} />
                    <MarketCard label="BTTS No"          pct={analysis.markets.btts_no_pct}   odds={analysis.markets.btts_no_odds} />
                  </div>
                </div>

                {/* ── Section 6: Double Chance Markets ── */}
                <div>
                  <div className="analysis-section-title">Double Chance</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                    <MarketCard label={`1X (${homeName}/Draw)`} pct={analysis.markets.dc_1x_pct} odds={analysis.markets.dc_1x_odds} />
                    <MarketCard label="12 (Home/Away)"           pct={analysis.markets.dc_12_pct} odds={analysis.markets.dc_12_odds} />
                    <MarketCard label={`X2 (Draw/${awayName})`}  pct={analysis.markets.dc_x2_pct} odds={analysis.markets.dc_x2_odds} />
                  </div>
                </div>

                {/* ── Section 7: Expert Picks ── */}
                <div>
                  <div className="analysis-section-title">⭐ Expert Recommended Picks</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <PickCard icon="🏆" label="Primary Pick"    pick={analysis.picks.primary}   odds={analysis.picks.primary_odds}  accent="#10b981" />
                    <PickCard icon="🛡️" label="Safety Pick"     pick={`Double Chance ${analysis.picks.safety}`} odds={analysis.picks.safety_odds}  accent="#3b82f6" />
                    <PickCard icon="⚽" label="Goal Market"     pick={`${analysis.picks.goal_pick} Goals`}      odds={analysis.picks.goal_odds}    accent="#f59e0b" />
                    <PickCard icon="🎯" label="Score Projection" pick={`${homeName} ${analysis.picks.scoreline} ${awayName}`} odds={0} accent="#8b5cf6" />
                  </div>
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                  ⚠️ AI analysis is for informational purposes only. Gamble responsibly.
                </p>
              </div>

            ) : match.prediction_description ? (
              /* ── Legacy Plain Text Fallback ── */
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {match.prediction_description}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No analysis available yet — run a sync from the Admin panel.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
