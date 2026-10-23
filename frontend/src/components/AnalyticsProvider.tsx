'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { trackPageView, GA_TRACKING_ID } from '@/lib/analytics';
import { getStoredConsent, ConsentPreferences } from './CookieConsent';

function AnalyticsTracker({ hasConsent }: { hasConsent: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !hasConsent) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams, hasConsent]);

  return null;
}

export default function AnalyticsProvider() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (existing?.analytics) {
      setHasAnalyticsConsent(true);
    }

    const handleConsentUpdated = (e: CustomEvent<ConsentPreferences>) => {
      const prefs = e.detail;
      setHasAnalyticsConsent(Boolean(prefs?.analytics));
    };

    window.addEventListener('fp-consent-updated', handleConsentUpdated as EventListener);
    return () => window.removeEventListener('fp-consent-updated', handleConsentUpdated as EventListener);
  }, []);

  return (
    <>
      {/* Google Consent Mode v2 Default Signals (Privacy by Default) */}
      <Script id="google-consent-mode-v2" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
          });
        `}
      </Script>

      <Suspense fallback={null}>
        <AnalyticsTracker hasConsent={hasAnalyticsConsent} />
      </Suspense>

      {/* Google Analytics 4 Scripts (Only loaded when GA_TRACKING_ID exists AND user has consented to analytics) */}
      {GA_TRACKING_ID && hasAnalyticsConsent && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
