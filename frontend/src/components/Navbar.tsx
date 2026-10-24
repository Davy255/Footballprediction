'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import HowToPlayModal from './HowToPlayModal';
import SearchModal from './SearchModal';

const primaryNavLinks = [
  { href: '/football-predictions-today', label: "Today's Predictions", icon: '🎯' },
  { href: '/fixtures', label: 'Fixtures', icon: '⚽' },
  { href: '/live', label: 'Live Now', icon: '🔴', isLive: true },
  { href: '/leagues', label: 'Leagues', icon: '🏆' },
  { href: '/articles', label: 'Analysis', icon: '📚' },
  { href: '/stats', label: 'AI Stats', icon: '📊' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '👑' },
];

/**
 * Intelligent active navigation matching helper.
 * Handles nested subroutes for articles, leagues, fixtures, and match predictions.
 */
function isNavActive(pathname: string, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  if (pathname === href) return true;
  if (href === '/football-predictions-today') {
    return pathname.startsWith('/football-predictions-today') || pathname.startsWith('/prediction/');
  }
  if (href === '/fixtures') {
    return pathname.startsWith('/fixtures');
  }
  if (href === '/leagues') {
    return pathname.startsWith('/leagues') || pathname.startsWith('/league/');
  }
  if (href === '/articles') {
    return pathname.startsWith('/articles');
  }
  return pathname === href;
}

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
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpenRef = useRef(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '';

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

  // Close menus on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Keyboard focus management: restore focus to menu toggle button when drawer closes
  useEffect(() => {
    if (moreMenuOpen) {
      wasMenuOpenRef.current = true;
    } else if (wasMenuOpenRef.current) {
      wasMenuOpenRef.current = false;
      menuBtnRef.current?.focus();
    }
  }, [moreMenuOpen]);

  // Body scroll-lock when mobile drawer is open
  useEffect(() => {
    if (moreMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [moreMenuOpen]);

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
            height: '58px',
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
              gap: '0.4rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            aria-label="FootballPredict Home"
          >
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>⚽</span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
            aria-label="Primary Navigation"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.25rem',
              margin: '0 auto',
            }}
            className="hidden lg:flex"
          >
            {primaryNavLinks.map((link) => {
              const isActive = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-brand-emerald)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid transparent',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    minHeight: '38px',
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
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '25%',
                        right: '25%',
                        height: '2px',
                        background: 'var(--color-brand-emerald)',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {/* Quick Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md, 10px)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                minHeight: '44px',
                transition: 'all 0.15s ease',
              }}
              className="hover:text-[var(--text-primary)] hover:border-[var(--color-brand-emerald)]"
              title="Search teams, leagues, and fixtures (Ctrl+K)"
              aria-label="Search football content"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="hidden md:inline" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Search</span>
              <kbd
                className="hidden lg:inline"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}
              >
                Ctrl+K
              </kbd>
            </button>

            {/* Quick Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              style={{
                width: '44px',
                height: '44px',
                minHeight: '44px',
                borderRadius: 'var(--radius-md, 10px)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s ease',
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
              className="hidden sm:flex hover:border-[var(--color-brand-emerald)]"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* User Profile / Auth State Button */}
            {user ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    width: '44px',
                    height: '44px',
                    minHeight: '44px',
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                  title={user.username}
                >
                  {initials ? (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                      }}
                    >
                      {initials}
                    </div>
                  ) : (
                    <span style={{ fontSize: '1.15rem' }}>👤</span>
                  )}
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
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        minHeight: '36px',
                      }}
                      className="hover:bg-[var(--bg-elevated)]"
                    >
                      <span>📊</span>
                      <span>Personal Dashboard</span>
                    </Link>
                    {user.is_admin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          padding: '0.45rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          minHeight: '36px',
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
                        minHeight: '36px',
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
              <Link
                href="/login"
                style={{
                  width: '44px',
                  height: '44px',
                  minHeight: '44px',
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                }}
                title="Sign In / Register"
                aria-label="Sign In"
              >
                👤
              </Link>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              ref={menuBtnRef}
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="fp-more-options-btn"
              style={{
                width: '44px',
                height: '44px',
                minHeight: '44px',
                borderRadius: 'var(--radius-md, 10px)',
                background: moreMenuOpen ? 'var(--color-brand-emerald)' : 'var(--bg-elevated)',
                border: '1px solid ' + (moreMenuOpen ? 'var(--color-brand-emerald-dark)' : 'var(--border-color)'),
                color: moreMenuOpen ? '#FFFFFF' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              aria-label={moreMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={moreMenuOpen}
            >
              {moreMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
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
              maxHeight: 'calc(100vh - 58px)',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-card-hover)',
            }}
          >
            {/* Mobile Drawer Header with Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-emerald)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                Navigation &amp; Quick Tools
              </span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  minHeight: '36px',
                }}
                aria-label="Close navigation menu"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>

            {/* Top Quick Actions Row: Search + Theme Toggle + Coach AI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
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
                  minHeight: '44px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
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
                  minHeight: '44px',
                }}
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
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
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: 'var(--color-brand-emerald)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: '44px',
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                {primaryNavLinks.slice(0, 4).map((link) => {
                  const isActive = isNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-elevated)',
                        color: isActive ? 'var(--color-brand-emerald)' : 'var(--text-primary)',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        fontWeight: isActive ? 700 : 500,
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
                      {isActive && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-brand-emerald)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Intelligence & Analytics */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Intelligence &amp; Data
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                {primaryNavLinks.slice(4).map((link) => {
                  const isActive = isNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-elevated)',
                        color: isActive ? 'var(--color-brand-emerald)' : 'var(--text-primary)',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        fontWeight: isActive ? 700 : 500,
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
                      {isActive && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-brand-emerald)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
                {(() => {
                  const isAuditActive = pathname === '/stats';
                  return (
                    <Link
                      href="/stats"
                      onClick={() => setMoreMenuOpen(false)}
                      aria-current={isAuditActive ? 'page' : undefined}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isAuditActive ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-elevated)',
                        color: isAuditActive ? 'var(--color-brand-emerald)' : 'var(--text-primary)',
                        border: isAuditActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        fontWeight: isAuditActive ? 700 : 500,
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
                      {isAuditActive && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-brand-emerald)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })()}
              </div>
            </div>

            {/* Category 3: VIP Pro & Platform Tools */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.3rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setMoreMenuOpen(false); setShowGuide(true); }}
                className="fp-btn-secondary"
                style={{ flex: '1 1 130px', minHeight: '44px', fontSize: '0.84rem' }}
              >
                📖 Rules &amp; Guide
              </button>
              <Link
                href="/pricing"
                onClick={() => setMoreMenuOpen(false)}
                className="fp-btn-primary"
                style={{
                  flex: '1 1 130px',
                  minHeight: '44px',
                  fontSize: '0.84rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                }}
              >
                💎 VIP Pro Analytics
              </Link>
            </div>

            {/* Category 4: Company & Trust Information */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Company &amp; Trust
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                {[
                  { href: '/about', label: 'About Us', icon: 'ℹ️' },
                  { href: '/contact', label: 'Contact', icon: '✉️' },
                  { href: '/disclaimer', label: 'Disclaimer', icon: '⚖️' },
                ].map((item) => {
                  const isActive = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-elevated)',
                        color: isActive ? 'var(--color-brand-emerald)' : 'var(--text-primary)',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.84rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        minHeight: '44px',
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-brand-emerald)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
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
