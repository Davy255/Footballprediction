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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.fp-hamburger-btn')) {
          setMobileMenuOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

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
            gap: '0.4rem',
            padding: '0 0.75rem',
            width: '100%',
            maxWidth: '1320px',
            margin: '0 auto',
          }}
        >
          {/* Brand Logo (Responsive font & spacing) */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>⚽</span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.12rem',
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

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.2rem',
              margin: '0 auto',
            }}
            className="hidden md:flex"
          >
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.42rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-blue-bg)' : 'transparent',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
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

          {/* Right Action Cluster - Compact on mobile, ensuring full visibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {/* Quick Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '0 0.55rem',
                height: '34px',
                minWidth: '34px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Search clubs, leagues, matches (Ctrl+K)"
              aria-label="Search"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Search</span>
              <kbd
                className="hidden lg:inline"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.25rem',
                  background: 'var(--bg-card)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                Ctrl+K
              </kbd>
            </button>

            {/* VIP Pro Badge (Tablet / Desktop) */}
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(245,158,11,0.15) 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: 'var(--accent-amber)',
                padding: '0 0.55rem',
                height: '34px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              className="hidden sm:inline-flex"
            >
              <span>💎</span>
              <span>VIP Pro</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                padding: 0,
                flexShrink: 0,
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Color Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '0 0.45rem',
                    height: '34px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile menu"
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
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
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.username}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>▾</span>
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
                      onClick={() => setShowGuide(true)}
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        width: '100%',
                      }}
                      className="hover:bg-[var(--bg-elevated)]"
                    >
                      <span>📖</span>
                      <span>How to Play Guide</span>
                    </button>
                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.2rem', paddingTop: '0.2rem' }}>
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
                        }}
                        className="hover:bg-[var(--accent-red-bg)]"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  href="/login"
                  className="fp-btn-primary"
                  style={{
                    padding: '0 0.6rem',
                    height: '34px',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="fp-hamburger-btn md:hidden"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
              aria-label="Toggle navigation drawer"
              aria-expanded={mobileMenuOpen}
            >
              <span style={{ width: '16px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: '0.2s' }} />
              <span style={{ width: '16px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: '0.2s' }} />
              <span style={{ width: '16px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', transition: '0.2s' }} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Sheet */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden"
            style={{
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: 'calc(100vh - 58px)',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-card-hover)',
            }}
          >
            {/* Category 1: Matches & Tips */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Predictions &amp; Fixtures
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {primaryNavLinks.slice(0, 4).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: pathname === link.href ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                      color: pathname === link.href ? 'var(--accent-blue)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      minHeight: '44px',
                    }}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category 2: Intelligence & Data */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Intelligence &amp; Data
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {primaryNavLinks.slice(4).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: pathname === link.href ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                      color: pathname === link.href ? 'var(--accent-blue)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
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
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: pathname === '/accuracy' ? 'var(--accent-blue-bg)' : 'var(--bg-elevated)',
                    color: pathname === '/accuracy' ? 'var(--accent-blue)' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    minHeight: '44px',
                  }}
                >
                  <span>📈</span>
                  <span>Accuracy</span>
                </Link>
              </div>
            </div>

            {/* Category 3: Quick Tools */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.2rem' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); setShowGuide(true); }}
                className="fp-btn-secondary"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.84rem' }}
              >
                📖 Rules &amp; Guide
              </button>
              <Link
                href="/pricing"
                className="fp-btn-primary"
                style={{
                  flex: 1,
                  minHeight: '44px',
                  fontSize: '0.84rem',
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                }}
              >
                💎 VIP Pro
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
