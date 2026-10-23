import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, getCanonicalUrl } from '@/config/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 3600; // Cache for 1 hour

export const metadata: Metadata = {
  title: 'About FootballPredict — Mission, Publisher & Statistical Methodology | FootballPredict',
  description:
    'Learn about FootballPredict, our publisher Vertex Digital Services, our data-driven football prediction methodology, platform features, data sources, and transparent analytical limitations.',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About FootballPredict — Mission, Publisher & Methodology',
    description:
      'Discover the team, mathematical modeling principles, and publisher behind FootballPredict.',
    url: getCanonicalUrl('/about'),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About FootballPredict — Mission & Publisher',
    description:
      'Learn about FootballPredict, our publisher Vertex Digital Services, and our mathematical prediction models.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About FootballPredict',
    description:
      'Background, publisher identity, statistical methodology, and purpose of the FootballPredict analytics platform.',
    url: getCanonicalUrl('/about'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icons/icon-512x512.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: siteConfig.contactEmail,
        telephone: siteConfig.contactPhone,
      },
    },
  };

  return (
    <div className="container py-xl" style={{ minHeight: '80vh', maxWidth: '920px', margin: '0 auto', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'About Us' },
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
          <span>ℹ️</span>
          <span>Platform Overview &amp; Publisher Identity</span>
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
          About FootballPredict
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
          An independent digital football analytics and predictive forecasting platform designed to help football fans, analysts, and enthusiasts understand match dynamics through objective statistical modeling.
        </p>
      </header>

      {/* Main Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Section 1: Publisher Identity & Mission */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏢</span> Publisher Identity &amp; Platform Mission
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            <strong>FootballPredict</strong> is published and operated by <strong>Vertex Digital Services</strong>. Our platform was developed to provide an alternative to traditional, speculation-driven football commentary by delivering mathematically grounded probability estimates, historical performance ledgers, and tactical match insights.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            Our mission is to make advanced football analytics—such as Elo club strength ratings, rolling form vectors, and bivariate Poisson goal distributions—clear, accessible, and transparent for everyday supporters across the globe.
          </p>
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
            }}
          >
            🛡️ <strong>Independent Analytics Notice:</strong> FootballPredict is not a bookmaker, sportsbook, or betting operator. We do not accept bets, facilitate wagering, handle monetary deposits, or distribute financial winnings. All community features and leaderboard competitions on FootballPredict are 100% non-monetary virtual games designed strictly for analytical amusement and skill-testing.
          </div>
        </section>

        {/* Section 2: What Visitors Can Do on FootballPredict */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚽</span> What Visitors Can Explore
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1.25rem 0' }}>
            FootballPredict provides a wide array of public, freely accessible tools covering Europe&apos;s leading domestic leagues and international tournaments:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/football-predictions-today" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  🎯 Match Predictions &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Pre-match win probabilities (Home/Draw/Away), expected goals, and projected integer scorelines computed before every kickoff.
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/fixtures" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  📅 Fixtures &amp; Schedules &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Comprehensive upcoming calendar schedules, kickoff times, and competition filters across 10 major global leagues.
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/live" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  🔴 Live Match Centre &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Real-time in-play score tracking, match timers, and status updates refreshed automatically every 15 seconds.
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/leagues" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  🏆 League Standings &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Interactive league tables, goal differentials, points totals, and team form across Premier League, La Liga, Serie A, and Champions League.
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/stats" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  📊 Accuracy Dashboard &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Publicly audited prediction performance ledger benchmarking pre-match model snapshots against verified final full-time scores.
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Link href="/articles" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  📚 Editorial Research &rarr;
                </Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                In-depth mathematical research essays explaining Poisson distribution, home advantage dynamics, and market overround normalization.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Prediction Methodology */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📐</span> How FootballPredict Generates Predictions
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            Our predictive engine synthesizes three principal mathematical layers before each match kicks off:
          </p>

          <ol style={{ paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.92rem', margin: '0 0 1rem 0' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Calibrated Elo Rating System:</strong> Each football club maintains a dynamic strength rating updated after every match. We incorporate a quantified <code>+48.0</code> Elo home-advantage rating differential offset, reflecting empirical European home-win rates.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Rolling Form &amp; Head-to-Head Vectors:</strong> The model evaluates rolling 5-to-10 match offensive/defensive strength vectors, goal differential efficiency, and historical head-to-head records between the two clubs.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Bivariate Poisson Goal Distribution:</strong> Expected goals (\(\lambda\) for home, \(\mu\) for away) are calculated to determine the probability matrix of integer scorelines (e.g., 1–0, 2–1, 1–1) and aggregated into 1X2 win probabilities.
            </li>
            <li>
              <strong>Pre-Kickoff Snapshot Locking:</strong> Every model output is permanently locked at the scheduled kickoff time. Probabilities are never retroactively modified after a match has started.
            </li>
          </ol>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Read our complete, peer-referenced methodology breakdown: <Link href="/articles/how-footballpredict-ai-calculates-win-probabilities" style={{ color: '#60a5fa', textDecoration: 'underline' }}>How FootballPredict Calculates Win Probabilities</Link>.
          </p>
        </section>

        {/* Section 4: Transparent Limitations & Prediction Uncertainty */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚖️</span> Limitations &amp; The Reality of Football Variance
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            We believe full transparency about predictive limitations is essential:
          </p>
          <ul style={{ paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.92rem', margin: '0 0 1rem 0' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Estimates, Not Guarantees:</strong> Probabilities reflect long-term tendencies across large sample sizes. A team with a 70% win probability will still fail to win in 30% of matches.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>High Stochastic Randomness:</strong> Football is an inherently low-scoring sport where a single unpredictable event—such as an early red card, deflected own goal, penalty decision, or goalkeeper error—can decisively alter the outcome contrary to statistical expectations.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Data Latency:</strong> While we synchronize live scores rapidly, upstream provider delays or network interruptions may occasionally occur.
            </li>
            <li>
              <strong>Independent Assessment:</strong> Visitors should always exercise their own judgment and review official competition announcements for definitive team information.
            </li>
          </ul>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Please review our full <Link href="/disclaimer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Prediction Disclaimer</Link> for comprehensive terms regarding our analytical outputs.
          </p>
        </section>

        {/* Section 5: Data Sources & Attribution */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📡</span> Data Sources &amp; Technical Infrastructure
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            FootballPredict aggregates verified sports data from reputable external providers:
          </p>
          <ul style={{ paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.92rem', margin: '0 0 1rem 0' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Match Fixtures, Results &amp; Standings:</strong> Sourced through the standard football data API from <code>football-data.org</code>.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Market Baseline Context:</strong> Consensus market odds for statistical margin benchmarks are referenced from <code>The Odds API</code>.
            </li>
            <li>
              <strong>Algorithmic Modeling:</strong> All team Elo ratings, Poisson distributions, and accuracy benchmarks are calculated deterministically by our own backend services.
            </li>
          </ul>
        </section>

        {/* Section 6: Publisher Contact & Verification */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,138,0.2) 0%, rgba(17,24,39,0.95) 100%)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📬</span> Publisher Information &amp; Contact
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            We welcome inquiries, content corrections, data discrepancy reports, and technical feedback from our community.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Publisher</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {siteConfig.publisher}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Email Support</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone &amp; WhatsApp</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem' }}>
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {siteConfig.contactPhone}
                </a>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.86rem' }}>
              ✉️ Contact Our Team &rarr;
            </Link>
            <Link href="/disclaimer" className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.86rem' }}>
              ⚖️ View Disclaimer
            </Link>
            <Link href="/privacy" className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.86rem' }}>
              🔒 Privacy Policy
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
