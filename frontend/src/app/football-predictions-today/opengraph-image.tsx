import { ImageResponse } from 'next/og';
import { fetchMatchesFeed } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Football Predictions Today — Match Predictions & Win Probabilities';

export default async function Image() {
  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const todayIsoDate = now.toISOString().split('T')[0];

  let matches: any[] = [];
  try {
    const feed = await fetchMatchesFeed();
    matches = feed?.matches || [];
  } catch (err) {
    console.error('Error in today og image:', err);
  }

  const todayMatches: any[] = [];
  for (const m of matches) {
    if (!m.utc_date) continue;
    const mDate = new Date(m.utc_date);
    const isSameDate = mDate.toDateString() === now.toDateString();
    const isLive = ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes((m.status || '').toUpperCase());
    if (isSameDate || isLive || m.utc_date.startsWith(todayIsoDate)) {
      todayMatches.push(m);
    }
  }

  const displayMatches = todayMatches.length > 0 ? todayMatches : matches.slice(0, 10);
  const totalMatches = displayMatches.length;

  const leaguesSet = new Set();
  for (const m of displayMatches) {
    if (m.league?.code || m.league?.name) {
      leaguesSet.add(m.league.code || m.league.name);
    }
  }
  const leaguesCount = leaguesSet.size || 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #0b0f19 100%)',
          padding: '48px 56px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Branding Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '20px',
              fontWeight: 800,
              color: '#86efac',
              letterSpacing: '1px',
            }}
          >
            <span>🎯</span>
            <span>FOOTBALLPREDICT</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            <span>📅</span>
            <span>{todayFormatted}</span>
          </div>
        </div>

        {/* Center Title Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: '54px', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-1px' }}>
            FOOTBALL PREDICTIONS TODAY
          </div>
          <div style={{ display: 'flex', fontSize: '22px', color: '#93c5fd', fontWeight: 700, marginTop: '10px' }}>
            Daily Win Probabilities · Projected Scorelines · Statistical Form Analysis
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Matches Featured</div>
            <div style={{ display: 'flex', fontSize: '40px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{totalMatches}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>Leagues Active</div>
            <div style={{ display: 'flex', fontSize: '40px', fontWeight: 900, color: '#60a5fa', marginTop: '4px' }}>{leaguesCount}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#86efac', fontWeight: 800, textTransform: 'uppercase' }}>Prediction Engine</div>
            <div style={{ display: 'flex', fontSize: '40px', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>AI Powered</div>
          </div>
        </div>

        {/* Footer Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>
          <span>Premier League, Champions League, La Liga, Serie A &amp; Worldwide Matches</span>
          <span style={{ color: '#86efac' }}>footballprediction-lovat.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
