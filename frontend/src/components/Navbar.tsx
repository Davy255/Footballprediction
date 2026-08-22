'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import HowToPlayModal from './HowToPlayModal';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: '🏠', public: true },
  { href: '/live', label: 'Live', icon: '🔴', public: true, isLive: true },
  { href: '/fixtures', label: 'Fixtures', icon: '📅', public: true },
  { href: '/leagues', label: 'Leagues', icon: '🏆', public: true },
  { href: '/predictions', label: 'My Picks', icon: '🎯', public: false },
  { href: '/leaderboard', label: 'Leaderboard', icon: '👑', public: true },
  { href: '/stats', label: 'Analytics', icon: '📊', public: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const initials = user
    ? user.username.slice(0, 2).toUpperCase()
    : '';

  const visibleLinks = user
    ? [...NAV_LINKS, ...(user.is_admin ? [{ href: '/admin', label: 'Admin', icon: '⚙️', public: false }] : [])]
    : NAV_LINKS;

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          {/* Logo */}
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">⚽</span>
            FootballPredict
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const isLocked = !link.public && !user;
              const isLiveLink = (link as any).isLive;
              return (
                <li key={link.href}>
                  <Link
                    href={isLocked ? '/login' : link.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    style={isLocked ? { opacity: 0.5 } : {}}
                    title={isLocked ? 'Login required' : undefined}
                  >
                    {isLiveLink && (
                      <span style={{
                        display: 'inline-block', width: '7px', height: '7px',
                        borderRadius: '50%', background: '#ef4444',
                        marginRight: '4px', verticalAlign: 'middle',
                        animation: 'pulseBadge 1.8s infinite',
                        boxShadow: '0 0 6px rgba(239,68,68,0.8)',
                      }} />
                    )}
                    {link.label}
                    {isLocked && (
                      <span style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}>🔒</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                border: '1px solid rgba(59,130,246,0.3)',
                background: 'rgba(59,130,246,0.08)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
              title="How to play & prediction rules"
            >
              📖 <span className="guide-text-desktop">Guide</span>
            </button>

            <ThemeToggle />

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right', display: 'none' }} className="user-info-desktop">
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    🏆 {user.total_points} pts
                  </div>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="user-avatar">{initials}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user.username}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                      {user.total_points} pts
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <button
          onClick={() => { setShowGuide(true); setMenuOpen(false); }}
          className="mobile-nav-link"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
        >
          <span style={{ fontSize: '1.1rem' }}>📖</span>
          <span>How to Play & Guide</span>
        </button>

        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          const isLocked = !link.public && !user;
          return (
            <Link
              key={link.href}
              href={isLocked ? '/login' : link.href}
              className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              <span>{link.label}</span>
              {isLocked && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🔒 Login required
                </span>
              )}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          {user ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div className="user-avatar">{initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    🏆 {user.total_points} pts &bull; {user.accuracy}% accuracy
                  </div>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link href="/login" className="btn btn-secondary" style={{ textAlign: 'center' }} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ textAlign: 'center' }} onClick={() => setMenuOpen(false)}>
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
