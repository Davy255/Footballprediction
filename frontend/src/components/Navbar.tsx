'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import HowToPlayModal from './HowToPlayModal';
import SearchModal from './SearchModal';

const primaryNavLinks = [
  { href: '/football-predictions-today', label: "Today's Tips", icon: '🎯' },
  { href: '/fixtures', label: 'Fixtures', icon: '⚽' },
  { href: '/live', label: 'Live Now', icon: '🔴', isLive: true },
  { href: '/leagues', label: 'Leagues', icon: '🏆' },
  { href: '/articles', label: 'Analysis', icon: '📚' },
  { href: '/stats', label: 'AI Stats', icon: '📊' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '👑' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  // Keyboard shortcut (Ctrl+K or Cmd+K) to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.fp-more-options-btn')) {
          setMoreMenuOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMoreMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const openCoachAi = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-coach-ai'));
    }
    setMoreMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          width: '100%',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
            gap: '0.75rem',
            padding: '0 1rem',
            width: '100%',
            maxWidth: '1320px',
            margin: '0 auto',
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>⚽</span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              FootballPredict
            </span>
          </Link>

          {/* Desktop Navigation Links (Middle) */}
          <nav
            aria-label="Main Navigation"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.2rem',
              margin: '0 auto',
            }}
            className="hidden lg:flex"
          >
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.45rem 0.7rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-blue-bg)' : 'transparent',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  {link.isLive && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        display: 'inline-block',
                        boxShadow: '0 0 6px rgba(239,68,68,0.8)',
                      }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Clean Right Cluster: User Profile + More Options Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* User Profile / Auth State */}
            {user ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    height: '36px',
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile menu"
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.1 }} className="hidden sm:block">
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.username}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▾</span>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '210px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-card-hover)',
                      padding: '0.5rem',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.username}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    <Link
                      href="/dashboard"
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                      className="hover:bg-[var(--bg-elevated)]"
                    >
                      <span>📊</span>
                      <span>Personal Dashboard</span>
                    </Link>
                    {user.is_admin && (
                      <Link
                        href="/admin"
                        style={{
                          padding: '0.45rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                        className="hover:bg-[var(--bg-elevated)]"
                      >
                        <span>⚙️</span>
                        <span>Admin Console</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--accent-red)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        width: '100%',
                        fontWeight: 600,
                        borderTop: '1px solid var(--border-color)',
                        marginTop: '0.2rem',
                        paddingTop: '0.4rem',
                      }}
                      className="hover:bg-[var(--accent-red-bg)]"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  href="/login"
                  className="fp-btn-primary"
                  style={{
                    padding: '0 0.85rem',
                    height: '36px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* "More Options" Menu Button (Always fully visible, comfortable and responsive) */}
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="fp-more-options-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0 0.75rem',
                height: '36px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              aria-label="Open More Options Menu"
              aria-expanded={moreMenuOpen}
            >
              <span style={{ fontSize: '1.1rem' }}>☰</span>
              <span className="hidden sm:inline">Options</span>
            </button>
          </div>
        </div>

        {/* "More Options" Full Dropdown & Mobile Drawer */}
        {moreMenuOpen && (
          <div
            ref={moreMenuRef}
            style={{
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              maxHeight: 'calc(100vh - 60px)',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-card-hover)',
            }}
          >
            {/* Top Quick Actions Row: Search + Theme Toggle + Coach AI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {/* 1. Quick Search Trigger */}
              <button
                onClick={() => { setMoreMenuOpen(false); setShowSearch(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🔍</span>
                <span>Search</span>
              </button>

              {/* 2. Theme Toggle (Light / Dark Switcher) */}
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* 3. Coach AI Trigger */}
              <button
                onClick={openCoachAi}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: 'var(--accent-blue)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span>Coach AI</span>
              </button>
            </div>

            {/* Category 1: Predictions & Matches */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Predictions &amp; Fixtures
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.45rem' }}>
                {primaryNavLinks.slice(0, 4).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      background: pathname === link.href ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                      color: pathname === link.href ? 'var(--accent-blue)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      minHeight: '44px',
                    }}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category 2: Intelligence & Analytics */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Intelligence &amp; Data
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.45rem' }}>
                {primaryNavLinks.slice(4).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      background: pathname === link.href ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                      color: pathname === link.href ? 'var(--accent-blue)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      minHeight: '44px',
                    }}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
                <Link
                  href="/accuracy"
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    background: pathname === '/accuracy' ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                    color: pathname === '/accuracy' ? 'var(--accent-blue)' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    minHeight: '44px',
                  }}
                >
                  <span>📈</span>
                  <span>Accuracy Audit</span>
                </Link>
              </div>
            </div>

            {/* Category 3: VIP Pro & Platform Tools */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.3rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setMoreMenuOpen(false); setShowGuide(true); }}
                className="fp-btn-secondary"
                style={{ flex: '1 1 140px', minHeight: '44px', fontSize: '0.84rem' }}
              >
                📖 Rules &amp; Guide
              </button>
              <Link
                href="/pricing"
                className="fp-btn-primary"
                style={{
                  flex: '1 1 140px',
                  minHeight: '44px',
                  fontSize: '0.84rem',
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                }}
              >
                💎 VIP Pro Analytics
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Reusable Modals */}
      {showGuide && <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />}
      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
    </>
  );
}
