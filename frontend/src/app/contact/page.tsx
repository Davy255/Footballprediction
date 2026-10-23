import React from 'react';
import type { Metadata } from 'next';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactClient from './ContactClient';

export const revalidate = 3600; // 1 hour cache

export const metadata: Metadata = {
  title: 'Contact FootballPredict — Support, Inquiries & Data Corrections | FootballPredict',
  description:
    'Contact the FootballPredict team and publisher Vertex Digital Services. Report incorrect match scores, submit technical bug reports, request data corrections, or send general inquiries.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact FootballPredict — Support & Publisher Information',
    description:
      'Direct contact methods, email address, WhatsApp line, and support channels for FootballPredict and publisher Vertex Digital Services.',
    url: getCanonicalUrl('/contact'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact FootballPredict — Support & Inquiries',
    description:
      'Contact FootballPredict and publisher Vertex Digital Services for data corrections and general feedback.',
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact FootballPredict',
    description:
      'Official contact information, email, telephone, and support channels for FootballPredict and Vertex Digital Services.',
    url: getCanonicalUrl('/contact'),
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.publisher,
      url: siteConfig.url,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: siteConfig.contactEmail,
          telephone: siteConfig.contactPhone,
          availableLanguage: ['English', 'Swahili'],
        },
      ],
    },
  };

  return (
    <div className="container py-xl" style={{ minHeight: '80vh', maxWidth: '960px', margin: '0 auto', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact & Support' },
        ]}
      />

      {/* Header Banner */}
      <header
        style={{
          background: 'var(--gradient-hero)',
          border: '1px solid var(--gradient-hero-border)',
          borderRadius: '16px',
          padding: '2rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 800, marginBottom: '0.6rem' }}>
          <span>📬</span>
          <span>Support &amp; Community Feedback</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 0.6rem 0',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          Contact FootballPredict
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '780px',
          }}
        >
          Have questions regarding our football prediction models, found an incorrect match score, or experiencing a technical issue? Reach out directly to the team at Vertex Digital Services.
        </p>
      </header>

      {/* Interactive Contact & Publisher Client */}
      <ContactClient />
    </div>
  );
}
