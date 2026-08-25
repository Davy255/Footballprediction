'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import HowToPlayModal from './HowToPlayModal';

const navLinks = [
  { href: '/football-predictions-today', label: "Today's Tips", public: true, icon: '🎯' },
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
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || (user && user.is_admin)
  );

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={menuRef} className="more-options-wrapper">
            
            {/* Desktop Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="btn btn-secondary btn-sm nav-desktop-guide"
              style={{
                alignItems: 'center', gap: '0.35rem',
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

            {/* Desktop More Options Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-secondary btn-sm nav-desktop-more"
              style={{
                alignItems: 'center', gap: '0.35rem',
                border: menuOpen ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                background: menuOpen ? 'rgba(59,130,246,0.15)' : 'var(--bg-card-hover)',
                color: menuOpen ? 'var(--accent-blue)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="More options"
            >
              <span>More ▾</span>
            </button>

            {/* User Profile Trigger / Guest Auth */}
            {user ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
                onClick={() => setMenuOpen(!menuOpen)}
                title="Account menu"
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

            {/* Hamburger (Mobile trigger) */}
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

            {/* ── DESKTOP & MOBILE COMPACT FLOATING MENU CARD ── */}
            {menuOpen && (
              <div className="more-options-dropdown">
                {/* User Header */}
                {user ? (
                  <div style={{ padding: '0.4rem 0.25rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {user.username}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                            🏆 {user.total_points} total points
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.4rem 0.25rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                      Welcome to FootballPredict ⚽
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.6rem' }}>
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-sm" style={{ textAlign: 'center', fontSize: '0.78rem', padding: '0.35rem' }}>
                        Sign In
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ textAlign: 'center', fontSize: '0.78rem', padding: '0.35rem' }}>
                        Register
                      </Link>
                    </div>
                  </div>
                )}

                {/* 0. Personal Dashboard */}
                <Link
                  href={user ? "/dashboard" : "/login?redirect=/dashboard"}
                  onClick={() => setMenuOpen(false)}
                  className="dropdown-item-btn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.18) 100%)',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>📊</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>My Personal Hub</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 800 }}>Dashboard →</span>
                </Link>

                {/* 1. My Predictions */}
                <Link
                  href={user ? "/predictions" : "/login?redirect=/predictions"}
                  onClick={() => setMenuOpen(false)}
                  className="dropdown-item-btn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.14) 0%, rgba(59, 130, 246, 0.14) 100%)',
                    borderColor: 'rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🎯</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>My Predictions</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 800 }}>Open →</span>
                </Link>

                {/* 2. Coach AI */}
                <button
                  type="button"
                  onClick={handleOpenCoachAi}
                  className="dropdown-item-btn"
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    borderColor: 'rgba(59, 130, 246, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🤖</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Coach AI Assistant</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '10px', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800 }}>Live</span>
                </button>

                {/* 3. Guide */}
                <button
                  type="button"
                  onClick={() => { setShowGuide(true); setMenuOpen(false); }}
                  className="dropdown-item-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>📖</span>
                    <span style={{ fontWeight: 600 }}>Scoring Rules & Guide</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rules</span>
                </button>

                {/* 4. Theme Toggle */}
                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className="dropdown-item-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                    <span style={{ fontWeight: 600 }}>Theme</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                {/* 5. Admin (if applicable) */}
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="dropdown-item-btn"
                    style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.15rem' }}>⚙️</span>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>Admin Panel</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800 }}>Manage</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
