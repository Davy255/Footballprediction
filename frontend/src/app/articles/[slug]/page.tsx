import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { constructMetadata } from '@/config/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return constructMetadata({
      title: "Article Not Found",
      description: "The requested football analysis article could not be located on FootballPredict.",
      path: `/articles/${slug}`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${article.title} | Football Analysis`,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    keywords: [article.category.toLowerCase(), "football analysis", "match preview", "prediction statistics"],
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballprediction-lovat.vercel.app';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  // Article Schema JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    author: {
      '@type': 'Organization',
      name: article.author.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FootballPredict',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
  };

  const otherArticles = getAllArticles().filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Schema.org Article JSON-LD */}
      <JsonLd data={articleJsonLd} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/articles' },
          { name: article.title },
        ]}
      />

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Article Meta Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              {article.readingTimeMinutes} min read • Published {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 1rem 0', lineHeight: 1.3 }}>
            {article.title}
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 1.25rem 0', fontStyle: 'italic' }}>
            {article.excerpt}
          </p>

          {/* Author Byline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
            }}>
              ⚽
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem' }}>{article.author.name}</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{article.author.role}</div>
            </div>
          </div>
        </div>

        <AdBanner slot="hero-top" />

        {/* Article Body */}
        <article style={{
          color: '#e2e8f0',
          fontSize: '0.96rem',
          lineHeight: 1.8,
          marginBottom: '3rem',
        }}>
          {article.content.split('## ').map((section, idx) => {
            if (idx === 0) {
              return section ? <div key={idx} dangerouslySetInnerHTML={{ __html: section.replace(/\n/g, '<br/>') }} /> : null;
            }
            const lines = section.split('\n');
            const heading = lines[0];
            const body = lines.slice(1).join('\n');

            return (
              <div key={idx} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '1.75rem 0 0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  {heading}
                </h2>
                <div style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: body.replace(/### (.*)/g, '<h3 style="font-size: 1.1rem; font-weight: 800; color: #93c5fd; margin: 1.2rem 0 0.4rem 0;">$1</h3>').replace(/\n\n/g, '<p style="margin-bottom: 1rem;"></p>') }} />
              </div>
            );
          })}
        </article>

        {/* Related Football Predictions Gateway */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(17,24,39,0.95) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.4rem' }}>
            🎯 Explore Live Mathematical Forecasts
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 1rem 0' }}>
            Apply these statistical insights directly to today&apos;s scheduled fixtures. View win probabilities, projected scores, and value edges across top European leagues.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/football-predictions-today" className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
              Today&apos;s Predictions →
            </Link>
            <Link href="/accuracy" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
              Model Performance Audit →
            </Link>
          </div>
        </div>

        {/* More Articles Section */}
        {otherArticles.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '1rem' }}>
              More Football Analysis &amp; Methodology
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {otherArticles.map((oa) => (
                <Link
                  key={oa.slug}
                  href={`/articles/${oa.slug}`}
                  style={{
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    {oa.category}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                    {oa.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {oa.readingTimeMinutes} min read
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
