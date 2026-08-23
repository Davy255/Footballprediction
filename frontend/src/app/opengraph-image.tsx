import { ImageResponse } from 'next/og';

export const alt = 'FootballPredict — Match Analytics & Multi-Market Predictions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px',
        }}
      >
        {/* Background Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.25)',
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.22)',
            filter: 'blur(90px)',
          }}
        />

        {/* Center Card Content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '28px',
          }}
        >
          {/* Football Icon Badge */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '56px',
              boxShadow: '0 12px 36px rgba(37, 99, 235, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            ⚽
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '62px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1.1,
              }}
            >
              FootballPredict
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#94a3b8',
                fontWeight: 600,
                marginTop: '6px',
                letterSpacing: '0.02em',
              }}
            >
              MATCH INTELLIGENCE &amp; STATISTICAL PROBABILITY HUB
            </div>
          </div>
        </div>

        {/* Catchphrase */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#f8fafc',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.35,
            marginBottom: '36px',
          }}
        >
          Data-Driven Match Analytics &amp; Multi-Market Statistical Projections
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📈</span> 1X2 Probabilities
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#6ee7b7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🎯</span> Over/Under 2.5 Goals
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#fcd34d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🥅</span> BTTS Analytics
          </div>

          <div
            style={{
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#d8b4fe',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>👑</span> Leaderboard Rankings
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            fontSize: '16px',
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          footballprediction-lovat.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
