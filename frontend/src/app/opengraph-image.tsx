import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'FootballPredict — Football Predictions, Stats & Analytics';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0b0f19 0%, #1e3a8a 50%, #0f172a 100%)',
          padding: '56px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Branding Pill */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '22px',
              fontWeight: 800,
              color: '#93c5fd',
              letterSpacing: '1px',
            }}
          >
            <span>⚽</span>
            <span>FOOTBALLPREDICT</span>
          </div>
        </div>

        {/* Center Hero */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: '58px', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Football Predictions, Stats &amp; Analytics
          </div>
          <div style={{ display: 'flex', fontSize: '24px', color: '#93c5fd', fontWeight: 700, marginTop: '12px' }}>
            AI-Powered Match Forecasts, Win Probabilities &amp; Live League Insights
          </div>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 20px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            🎯 1X2 Win Probabilities
          </div>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 20px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            📊 Projected Scorelines
          </div>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 20px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            🏆 League Standings
          </div>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 20px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            📈 Head to Head Analytics
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', color: '#94a3b8', fontWeight: 600 }}>
          <span>Free AI Football Predictions &amp; Analytical Insights</span>
          <span style={{ color: '#38bdf8' }}>footballprediction-lovat.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
