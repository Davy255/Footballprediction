import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy — Data Protection & Cookie Disclosure | FootballPredict',
  description:
    'Privacy Policy, data collection practices, Google AdSense disclosures, and cookie policies for FootballPredict, published by Vertex Digital Services.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — FootballPredict',
    description:
      'Information on how Vertex Digital Services collects, uses, and safeguards visitor data on FootballPredict.',
    url: getCanonicalUrl('/privacy'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — FootballPredict',
    description:
      'Data protection and cookie policies for FootballPredict.',
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description:
      'Privacy Policy, data usage, and cookie disclosures for FootballPredict.',
    url: getCanonicalUrl('/privacy'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icons/icon-512x512.png`,
      },
    },
  };

  return (
    <div className="container py-xl" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '4rem', minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy' },
        ]}
      />

      <div
        style={{
          background: 'var(--bg-card)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '0.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Published by <strong>{siteConfig.publisher}</strong> · Last updated: October 2026
        </p>

        {/* Section 1: Introduction */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Introduction &amp; Data Controller
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Welcome to <strong>FootballPredict</strong>, operated by <strong>{siteConfig.publisher}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We respect your privacy and are committed to safeguarding personal information collected through our website (<a href={siteConfig.url} style={{ color: '#60a5fa' }}>{siteConfig.url}</a>).
          </p>
          <p style={{ margin: 0 }}>
            This Privacy Policy explains how information is collected, stored, processed, and safeguarded when you access our match predictions, statistics, fixtures, articles, and community leaderboards.
          </p>
        </section>

        {/* Section 2: Advertising */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. Google AdSense &amp; Third-Party Advertising
          </h2>
          <p style={{ marginBottom: '0.75rem' }}>
            We use Google AdSense and third-party advertising partners to display advertisements across our website. These advertising providers may use cookies, web beacons, and related tracking technologies to deliver relevant advertisements about goods and services tailored to your browsing behavior:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.35rem' }}>Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads on our platform based on prior visits to our site and other locations on the Internet.</li>
            <li style={{ marginBottom: '0.35rem' }}>Users can opt out of personalized advertising by visiting the <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google Ads Settings</a> page.</li>
            <li>Alternatively, users can opt out of third-party vendor cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>AboutAds.info</a>.</li>
          </ul>
        </section>

        {/* Section 3: Information We Collect */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. Information We Collect
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            We collect information only where necessary to deliver platform functionality:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.35rem' }}>
              <strong>Account Information:</strong> If you voluntarily create an account to participate in our non-monetary community prediction leaderboard, we collect your chosen username and email address. Passwords are encrypted using industry-standard bcrypt hashing.
            </li>
            <li style={{ marginBottom: '0.35rem' }}>
              <strong>Technical Logs:</strong> Our web servers record standard anonymous HTTP requests (IP address, browser type, referring pages, timestamps) to monitor server health, diagnose technical faults, and defend against denial-of-service abuse.
            </li>
            <li>
              <strong>Direct Inquiries:</strong> If you contact us via email or WhatsApp, we retain your communication solely to respond to your inquiry and resolve reported data issues. We never sell, rent, or trade contact information to third parties.
            </li>
          </ul>
        </section>

        {/* Section 4: Cookies & Local Storage */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Cookies &amp; Local Storage Usage
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            We utilize essential cookies and browser local storage for:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.35rem' }}>Maintaining authenticated user sessions.</li>
            <li style={{ marginBottom: '0.35rem' }}>Remembering visual display preferences (e.g., Light or Dark theme).</li>
            <li>Measuring aggregated site traffic and performance without personally identifying individual visitors.</li>
          </ul>
        </section>

        {/* Section 5: Data Security & Retention */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Security &amp; Data Rights
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            All web traffic to FootballPredict is strictly encrypted in transit using Transport Layer Security (TLS/HTTPS). Under applicable data protection frameworks, you have the right to request access to, correction of, or deletion of your registered account data at any time.
          </p>
          <p style={{ margin: 0 }}>
            To exercise your privacy rights or request account removal, please email us directly with your registered account details.
          </p>
        </section>

        {/* Section 6: Contact Information */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Contact Our Data Controller
          </h2>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            If you have questions regarding this Privacy Policy or wish to make a data inquiry, please reach out to our publisher:
          </p>
          <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
            <div><strong>Publisher:</strong> {siteConfig.publisher}</div>
            <div style={{ marginTop: '0.3rem' }}><strong>Email:</strong> <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: '#60a5fa' }}>{siteConfig.contactEmail}</a></div>
            <div style={{ marginTop: '0.3rem' }}><strong>Phone &amp; WhatsApp:</strong> <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80' }}>{siteConfig.contactPhone}</a></div>
            <div style={{ marginTop: '0.3rem' }}><strong>Online Form:</strong> <Link href="/contact" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Contact &amp; Support Page</Link></div>
          </div>
        </section>

        {/* Internal Footer Navigation Links */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/about" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none' }}>
              ℹ️ About Us
            </Link>
            <Link href="/contact" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none' }}>
              ✉️ Contact Team
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
              📄 Terms of Service
            </Link>
            <Link href="/disclaimer" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
              ⚖️ Prediction Disclaimer
            </Link>
          </div>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textDecoration: 'none' }}>
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
