import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import LiveScoreTicker from '@/components/LiveScoreTicker';
import ChatbotWidget from '@/components/ChatbotWidget';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://footballprediction-lovat.vercel.app'),
  title: 'FootballPredict — Expert Match Analytics & Multi-Market Predictions',
  description:
    'Data-driven football match analytics, statistical probabilities (1X2, BTTS, Over/Under 2.5), head-to-head form, and community predictions across all top leagues.',
  keywords: 'football predictions, soccer odds, match analysis, head-to-head, team stats, betting tips, fixture previews',
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
  openGraph: {
    title: 'FootballPredict — Match Analytics & Statistical Predictions',
    description: 'Data-driven football match analytics, statistical probabilities (1X2, BTTS, Over/Under 2.5), and head-to-head form.',
    url: 'https://footballprediction-lovat.vercel.app',
    siteName: 'FootballPredict',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FootballPredict Match Intelligence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FootballPredict — Match Analytics & Statistical Predictions',
    description: 'Data-driven football match analytics, statistical probabilities (1X2, BTTS, Over/Under 2.5), and head-to-head form.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3089881788835574';

  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3089881788835574" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ flex: 1, paddingBottom: '1rem' }}>
              {children}
            </main>

            {/* Professional Footer */}
            <footer className="site-footer">
              <div className="container">
                <div className="footer-grid">
                  {/* Brand Column */}
                  <div className="footer-brand">
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>⚽</span>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        FootballPredict
                      </span>
                    </Link>
                    <p>
                      Comprehensive football match predictions, live odds synced from Bet365 & Pinnacle,
                      multi-market tactical analysis, and competitive leaderboard rankings.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(59,130,246,0.1)',
                        color: 'var(--accent-blue)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>Tactical Data</span>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(16,185,129,0.1)',
                        color: 'var(--accent-green)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>Live Odds</span>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(139,92,246,0.1)',
                        color: 'var(--accent-purple)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>10 Leagues</span>
                    </div>
                  </div>

                  {/* Predict Column */}
                  <div className="footer-col">
                    <h4>Predict</h4>
                    <ul className="footer-links">
                      <li><Link href="/fixtures">Today&apos;s Fixtures</Link></li>
                      <li><Link href="/fixtures?status=SCHEDULED">Upcoming Matches</Link></li>
                      <li><Link href="/predictions">My Predictions</Link></li>
                      <li><Link href="/leaderboard">Leaderboard</Link></li>
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
                    </ul>
                  </div>

                  {/* Legal Column */}
                  <div className="footer-col">
                    <h4>Legal &amp; Trust</h4>
                    <ul className="footer-links">
                      <li><Link href="/privacy">Privacy Policy</Link></li>
                      <li><Link href="/terms">Terms of Service</Link></li>
                      <li><Link href="/disclaimer">Disclaimer &amp; Gaming</Link></li>
                      <li><Link href="/forgot-password">Account Recovery</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="footer-bottom">
                  <span>⚽ FootballPredict &copy; {new Date().getFullYear()}. All rights reserved.</span>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
                    <span>•</span>
                    <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
                    <span>•</span>
                    <Link href="/disclaimer" style={{ color: 'var(--text-muted)' }}>Disclaimer</Link>
                  </div>
                  <span>Powered by football-data.org &amp; The Odds API</span>
                </div>
              </div>
            </footer>
            <ChatbotWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
