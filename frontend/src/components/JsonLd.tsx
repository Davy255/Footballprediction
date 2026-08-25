import React from 'react';
import { siteConfig } from '@/config/site';

export default function JsonLd() {
  const schema = {
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
      },
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/icon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: [],
      },
      {
        '@type': 'WebApplication',
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
