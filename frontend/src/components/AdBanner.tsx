'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface AdBannerProps {
  slot?: 'hero-top' | 'in-feed-match' | 'vip-coach-ai' | 'merch-sports' | 'leaderboard-footer' | string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AD_CREATIVES: Record<string, {
  tag: string;
  tagBg: string;
  title: string;
  desc: string;
  ctaText: string;
  ctaLink: string;
  icon: string;
  gradient: string;
}> = {
  'hero-top': {
    tag: 'SPONSORED PROMO',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    icon: '⚡',
    title: 'Matchday Odds Boost — Up to +40% Enhanced Payouts',
    desc: 'Access verified high-value accumulator boosts across Premier League, Champions League, and Serie A matches.',
    ctaText: 'View Odds Boost →',
    ctaLink: '/fixtures',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(249, 115, 22, 0.08) 100%)',
  },
  'in-feed-match': {
    tag: 'ANALYTICS PARTNER',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    icon: '📊',
    title: 'WhoScored Deep Tactical Match Insights & xG Stats',
    desc: 'Unlock live expected goals (xG), referee card tendencies, team form curves, and starting lineups before kickoff.',
    ctaText: 'Open Tactical Hub →',
    ctaLink: '/stats',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
  },
  'vip-coach-ai': {
    tag: 'FEATURED TOOL',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    icon: '🤖',
    title: 'Coach AI Assistant — Real-Time Match Forecaster',
    desc: 'Ask Coach AI for the best value picks of the day, Both Teams To Score (BTTS) rates, and projected scorelines.',
    ctaText: 'Chat with Coach AI →',
    ctaLink: '#coach-ai',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
  },
  'merch-sports': {
    tag: 'OFFICIAL MERCH',
    tagBg: 'rgba(236, 72, 153, 0.15)',
    icon: '🏆',
    title: '2026/27 Official Club Jerseys & Matchday Gear',
    desc: 'Support your favorite squad. Authentic replica shirts, training kits, boots, and official league merchandise.',
    ctaText: 'Browse Football Gear →',
    ctaLink: '/fixtures',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(244, 63, 94, 0.08) 100%)',
  },
  'leaderboard-footer': {
    tag: 'COMMUNITY REWARDS',
    tagBg: 'rgba(168, 85, 247, 0.15)',
    icon: '👑',
    title: 'Top 10 Predictor Rewards & Monthly Leaderboard Prizes',
    desc: 'Submit your exact score & match winner predictions daily to climb the leaderboard rankings and earn points!',
    ctaText: 'Check Leaderboard →',
    ctaLink: '/leaderboard',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
  },
};

export default function AdBanner({
  slot = 'hero-top',
  format = 'auto',
  responsive = true,
  style,
  className = '',
}: AdBannerProps) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle && adClient) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignore adsbygoogle push errors
    }
  }, [adClient, slot]);

  // If real Google AdSense Client ID is set, automatically render live Google Ads across all placements!
  if (adClient) {
    const isNumericSlot = slot && /^\d+$/.test(slot);
    return (
      <div
        className={`ad-slot-wrapper ${className}`}
        style={{
          margin: '1.25rem auto',
          maxWidth: '980px',
          width: '100%',
          textAlign: 'center',
          minHeight: '90px',
          overflow: 'hidden',
          ...style,
        }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px', ...style }}
          data-ad-client={adClient}
          {...(isNumericSlot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    );
  }

  // Native High-Quality Advertising Card
  const creative = AD_CREATIVES[slot] || AD_CREATIVES['hero-top'];

  const handleClick = (e: React.MouseEvent) => {
    if (creative.ctaLink === '#coach-ai') {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-coach-ai'));
      }
    }
  };

  return (
    <div
      className={`ad-card-native ${className}`}
      style={{
        margin: '1.2rem auto',
        maxWidth: '980px',
        width: '100%',
        background: creative.gradient,
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '0.85rem 1.1rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* Left Ad Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 260px', minWidth: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0,
          }}>
            {creative.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--accent-blue)',
                background: creative.tagBg,
                padding: '0.12rem 0.45rem',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}>
                {creative.tag}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ADVERTISEMENT
              </span>
            </div>

            <div style={{
              fontWeight: 800,
              fontSize: '0.86rem',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              whiteSpace: 'normal',
            }}>
              {creative.title}
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
              marginTop: '0.15rem',
            }}>
              {creative.desc}
            </div>
          </div>
        </div>

        {/* Right CTA Button */}
        <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>
          <Link
            href={creative.ctaLink}
            onClick={handleClick}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            {creative.ctaText}
          </Link>
        </div>

      </div>
    </div>
  );
}
