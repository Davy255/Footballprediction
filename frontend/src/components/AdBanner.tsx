'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string; // numeric AdSense slot ID or semantic placement descriptor
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  label?: boolean; // whether to show 'ADVERTISEMENT' micro-label (default: true)
}

/**
 * Official Google AdSense responsive ad unit component.
 * Complies with Google AdSense program policies:
 * - Distinguishable from website content with compliant "ADVERTISEMENT" micro-label.
 * - No fake or deceptive placeholder ads.
 * - Zero layout shift protection via minimum height reservation.
 * - Safe client-side push execution.
 */
export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  style,
  className = '',
  label = true,
}: AdBannerProps) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3089881788835574';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle && adClient) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // Ignore adsbygoogle push errors (e.g. ad blockers or duplicate mounts)
    }
  }, [adClient, slot]);

  if (!adClient) {
    return null;
  }

  const isNumericSlot = Boolean(slot && /^\d+$/.test(slot));

  return (
    <div
      className={`ad-slot-wrapper ${className}`}
      role="region"
      aria-label="Advertisement"
      style={{
        margin: '1.75rem auto',
        maxWidth: '980px',
        width: '100%',
        textAlign: 'center',
        minHeight: '90px',
        overflow: 'hidden',
        clear: 'both',
        ...style,
      }}
    >
      {label && <div className="ad-label" aria-hidden="true">ADVERTISEMENT</div>}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', width: '100%', ...style }}
        data-ad-client={adClient}
        {...(isNumericSlot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
