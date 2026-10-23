import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service — Platform Usage & Rules | FootballPredict',
  description:
    'Terms of service, acceptable use policies, non-monetary competition guidelines, and publisher conditions for FootballPredict, operated by Vertex Digital Services.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service — FootballPredict',
    description:
      'Usage terms and platform rules for FootballPredict, published by Vertex Digital Services.',
    url: getCanonicalUrl('/terms'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — FootballPredict',
    description:
      'Platform rules and terms of service for FootballPredict.',
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    description:
      'Terms of service and usage conditions for FootballPredict.',
    url: getCanonicalUrl('/terms'),
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
          { name: 'Terms of Service' },
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
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Published by <strong>{siteConfig.publisher}</strong> · Last updated: October 2026
        </p>

        {/* Section 1: Acceptance */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            By accessing or using <strong>FootballPredict</strong> (<a href={siteConfig.url} style={{ color: '#60a5fa' }}>{siteConfig.url}</a>), published and operated by <strong>{siteConfig.publisher}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you agree to comply with and be bound by these Terms of Service.
          </p>
          <p style={{ margin: 0 }}>
            If you do not agree to these terms, please do not use our services or website features.
          </p>
        </section>

        {/* Section 2: Platform Nature */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            2. Informational &amp; Non-Gambling Nature of the Platform
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            FootballPredict is an independent digital sports analytics platform providing mathematical match projections, Poisson distributions, historical head-to-head records, and virtual community prediction leaderboards.
          </p>
          <p style={{ margin: 0 }}>
            <strong>FootballPredict does not operate a sportsbook, accept bets, process wagers, or provide commercial gambling services.</strong> All prediction competitions and leaderboard points are purely non-monetary virtual games of analytical skill with zero financial compensation or cash-out value.
          </p>
        </section>

        {/* Section 3: User Accounts & Conduct */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            3. User Accounts &amp; Acceptable Use
          </h2>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            Users who create an account to participate in the community prediction leaderboard are responsible for maintaining the confidentiality of their credentials. You agree not to:
          </p>
          <ul style={{ paddingLeft: '1.4rem', margin: 0 }}>
            <li style={{ marginBottom: '0.35rem' }}>Deploy automated scraping bots, crawlers, or scripts that overload our servers.</li>
            <li style={{ marginBottom: '0.35rem' }}>Attempt to circumvent authentication systems or security firewalls.</li>
            <li style={{ marginBottom: '0.35rem' }}>Create multiple fraudulent accounts to artificially manipulate leaderboard rankings.</li>
            <li>Post abusive, defamatory, or unlawful commentary through any communication channel.</li>
          </ul>
        </section>

        {/* Section 4: Intellectual Property */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            4. Intellectual Property &amp; Content Attribution
          </h2>
          <p style={{ margin: 0 }}>
            The website design, proprietary algorithmic code, prediction aggregation models, editorial research articles, and branding are the intellectual property of <strong>{siteConfig.publisher}</strong>. Match schedules, team badges, and competition names belong to their respective copyright and trademark owners and are presented under fair editorial and informational reporting principles.
          </p>
        </section>

        {/* Section 5: Limitation of Liability */}
        <section style={{ marginBottom: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            5. Limitation of Liability
          </h2>
          <p style={{ margin: 0 }}>
            Statistical projections and match analyses are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. To the fullest extent permitted by law, <strong>{siteConfig.publisher}</strong> disclaims all liability for any direct, indirect, incidental, or consequential losses resulting from the use or inability to use the site, or reliance on statistical predictions. Please see our full <Link href="/disclaimer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Prediction Disclaimer</Link>.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section style={{ marginBottom: '2rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            6. Inquiries &amp; Legal Notices
          </h2>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            For questions regarding these Terms of Service or to submit notices, please contact:
          </p>
          <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
            <div><strong>Publisher:</strong> {siteConfig.publisher}</div>
            <div style={{ marginTop: '0.3rem' }}><strong>Email:</strong> <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: '#60a5fa' }}>{siteConfig.contactEmail}</a></div>
            <div style={{ marginTop: '0.3rem' }}><strong>Phone &amp; WhatsApp:</strong> <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80' }}>{siteConfig.contactPhone}</a></div>
            <div style={{ marginTop: '0.3rem' }}><strong>Online Support:</strong> <Link href="/contact" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Contact Page</Link></div>
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
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.86rem', textDecoration: 'none' }}>
              🔒 Privacy Policy
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
