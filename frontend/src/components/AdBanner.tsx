'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({
  slot = '',
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

  if (!adClient || !slot) {
    // Elegant Placeholder in Development / Pre-approval
    return (
      <div
        className={`ad-container-placeholder ${className}`}
        style={{
          margin: '1.25rem auto',
          maxWidth: '980px',
          width: '100%',
          padding: '0.85rem 1.25rem',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          minHeight: '60px',
          ...style,
        }}
      >
        <span style={{ opacity: 0.7 }}>📢 Advertisement</span>
      </div>
    );
  }

  return (
    <div
      className={`ad-slot-wrapper ${className}`}
      style={{ margin: '1.25rem auto', maxWidth: '980px', width: '100%', textAlign: 'center', ...style }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
