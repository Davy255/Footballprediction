import React from 'react';
import { siteConfig } from '@/config/site';

interface JsonLdProps {
  data?: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps = {}) {
  const schema = data || {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${siteConfig.url}/#organization`,
        },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/fixtures?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.publisher,
        alternateName: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/icon.svg`,
          width: 512,
          height: 512,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.contactPhone,
          contactType: 'customer support',
          email: siteConfig.contactEmail,
          availableLanguage: 'English',
        },
      },
      {
        '@type': 'SportsApplication',
        '@id': `${siteConfig.url}/#webapp`,
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'All',
        description: siteConfig.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
