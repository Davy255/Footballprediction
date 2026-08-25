import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Reusable, Accessible Breadcrumb Navigation Component for FootballPredict
 *
 * Features:
 * 1. Semantic HTML5 <nav aria-label="Breadcrumb"> with structured <ol> and <li> items.
 * 2. Automatic Schema.org BreadcrumbList JSON-LD injection for enhanced SERP rich snippets.
 * 3. Mobile-first responsive styling with non-breaking ellipsis overflow.
 * 4. Strictly avoids linking the final active breadcrumb item to itself.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // Generate Schema.org BreadcrumbList structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      const absoluteUrl = item.url
        ? item.url.startsWith('http')
          ? item.url
          : `${siteConfig.url}${item.url.startsWith('/') ? item.url : `/${item.url}`}`
        : undefined;

      const listItem: Record<string, any> = {
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
      };

      if (absoluteUrl && !isLast) {
        listItem.item = absoluteUrl;
      }

      return listItem;
    }),
  };

  return (
    <>
      {/* Schema.org BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Accessible Visual Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          marginBottom: '1.2rem',
          fontSize: '0.84rem',
          color: '#94a3b8',
        }}
      >
        <ol
          style={{
            display: 'flex',
            gap: '0.45rem',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <React.Fragment key={`${item.name}-${idx}`}>
                {idx > 0 && (
                  <li
                    aria-hidden="true"
                    style={{
                      color: '#64748b',
                      userSelect: 'none',
                      fontSize: '0.78rem',
                    }}
                  >
                    ›
                  </li>
                )}
                {isLast || !item.url ? (
                  <li
                    style={{
                      color: '#f8fafc',
                      fontWeight: 700,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    aria-current="page"
                  >
                    {item.name}
                  </li>
                ) : (
                  <li>
                    <Link
                      href={item.url}
                      style={{
                        color: '#94a3b8',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
