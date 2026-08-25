import { ImageResponse } from 'next/og';
import { getTeamDataBySlug } from '@/lib/slugs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'FootballPredict Team Profile & Statistics';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data: any = null;
  try {
    data = await getTeamDataBySlug(slug);
  } catch (e) {
    console.error('Error in team og image:', e);
  }

  const TN = data?.team?.name || 'Football Club';
  const compName = data?.league?.name || 'Top League';
  const stats = data?.stats || { totalPlayed: 0, wins: 0, draws: 0, losses: 0, winRate: 0, goalsFor: 0, goalsAgainst: 0, cleanSheets: 0 };
  const crest = data?.team?.crest;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0b0f19 100%)',
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
            <span>🏆</span>
            <span>{compName}</span>
          </div>
        </div>

        {/* Center Team Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {crest ? (
            <img src={crest} alt={TN} width="110" height="110" style={{ objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '55px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', fontWeight: 900 }}>
              {TN.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '48px', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
              {TN}
            </div>
            <div style={{ display: 'flex', fontSize: '20px', color: '#93c5fd', fontWeight: 700, marginTop: '6px' }}>
              Performance Analytics, Recent Form &amp; Match Predictions
            </div>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Win Rate</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{stats.winRate}%</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#86efac', fontWeight: 800, textTransform: 'uppercase' }}>Wins</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>{stats.wins}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Matches</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{stats.totalPlayed}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Goals Scored</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{stats.goalsFor}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Clean Sheets</div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{stats.cleanSheets}</div>
          </div>
        </div>

        {/* Footer Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>
          <span>Comprehensive Team Statistics, Upcoming Fixtures &amp; AI Analysis</span>
          <span style={{ color: '#38bdf8' }}>footballprediction-lovat.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
