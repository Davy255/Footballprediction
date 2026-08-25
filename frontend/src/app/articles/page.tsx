'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdBanner from '@/components/AdBanner';
import { ARTICLES, Article } from '@/lib/articles';

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Prediction Methodology', 'League Analysis', 'Football Statistics'];

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featured = ARTICLES[0];

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Football Analysis & Articles' },
        ]}
      />

      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.3rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Football Analysis &amp; Prediction Insights 📚
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: '680px' }}>
          Data-driven articles, tactical previews, Poisson distribution modeling breakdowns, and objective football research from the FootballPredict analytics team.
        </p>
      </div>

      <AdBanner slot="hero-top" />

      {/* Featured Article Hero */}
      {featured && selectedCategory === 'All' && searchQuery === '' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(17,24,39,0.95) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.4)', padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
              ⭐ FEATURED ARTICLE
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              {featured.readingTimeMinutes} min read • {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <Link href={`/articles/${featured.slug}`} style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
              {featured.title}
            </h2>
          </Link>
          <p style={{ color: '#cbd5e1', fontSize: '0.90rem', margin: '0 0 1.25rem 0', lineHeight: 1.5, maxWidth: '780px' }}>
            {featured.excerpt}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              By <strong style={{ color: '#f8fafc' }}>{featured.author.name}</strong> ({featured.author.role})
            </div>
            <Link
              href={`/articles/${featured.slug}`}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}
            >
              Read Full Article →
            </Link>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                border: selectedCategory === cat ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: selectedCategory === cat ? '#93c5fd' : '#cbd5e1',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: '#f8fafc',
              fontSize: '0.80rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {filteredArticles.map((art) => (
          <div
            key={art.slug}
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>
                  {art.category}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {art.readingTimeMinutes} min read
                </span>
              </div>

              <Link href={`/articles/${art.slug}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.6rem 0', lineHeight: 1.35 }}>
                  {art.title}
                </h3>
              </Link>
              <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                {art.excerpt}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <Link
                href={`/articles/${art.slug}`}
                style={{ color: '#38bdf8', fontSize: '0.80rem', fontWeight: 800, textDecoration: 'none' }}
              >
                Read Article →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <AdBanner slot="leaderboard-footer" />
    </div>
  );
}
