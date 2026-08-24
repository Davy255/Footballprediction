'use client';

import React, { useState } from 'react';

export interface Player {
  name: string;
  number: number;
  pos: string;
  rating: number;
  goals?: number;
  assists?: number;
  tackles?: number;
  key_passes?: number;
  shots?: number;
  yellow_cards?: number;
  x?: number;
  y?: number;
  team?: string;
  is_home?: boolean;
}

export interface TeamLineup {
  team: string;
  formation: string;
  is_home: boolean;
  starting_xi: Player[];
  bench: Player[];
}

export interface LineupData {
  home: TeamLineup;
  away: TeamLineup;
  leaders?: {
    top_scorers: Player[];
    top_playmakers: Player[];
    top_defenders: Player[];
    highest_rated: Player[];
  };
}

interface TacticalPitchProps {
  lineupData?: LineupData;
  homeName: string;
  awayName: string;
  homeFormation?: string;
  awayFormation?: string;
  homeManager?: string;
  awayManager?: string;
}

function getRatingClass(r: number): string {
  if (r >= 7.8) return 'rating-super';
  if (r >= 7.3) return 'rating-high';
  if (r >= 6.8) return 'rating-med';
  return 'rating-low';
}

export default function TacticalPitch({
  lineupData,
  homeName,
  awayName,
  homeFormation = '4-2-3-1',
  awayFormation = '4-3-3',
  homeManager,
  awayManager,
}: TacticalPitchProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const homeLineup = lineupData?.home;
  const awayLineup = lineupData?.away;

  const hPlayers = homeLineup?.starting_xi || [];
  const aPlayers = awayLineup?.starting_xi || [];
  const hBench = homeLineup?.bench || [];
  const aBench = awayLineup?.bench || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Tactical Summary Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Home Tactical Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.88rem' }}>{homeName}</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            background: 'rgba(56,189,248,0.15)',
            color: '#38bdf8',
            fontWeight: 800,
            border: '1px solid rgba(56,189,248,0.3)',
          }}>
            {homeFormation}
          </span>
          {homeManager && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>👔 {homeManager}</span>
          )}
        </div>

        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          ⚡ Confirmed / Projected Starting XI
        </div>

        {/* Away Tactical Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {awayManager && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>👔 {awayManager}</span>
          )}
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            background: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            fontWeight: 800,
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            {awayFormation}
          </span>
          <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.88rem' }}>{awayName}</span>
        </div>
      </div>

      {/* 🏟️ 2D Interactive Football Pitch */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        background: 'linear-gradient(180deg, #154522 0%, #1e5a2e 50%, #154522 100%)',
        borderRadius: '16px',
        border: '3px solid rgba(255,255,255,0.25)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        
        {/* Grass Pitch Stripes */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 52px, transparent 52px, transparent 104px)',
          pointerEvents: 'none',
        }} />

        {/* Outer Pitch Border Line */}
        <div style={{ position: 'absolute', inset: '12px', border: '2px solid rgba(255,255,255,0.45)', borderRadius: '6px', pointerEvents: 'none' }} />

        {/* Halfway Line */}
        <div style={{ position: 'absolute', left: '12px', right: '12px', top: '50%', height: '2px', background: 'rgba(255,255,255,0.45)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />

        {/* Center Circle */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '100px', height: '100px',
          border: '2px solid rgba(255,255,255,0.45)', borderRadius: '50%',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />
        {/* Center Spot */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '6px', height: '6px', background: 'rgba(255,255,255,0.7)',
          borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />

        {/* Top Penalty Box (Home Goal Area) */}
        <div style={{
          position: 'absolute', left: '26%', right: '26%', top: '12px', height: '80px',
          border: '2px solid rgba(255,255,255,0.45)', borderTop: 'none', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '38%', right: '38%', top: '12px', height: '35px',
          border: '2px solid rgba(255,255,255,0.45)', borderTop: 'none', pointerEvents: 'none',
        }} />

        {/* Bottom Penalty Box (Away Goal Area) */}
        <div style={{
          position: 'absolute', left: '26%', right: '26%', bottom: '12px', height: '80px',
          border: '2px solid rgba(255,255,255,0.45)', borderBottom: 'none', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '38%', right: '38%', bottom: '12px', height: '35px',
          border: '2px solid rgba(255,255,255,0.45)', borderBottom: 'none', pointerEvents: 'none',
        }} />

        {/* Home Players */}
        {hPlayers.map((player, idx) => {
          const posX = player.x ?? 50;
          const posY = player.y ?? (8 + idx * 4);
          const isSelected = selectedPlayer?.name === player.name;

          return (
            <div
              key={`h-${player.name}-${idx}`}
              onClick={() => setSelectedPlayer(player)}
              style={{
                position: 'absolute',
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isSelected ? 20 : 10,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${player.name}'s stats`}
            >
              {/* Jersey Node */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isSelected ? '#38bdf8' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                border: '2px solid #ffffff',
                boxShadow: isSelected ? '0 0 14px #38bdf8' : '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
              }}>
                {player.number}
              </div>

              {/* Player Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.75)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.66rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '90px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {player.name.split(' ').pop()}
              </div>

              {/* Rating Tag */}
              <div style={{
                marginTop: '1px',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '0 3px',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.85)',
                color: player.rating >= 7.5 ? '#4ade80' : '#facc15',
              }}>
                ⭐ {player.rating.toFixed(1)}
              </div>
            </div>
          );
        })}

        {/* Away Players */}
        {aPlayers.map((player, idx) => {
          const posX = player.x ?? 50;
          const posY = player.y ?? (92 - idx * 4);
          const isSelected = selectedPlayer?.name === player.name;

          return (
            <div
              key={`a-${player.name}-${idx}`}
              onClick={() => setSelectedPlayer(player)}
              style={{
                position: 'absolute',
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isSelected ? 20 : 10,
                transition: 'transform 0.15s ease',
              }}
              title={`Click for ${player.name}'s stats`}
            >
              {/* Jersey Node */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isSelected ? '#f87171' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: '2px solid #ffffff',
                boxShadow: isSelected ? '0 0 14px #f87171' : '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.78rem',
              }}>
                {player.number}
              </div>

              {/* Player Name Tag */}
              <div style={{
                marginTop: '2px',
                background: 'rgba(0,0,0,0.75)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: '#ffffff',
                fontSize: '0.66rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                maxWidth: '90px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {player.name.split(' ').pop()}
              </div>

              {/* Rating Tag */}
              <div style={{
                marginTop: '1px',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '0 3px',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.85)',
                color: player.rating >= 7.5 ? '#4ade80' : '#facc15',
              }}>
                ⭐ {player.rating.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 Selected Player Details Popover Card */}
      {selectedPlayer && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-blue)',
          borderRadius: '12px',
          padding: '1rem 1.2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          <button
            onClick={() => setSelectedPlayer(null)}
            style={{
              position: 'absolute', right: '12px', top: '12px',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent-blue)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.95rem'
            }}>
              {selectedPlayer.number}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {selectedPlayer.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Position: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPlayer.pos}</span> · 
                Rating: <span style={{ fontWeight: 800, color: '#4ade80' }}>⭐ {selectedPlayer.rating.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '0.5rem',
            textAlign: 'center',
          }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.45rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⚽ Goals</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.goals ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.45rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🎯 Assists</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.assists ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.45rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🛡️ Tackles/g</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.tackles ?? 1.5}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.45rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⚡ Key Passes</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.key_passes ?? 1.2}</div>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', padding: '0.45rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🟨 Cards</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPlayer.yellow_cards ?? 1}</div>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Substitutes & Bench Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        
        {/* Home Bench */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🔄</span> {homeName} Substitutes Bench
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {hBench.map((p, idx) => (
              <div key={`hb-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#38bdf8', marginRight: '6px' }}>#{p.number}</strong> {p.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {p.pos} · ⭐ {p.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Away Bench */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🔄</span> {awayName} Substitutes Bench
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {aBench.map((p, idx) => (
              <div key={`ab-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#f87171', marginRight: '6px' }}>#{p.number}</strong> {p.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {p.pos} · ⭐ {p.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}