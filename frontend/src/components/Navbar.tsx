'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import HowToPlayModal from './HowToPlayModal';

const navLinks = [
  { href: '/fixtures', label: 'Fixtures', public: true, icon: '⚽' },
  { href: '/live', label: 'Live Now', public: true, icon: '🔴' },
  { href: '/leaderboard', label: 'Leaderboard', public: true, icon: '👑' },
  { href: '/leagues', label: 'Leagues', public: true, icon: '🏆' },
  { href: '/stats', label: 'AI Stats', public: true, icon: '📊' },
  { href: '/admin', label: 'Admin', adminOnly: true, icon: '⚙️' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || (user && user.is_admin)
  );

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  const handleOpenCoachAi = () => {
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-coach-ai'));
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          
          {/* Logo */}
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">⚽</span>
            <span>FootballPredict</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const isLocked = !link.public && !user;
              const isLiveLink = link.href === '/live';

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

          {/* Top Header Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            
            {/* Desktop-only Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="btn btn-secondary btn-sm nav-desktop-guide"
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
              📖 Guide
            </button>

            {/* User Info / Sign In buttons */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setMenuOpen(true)}
                >
                  <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                    {initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.username}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)', fontWeight: 800 }}>
                      {user.total_points} pts
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link
                  href="/login"
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '0.36rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-secondary btn-sm nav-desktop-register"
                  style={{
                    padding: '0.36rem 0.75rem',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger / More Options Menu Trigger */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              title="More options"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile / More Options Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        
        {/* User Greeting & Status inside Drawer */}
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border-color)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: '0.80rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                  🏆 {user.total_points} total points
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Welcome to FootballPredict! ⚽
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Sign in to submit predictions and track points.
              </div>
            </div>
          )}

          {user && (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Logout
            </button>
          )}
        </div>

        {/* Guest Auth Buttons inside Drawer */}
        {!user && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary"
              style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.55rem' }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="btn btn-secondary"
              style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.55rem' }}
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Quick Tools: Theme Toggle & Guide & Coach AI */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {/* Theme Toggle Button in More Options */}
          <button
            onClick={() => toggleTheme()}
            className="mobile-nav-link"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} →
            </span>
          </button>

          {/* Guide Button in More Options */}
          <button
            onClick={() => { setShowGuide(true); setMenuOpen(false); }}
            className="mobile-nav-link"
            style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.25)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📖</span>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              How to Play &amp; Scoring Guide
            </span>
          </button>

          {/* Coach AI Trigger Button in More Options */}
          <button
            onClick={handleOpenCoachAi}
            className="mobile-nav-link"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Coach AI Match Supporter
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800 }}>
              Live
            </span>
          </button>
        </div>

        {/* Navigation Section */}
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.4rem' }}>
          Navigation
        </div>

        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          const isLocked = !link.public && !user;
          return (
            <Link
              key={link.href}
              href={isLocked ? '/login' : link.href}
              className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
              style={isLocked ? { opacity: 0.5 } : {}}
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              <span>{link.label}</span>
              {isLocked && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>🔒</span>}
            </Link>
          );
        })}
      </div>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
