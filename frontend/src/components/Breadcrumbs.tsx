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

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        style={{
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <ol
          style={{
            display: 'flex',
            gap: '0.4rem',
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
                      color: 'var(--text-muted)',
                      userSelect: 'none',
                      fontSize: '0.75rem',
                    }}
                  >
                    ›
                  </li>
                )}
                {isLast || !item.url ? (
                  <li
                    aria-current="page"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      maxWidth: '240px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </li>
                ) : (
                  <li>
                    <Link
                      href={item.url}
                      style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      className="hover:text-[var(--accent-blue)]"
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
