import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CookieSettingsTrigger } from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Privacy Policy — Data Protection & Cookie Disclosure | FootballPredict',
  description:
    'Comprehensive Privacy Policy, data collection practices, browser storage audit, and Google AdSense consent disclosures for FootballPredict, published by Vertex Digital Services.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — FootballPredict',
    description:
      'Information on how Vertex Digital Services collects, uses, and safeguards visitor data and respects consent choices on FootballPredict.',
    url: getCanonicalUrl('/privacy'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — FootballPredict',
    description:
      'Data protection, storage disclosures, and cookie policies for FootballPredict.',
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description:
      'Privacy Policy, data usage, browser storage audit, and cookie disclosures for FootballPredict.',
    url: getCanonicalUrl('/privacy'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icon.svg`,
      },
    },
  };

  return (
    <div className="container py-xl" style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '4rem', minHeight: '80vh' }}>
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
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '0.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Privacy Policy &amp; Cookie Disclosure
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Published by <strong>{siteConfig.publisher}</strong> · Effective Date: October 2026
        </p>

        {/* Section 1: Introduction & Data Controller */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Introduction &amp; Publisher Identity
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Welcome to <strong>FootballPredict</strong>, operated by <strong>{siteConfig.publisher}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at{' '}
            <a href={siteConfig.url} style={{ color: 'var(--accent-blue)' }}>{siteConfig.url}</a>.
          </p>
          <p style={{ margin: 0 }}>
            FootballPredict is an independent football analytics platform providing statistical match predictions, mathematical win probabilities, live match centres, fixture calendars, and educational articles. We are committed to transparency, data protection, and respecting your privacy choices. This Privacy Policy details the exact categories of data we collect, why we collect them, how browser storage is utilized, and how you can manage your preferences.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. Information We Collect &amp; How It Is Collected
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            We adhere to data minimization principles, collecting only information necessary to deliver platform features:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0 0 1rem 0' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>User Account Registration:</strong> If you voluntarily register an account to participate in our community prediction leaderboard or track match forecasts, we collect your chosen username and email address. Passwords are encrypted client-to-server and stored as one-way cryptographic hashes using industry-standard <code>bcrypt</code>. We never store raw passwords.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Authentication &amp; Session Data:</strong> Upon successful login, our backend issues a stateless JSON Web Token (JWT). This token is stored in your browser&apos;s <code>localStorage</code> to authenticate subsequent requests to our API.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>VIP Subscriptions &amp; Payments:</strong> If you subscribe to VIP Pro Analytics, the transaction is processed directly through our configured payment provider, <strong>Flutterwave</strong>. FootballPredict records your internal subscription plan name, status (active, expired, cancelled), and the payment transaction reference code (<code>tx_ref</code>). <em>FootballPredict never collects, stores, or accesses credit or debit card numbers, bank account credentials, or security codes (CVVs).</em> All sensitive payment data is handled exclusively on Flutterwave&apos;s PCI-DSS Level 1 certified servers.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Direct Inquiries &amp; Support Messages:</strong> If you contact us via our online Contact Form, email, or WhatsApp, we retain your communication solely to respond to your inquiry and resolve technical issues. We never sell or share contact details.
            </li>
            <li>
              <strong>Technical Infrastructure Logs:</strong> When you access our website, hosting infrastructure on Vercel (frontend) and Render (backend API) automatically logs standard HTTP request headers, including IP addresses, browser types, requested endpoints, and timestamps. These logs are used exclusively for security monitoring, diagnosing technical errors, and defending against denial-of-service (DDoS) abuse.
            </li>
          </ul>
        </section>

        {/* Section 3: Browser Storage & Cookie Audit */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. Detailed Cookie &amp; Browser Storage Audit
          </h2>
          <p style={{ margin: '0 0 0.85rem 0' }}>
            FootballPredict utilizes first-party browser local storage to provide essential functionality. The table below outlines all storage items used by our application:
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <th style={{ padding: '0.7rem 0.85rem' }}>Key / Name</th>
                  <th style={{ padding: '0.7rem 0.85rem' }}>Storage Type</th>
                  <th style={{ padding: '0.7rem 0.85rem' }}>Classification</th>
                  <th style={{ padding: '0.7rem 0.85rem' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontWeight: 700 }}>token</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>localStorage</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>Strictly Necessary</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Stores JWT session bearer token for authenticated user features (leaderboard picks, personal dashboard). Set only upon login.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontWeight: 700 }}>cached_user</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>localStorage</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>Strictly Necessary</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Caches user avatar initials and username for optimistic UI rendering while session revalidates.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontWeight: 700 }}>theme</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>localStorage</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--accent-blue)', fontWeight: 700 }}>Functional / Preference</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Remembers chosen visual display mode (&lsquo;dark&rsquo; or &lsquo;light&rsquo;) across page reloads. Contains no personal data.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontWeight: 700 }}>fp_consent_preferences</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>localStorage</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--accent-purple)', fontWeight: 700 }}>Consent Management</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Records your explicit consent choices for optional analytics and advertising technologies.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Advertising & Google AdSense */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Google AdSense &amp; Third-Party Advertising
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            We work with Google AdSense and authorized third-party ad networks to display advertisements that fund our free football analysis and statistical prediction tools.
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0 0 0.85rem 0' }}>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>Google Cookies:</strong> Google, as a third-party vendor, uses cookies (such as <code>__gads</code>, <code>__gpi</code>, and DoubleClick cookies) to serve ads based on your prior visits to this website or other websites on the Internet.
            </li>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>Personalized vs. Non-Personalized Ads:</strong> Depending on your consent choices and geographic location, ads may be personalized based on your interests or non-personalized (contextual, based on the football content of the current page).
            </li>
            <li>
              <strong>Google Consent Mode v2:</strong> We implement Google Consent Mode v2. By default, advertising and analytics storage signals are set to <code>denied</code> until and unless you grant consent through our consent manager.
            </li>
          </ul>
          <p style={{ margin: 0 }}>
            You may opt out of personalized advertising by visiting Google&apos;s official{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
              Google Ads Settings
            </a>{' '}
            or the industry-wide{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
              AboutAds.info Choices Portal
            </a>.
          </p>
        </section>

        {/* Section 5: Analytics Technologies */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Performance &amp; Traffic Analytics
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            We use Google Analytics 4 (GA4) solely to measure aggregated visitor traffic, identify popular football leagues, evaluate search discoverability, and optimize site speed.
          </p>
          <p style={{ margin: 0 }}>
            When GA4 is active, IP anonymization is permanently enabled, and no personally identifying information (such as usernames, emails, or passwords) is ever transmitted to Google Analytics servers. Analytics scripts only execute if you grant consent for analytics in our consent banner.
          </p>
        </section>

        {/* Section 6: Third-Party Service Providers */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Third-Party Service Providers
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            FootballPredict shares data with external service providers only as strictly required to operate the platform:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>Vercel Inc. (United States):</strong> Frontend web application hosting, serverless functions, and global content delivery network (CDN).
            </li>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>Render Services Inc. (United States):</strong> Backend REST API hosting and database persistence.
            </li>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>Flutterwave (Global / Africa):</strong> Payment gateway for VIP Pro analytics subscriptions. Operates as an independent data controller for payment authorization under PCI-DSS standards.
            </li>
            <li style={{ marginBottom: '0.45rem' }}>
              <strong>football-data.org (Germany):</strong> Third-party sports data API provider supplying match schedules, live scores, and competition standings.
            </li>
            <li>
              <strong>Google LLC (United States):</strong> Advertising technology (Google AdSense), web analytics (Google Analytics 4), and optional Google OAuth sign-in.
            </li>
          </ul>
        </section>

        {/* Section 7: User Rights & Data Deletion */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            7. Your Privacy Rights &amp; Data Deletion
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Under applicable data protection frameworks (including the GDPR, UK GDPR, and Kenya Data Protection Act), you have rights regarding your personal information:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0 0 0.85rem 0' }}>
            <li style={{ marginBottom: '0.35rem' }}><strong>Right to Access:</strong> You can request a copy of the personal data associated with your account.</li>
            <li style={{ marginBottom: '0.35rem' }}><strong>Right to Rectification:</strong> You can request correction of inaccurate registration details.</li>
            <li style={{ marginBottom: '0.35rem' }}><strong>Right to Erasure (Account Deletion):</strong> You may request permanent deletion of your user account, leaderboard picks, and contact history at any time.</li>
            <li><strong>Right to Withdraw Consent:</strong> You can change your cookie and advertising consent choices at any time by clicking the Cookie Settings control below or in the website footer.</li>
          </ul>
          <div style={{ marginTop: '0.85rem' }}>
            <CookieSettingsTrigger
              label="⚙️ Reopen Cookie & Consent Preferences"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'var(--accent-blue)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            />
          </div>
        </section>

        {/* Section 8: Contact Information */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            8. Contact Our Data Controller
          </h2>
          <p style={{ margin: '0 0 0.65rem 0' }}>
            If you have any questions regarding this Privacy Policy, wish to exercise your data rights, or submit an account deletion request, please contact our publisher:
          </p>
          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
            <div><strong>Publisher:</strong> {siteConfig.publisher}</div>
            <div style={{ marginTop: '0.35rem' }}><strong>Official Inquiries Email:</strong> <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: 'var(--accent-blue)' }}>{siteConfig.contactEmail}</a></div>
            <div style={{ marginTop: '0.35rem' }}><strong>Telephone &amp; WhatsApp Support:</strong> <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80' }}>{siteConfig.contactPhone}</a></div>
            <div style={{ marginTop: '0.35rem' }}><strong>Online Help Desk:</strong> <Link href="/contact" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Contact Support Page</Link></div>
          </div>
        </section>

        {/* Bottom Navigation */}
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
