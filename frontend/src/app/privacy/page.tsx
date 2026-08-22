import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — FootballPredict',
  description: 'Privacy Policy and Cookie disclosure for FootballPredict platform.',
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ maxWidth: '820px', margin: '2rem auto', paddingBottom: '4rem' }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: August 23, 2026
        </p>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>FootballPredict</strong>. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard information when you visit our website.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Google AdSense &amp; Third-Party Advertising
          </h2>
          <p style={{ marginBottom: '0.75rem' }}>
            We use Google AdSense and third-party advertising companies to serve ads when you visit our website. These companies may use cookies, web beacons, and other tracking technologies to collect information about your visits to this and other websites in order to provide targeted advertisements about goods and services of interest to you.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
            <li>Google&apos;s use of the DoubleClick DART cookie enables it to serve ads to users based on their visit to our sites and other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>AboutAds.info</a>.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us when creating an account (username, email address) and anonymous device/usage information through standard server logs and cookies. We never sell your personal information to third parties.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Cookies &amp; Tracking
          </h2>
          <p>
            Our website uses essential cookies for user session authentication, theme preferences (light/dark mode), and analytics. You can choose to disable cookies through your browser settings, though some website features may not function properly.
          </p>
        </section>

        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            5. Contact Us
          </h2>
          <p>
            If you have questions regarding this privacy policy or our data practices, please contact us at support@footballpredict.com.
          </p>
        </section>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
