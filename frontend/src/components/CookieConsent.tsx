'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'fp_consent_preferences';

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && parsed.essential === true) {
      return parsed as ConsentPreferences;
    }
  } catch (err) {
    console.error('Error reading cookie consent from storage:', err);
  }
  return null;
}

export function saveConsent(prefs: { analytics: boolean; advertising: boolean }) {
  if (typeof window === 'undefined') return;
  const payload: ConsentPreferences = {
    essential: true,
    analytics: prefs.analytics,
    advertising: prefs.advertising,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Error saving cookie consent to storage:', err);
  }

  // Update Google Consent Mode v2 signals if gtag is available
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: payload.analytics ? 'granted' : 'denied',
      ad_storage: payload.advertising ? 'granted' : 'denied',
      ad_user_data: payload.advertising ? 'granted' : 'denied',
      ad_personalization: payload.advertising ? 'granted' : 'denied',
    });
  }

  // Dispatch custom event for real-time subscribers
  window.dispatchEvent(new CustomEvent('fp-consent-updated', { detail: payload }));
}

export default function CookieConsent() {
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference form toggles
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [advertisingAllowed, setAdvertisingAllowed] = useState(false);

  // Check consent status on initial client mount
  useEffect(() => {
    const existing = getStoredConsent();
    if (existing) {
      setAnalyticsAllowed(existing.analytics);
      setAdvertisingAllowed(existing.advertising);
      setShowBanner(false);

      // Re-apply stored consent signals to gtag
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: existing.analytics ? 'granted' : 'denied',
          ad_storage: existing.advertising ? 'granted' : 'denied',
          ad_user_data: existing.advertising ? 'granted' : 'denied',
          ad_personalization: existing.advertising ? 'granted' : 'denied',
        });
      }
    } else {
      setShowBanner(true);
    }
    setHasCheckedStorage(true);
  }, []);

  // Listen for external requests to reopen the settings modal (e.g. from footer link)
  useEffect(() => {
    const handleOpenSettings = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalyticsAllowed(current.analytics);
        setAdvertisingAllowed(current.advertising);
      }
      setShowModal(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleAcceptAll = useCallback(() => {
    saveConsent({ analytics: true, advertising: true });
    setAnalyticsAllowed(true);
    setAdvertisingAllowed(true);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    saveConsent({ analytics: false, advertising: false });
    setAnalyticsAllowed(false);
    setAdvertisingAllowed(false);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleSaveCustom = useCallback(() => {
    saveConsent({ analytics: analyticsAllowed, advertising: advertisingAllowed });
    setShowBanner(false);
    setShowModal(false);
  }, [analyticsAllowed, advertisingAllowed]);

  if (!hasCheckedStorage) return null;

  return (
    <>
      {/* 1. Non-Intrusive Bottom Consent Banner */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99990,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.25)',
            padding: '1rem 1.25rem',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              flexWrap: 'wrap',
              maxWidth: '1320px',
              margin: '0 auto',
            }}
          >
            <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  Your Privacy &amp; Consent Choices
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                FootballPredict uses strictly necessary browser storage for user sessions and visual theme settings. With your consent, we and our partners also use analytics and advertising technologies (including Google AdSense) to measure audience engagement and support free sports analytics. Learn more in our{' '}
                <Link href="/privacy" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                  Privacy Policy
                </Link>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: '40px',
                  whiteSpace: 'nowrap',
                }}
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '40px',
                  whiteSpace: 'nowrap',
                }}
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  minHeight: '40px',
                  whiteSpace: 'nowrap',
                }}
              >
                Manage Preferences
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Detailed Privacy & Cookie Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99995,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-modal, var(--bg-card))',
              border: '1px solid var(--border-color)',
              borderRadius: '18px',
              padding: '1.75rem',
              maxWidth: '580px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-card-hover)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>⚙️</span>
                <h2 id="cookie-settings-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Cookie &amp; Privacy Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
              We respect your choice over how data is processed on FootballPredict. Configure the technology categories below. Changes are saved locally and honored across your visits.
            </p>

            {/* Category 1: Strictly Necessary */}
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  1. Strictly Necessary Technologies
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  Always Active
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Essential for core platform functionality including authentication sessions (JWT token), local profile caching, theme display preferences (light/dark mode), and secure API communications. These cannot be disabled.
              </p>
            </div>

            {/* Category 2: Analytics & Traffic Measurement */}
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label htmlFor="toggle-analytics" style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  2. Analytics &amp; Performance
                </label>
                <input
                  id="toggle-analytics"
                  type="checkbox"
                  checked={analyticsAllowed}
                  onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Allows aggregated measurements of popular match fixtures, search discovery terms, and educational article engagement via Google Analytics with IP anonymization enabled. No personally identifying information is tracked.
              </p>
            </div>

            {/* Category 3: Advertising & Personalization */}
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label htmlFor="toggle-advertising" style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  3. Advertising &amp; Relevance
                </label>
                <input
                  id="toggle-advertising"
                  type="checkbox"
                  checked={advertisingAllowed}
                  onChange={(e) => setAdvertisingAllowed(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Supports our free football forecasting service through Google AdSense. Allows third-party advertising partners to deliver relevant sports advertisements and apply ad frequency capping.
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                Reject All Non-Essential
              </button>

              <button
                type="button"
                onClick={handleSaveCustom}
                style={{
                  background: 'var(--accent-blue)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Reusable Client Trigger Button for footer/pages to reopen Cookie & Privacy Preferences
 */
export function CookieSettingsTrigger({
  label = 'Cookie Settings',
  className = '',
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: 'var(--text-muted)',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        cursor: 'pointer',
        textDecoration: 'none',
        ...style,
      }}
      title="Manage your cookie and consent preferences"
      aria-label="Open Cookie and Privacy Preferences"
    >
      {label}
    </button>
  );
}
