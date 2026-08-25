import { ImageResponse } from 'next/og';
import { getMatchBySlug } from '@/lib/slugs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'FootballPredict Match Prediction & Win Probabilities';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let match: any = null;
  try {
    match = await getMatchBySlug(slug);
  } catch (e) {
    console.error('Error in match og image:', e);
  }

  const HN = match?.home_team?.short_name || match?.home_team?.name || 'Home Team';
  const AN = match?.away_team?.short_name || match?.away_team?.name || 'Away Team';
  const comp = match?.league?.name || 'Football Match';

  let ai: any = null;
  if (match?.prediction_description) {
    try { ai = JSON.parse(match.prediction_description); } catch {}
  }

  const hp = match?.ai_home_prob != null ? Math.round(match.ai_home_prob * 100) : (ai?.probs?.home_pct ?? 45);
  const dp = match?.ai_draw_prob != null ? Math.round(match.ai_draw_prob * 100) : (ai?.probs?.draw_pct ?? 27);
  const ap = match?.ai_away_prob != null ? Math.round(match.ai_away_prob * 100) : (ai?.probs?.away_pct ?? 28);

  const predHome = match?.ai_predicted_home ?? ai?.score?.home ?? 1;
  const predAway = match?.ai_predicted_away ?? ai?.score?.away ?? 1;

  const homeCrest = match?.home_team?.crest;
  const awayCrest = match?.away_team?.crest;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #0f172a 100%)',
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
            <span>{comp}</span>
          </div>
        </div>

        {/* Center Teams & Prediction Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '36px 40px',
          }}
        >
          {/* Home Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '320px', textAlign: 'center' }}>
            {homeCrest ? (
              <img src={homeCrest} alt={HN} width="96" height="96" style={{ objectFit: 'contain', marginBottom: '14px' }} />
            ) : (
              <div style={{ width: '96px', height: '96px', borderRadius: '48px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, marginBottom: '14px' }}>
                {HN.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: '32px', fontWeight: 900, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
              {HN}
            </div>
            <div style={{ display: 'flex', fontSize: '22px', fontWeight: 800, color: '#60a5fa', marginTop: '6px' }}>
              {hp}% Win
            </div>
          </div>

          {/* Center Projected Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
              PROJECTED SCORE
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '56px',
                fontWeight: 900,
                color: '#ffffff',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '6px 28px',
                borderRadius: '16px',
                letterSpacing: '4px',
              }}
            >
              {predHome} - {predAway}
            </div>
            <div style={{ display: 'flex', fontSize: '16px', fontWeight: 700, color: '#94a3b8', marginTop: '8px' }}>
              Draw: {dp}%
            </div>
          </div>

          {/* Away Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '320px', textAlign: 'center' }}>
            {awayCrest ? (
              <img src={awayCrest} alt={AN} width="96" height="96" style={{ objectFit: 'contain', marginBottom: '14px' }} />
            ) : (
              <div style={{ width: '96px', height: '96px', borderRadius: '48px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, marginBottom: '14px' }}>
                {AN.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: '32px', fontWeight: 900, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
              {AN}
            </div>
            <div style={{ display: 'flex', fontSize: '22px', fontWeight: 800, color: '#a78bfa', marginTop: '6px' }}>
              {ap}% Win
            </div>
          </div>
        </div>

        {/* Bottom Probabilities Distribution Bar & Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', height: '10px', borderRadius: '999px', overflow: 'hidden', width: '100%' }}>
            <div style={{ width: `${hp}%`, background: '#3b82f6', display: 'flex' }} />
            <div style={{ width: `${dp}%`, background: '#64748b', display: 'flex' }} />
            <div style={{ width: `${ap}%`, background: '#8b5cf6', display: 'flex' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>
            <span>Win Probabilities · Projected Score · Form &amp; Head to Head Analytics</span>
            <span style={{ color: '#38bdf8' }}>footballprediction-lovat.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
