import type { Metadata } from 'next';

/**
 * Centralized Site and SEO Configuration for FootballPredict
 *
 * To change the production canonical domain in the future, set the
 * NEXT_PUBLIC_SITE_URL environment variable (e.g. in Vercel or .env.local).
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballprediction-lovat.vercel.app';
// Ensure no trailing slash for consistent URL construction
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const siteConfig = {
  name: 'FootballPredict',
  shortName: 'FootballPredict',
  url: SITE_URL,
  defaultTitle: 'FootballPredict — Football Predictions, Stats & Analytics',
  titleTemplate: '%s | FootballPredict',
  description:
    'FootballPredict provides football match predictions, statistics, team form, win probabilities, tactical analysis and AI-powered football insights for leagues and matches worldwide.',
  keywords: [
    'football predictions',
    'soccer predictions',
    'match statistics',
    'team form analysis',
    'win probabilities',
    'tactical analysis',
    'football analytics',
    'head to head stats',
    'AI football predictions',
    'match forecasts',
    'live soccer data',
    'league standings',
  ],
  ogImage: '/og-image.png',
  locale: 'en_US',
  creator: 'FootballPredict',
  publisher: 'FootballPredict',
  themeColor: '#0b0f19',
};

/**
 * Generate a canonical URL for a given path using the centralized site URL.
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${SITE_URL}${cleanPath}`;
}

interface MetadataParams {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Helper to construct consistent Next.js Metadata objects across all pages and layouts.
 */
export function constructMetadata({
  title,
  description,
  path = '',
  ogImage = siteConfig.ogImage,
  noIndex = false,
  keywords,
}: MetadataParams = {}): Metadata {
  const canonical = getCanonicalUrl(path);
  const pageTitle = title ? title : siteConfig.defaultTitle;
  const pageDescription = description || siteConfig.description;
  const pageKeywords = keywords || siteConfig.keywords;

  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  return {
    title: title
      ? {
          default: title,
          template: siteConfig.titleTemplate,
        }
      : {
          default: siteConfig.defaultTitle,
          template: siteConfig.titleTemplate,
        },
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{ name: siteConfig.name, url: SITE_URL }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: path === '' ? '/' : path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — Match Intelligence & Football Analytics`,
        },
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { url: '/apple-icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: ['/icon.svg'],
    },
    manifest: '/manifest.json',
  };
}
