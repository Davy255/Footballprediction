import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';

const ChatbotWidget = dynamic(() => import('@/components/ChatbotWidget'));
import JsonLd from '@/components/JsonLd';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import Link from 'next/link';
import CookieConsent, { CookieSettingsTrigger } from '@/components/CookieConsent';
import { siteConfig, constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3089881788835574';

  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'ka2BdzrohHlAaHxo4gC4rdanbBGzGvRkl42FGzx12U4'}
        />
        <meta name="google-adsense-account" content="ca-pub-3089881788835574" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <JsonLd />
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsProvider />
            <Navbar />
            <main style={{ flex: 1, paddingBottom: '1rem' }}>
              {children}
            </main>

            {/* Professional Footer */}
            <footer className="site-footer">
              <div className="container">
                <div className="footer-grid">
                  {/* Brand & Publisher Column */}
                  <div className="footer-brand">
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>⚽</span>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        FootballPredict
                      </span>
                    </Link>
                    <p>
                      Comprehensive football match predictions, live scores,
                      multi-market tactical analysis, and competitive leaderboard rankings.
                    </p>
                    <p style={{ marginTop: '0.65rem', fontSize: '0.80rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Published by <strong>{siteConfig.publisher}</strong><br />
                      Inquiries: <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: 'var(--color-brand-emerald)', textDecoration: 'none' }}>{siteConfig.contactEmail}</a><br />
                      Support: <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', textDecoration: 'none' }}>{siteConfig.contactPhone}</a>
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-brand-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>Tactical Data</span>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-brand-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>Live Scores</span>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-brand-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>10 Leagues</span>
                    </div>
                  </div>

                  {/* Predict Column */}
                  <div className="footer-col">
                    <h4>Predict &amp; Analysis</h4>
                    <ul className="footer-links">
                      <li><Link href="/football-predictions-today">Today&apos;s Match Predictions</Link></li>
                      <li><Link href="/fixtures">Fixtures Discovery</Link></li>
                      <li><Link href="/live">Live Match Centre</Link></li>
                      <li><Link href="/articles">Football Analysis &amp; Articles</Link></li>
                      <li><Link href="/stats">Historical Accuracy Audit</Link></li>
                      <li><Link href="/leaderboard">Community Leaderboard</Link></li>
                    </ul>
                  </div>

                  {/* Leagues Column */}
                  <div className="footer-col">
                    <h4>Leagues</h4>
                    <ul className="footer-links">
                      <li><Link href="/fixtures?league=PL">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</Link></li>
                      <li><Link href="/fixtures?league=PD">🇪🇸 La Liga</Link></li>
                      <li><Link href="/fixtures?league=BL1">🇩🇪 Bundesliga</Link></li>
                      <li><Link href="/fixtures?league=SA">🇮🇹 Serie A</Link></li>
                      <li><Link href="/fixtures?league=CL">🇪🇺 Champions League</Link></li>
                      <li><Link href="/leagues">🏆 All Competitions</Link></li>
                    </ul>
                  </div>

                  {/* Legal & Trust Column */}
                  <div className="footer-col">
                    <h4>Company &amp; Trust</h4>
                    <ul className="footer-links">
                      <li><Link href="/about">About FootballPredict</Link></li>
                      <li><Link href="/contact">Contact &amp; Support</Link></li>
                      <li><Link href="/disclaimer">Prediction Disclaimer</Link></li>
                      <li><Link href="/privacy">Privacy Policy</Link></li>
                      <li><Link href="/terms">Terms of Service</Link></li>
                      <li><Link href="/forgot-password">Account Recovery</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="footer-bottom">
                  <span>⚽ FootballPredict &copy; {new Date().getFullYear()} {siteConfig.publisher}. All rights reserved.</span>
                  <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/about" style={{ color: 'var(--text-muted)' }}>About Us</Link>
                    <span>•</span>
                    <Link href="/contact" style={{ color: 'var(--text-muted)' }}>Contact</Link>
                    <span>•</span>
                    <Link href="/disclaimer" style={{ color: 'var(--text-muted)' }}>Disclaimer</Link>
                    <span>•</span>
                    <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
                    <span>&bull;</span>
                    <CookieSettingsTrigger />
                    <span>•</span>
                    <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
                  </div>
                  <span>Powered by football-data.org API &amp; proprietary sports analytics models</span>
                </div>
              </div>
            </footer>
            <ChatbotWidget />
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
