import { ImageResponse } from 'next/og';
import { getLeagueDataBySlug } from '@/lib/slugs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'FootballPredict League Standings & Predictions';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data: any = null;
  try {
    data = await getLeagueDataBySlug(slug);
  } catch (e) {
    console.error('Error in league og image:', e);
  }

  const LN = data?.league?.name || 'Football League';
  const country = data?.league?.country || 'Global';
  const teamsCount = data?.teams?.length || 20;
  const upcomingCount = data?.upcomingMatches?.length || 0;
  const emblem = data?.league?.emblem;
  const leaderName = data?.standings?.[0]?.team?.name;
  const leaderPoints = data?.standings?.[0]?.points;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 50%, #1e1b4b 100%)',
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
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '20px',
              fontWeight: 800,
              color: '#93c5fd',
              letterSpacing: '1px',
            }}
          >
            <span>⚽</span>
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
            <span>🌍</span>
            <span>{country}</span>
          </div>
        </div>

        {/* Center League Title & Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {emblem ? (
            <img src={emblem} alt={LN} width="110" height="110" style={{ objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', fontSize: '80px', lineHeight: 1 }}>🏆</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '48px', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
              {LN}
            </div>
            <div style={{ display: 'flex', fontSize: '20px', color: '#93c5fd', fontWeight: 700, marginTop: '6px' }}>
              Predictions · Live Standings · Upcoming Fixtures · Statistical Analysis
            </div>
          </div>
        </div>

        {/* League Info Cards */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {leaderName && (
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '16px', padding: '18px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', fontSize: '14px', color: '#fde047', fontWeight: 800, textTransform: 'uppercase' }}>Current Leader</div>
              <div style={{ display: 'flex', fontSize: '26px', fontWeight: 900, color: '#f8fafc', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leaderName}
              </div>
              <div style={{ display: 'flex', fontSize: '15px', color: '#fde047', fontWeight: 700, marginTop: '2px' }}>
                {leaderPoints} Points
              </div>
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>Clubs</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#60a5fa', marginTop: '4px' }}>{teamsCount}</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#94a3b8' }}>Participating</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#86efac', fontWeight: 800, textTransform: 'uppercase' }}>Predictions</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>{upcomingCount}</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#94a3b8' }}>Upcoming Round</div>
          </div>
        </div>

        {/* Footer Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>
          <span>Real-time Table Standings, Win Probabilities &amp; Tactical Insights</span>
          <span style={{ color: '#38bdf8' }}>footballprediction-lovat.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
