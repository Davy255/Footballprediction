import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export interface BreadcrumbItem {
  name?: string;
  label?: string;
  url?: string;
  href?: string;
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
      const itemName = item.name || item.label || '';
      const rawUrl = item.url || item.href;
      const absoluteUrl = rawUrl
        ? rawUrl.startsWith('http')
          ? rawUrl
          : `${siteConfig.url}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`
        : undefined;

      const listItem: Record<string, any> = {
        '@type': 'ListItem',
        position: idx + 1,
        name: itemName,
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
            const itemName = item.name || item.label || '';
            const itemUrl = item.url || item.href;

            return (
              <React.Fragment key={`${itemName}-${idx}`}>
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
                {isLast || !itemUrl ? (
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
                    {itemName}
                  </li>
                ) : (
                  <li>
                    <Link
                      href={itemUrl}
                      style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      className="hover:text-[var(--accent-blue)]"
                    >
                      {itemName}
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
