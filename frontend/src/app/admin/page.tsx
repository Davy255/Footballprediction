'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminStats, triggerAdminSync, triggerAdminOddsSync, triggerAdminScoring, testSendAdminEmail, triggerAdminDailyReminders, loginUser } from '@/lib/api';
import { AdminStats } from '@/lib/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, login, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [oddsMsg, setOddsMsg] = useState<string | null>(null);
  const [scoreMsg, setScoreMsg] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin login form state
  const [username, setUsername] = useState('Wes@254');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5-Minute Idle Inactivity Auto-Logout
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number>(300); // 5 minutes

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminStats()
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Track Inactivity while logged in on Admin Panel
  useEffect(() => {
    if (!user || !user.is_admin) return;

    const IDLE_LIMIT_SECONDS = 300; // 5 minutes
    let lastActivityTime = Date.now();

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
      setIdleSecondsLeft(IDLE_LIMIT_SECONDS);
    };

    const trackedEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    trackedEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityTime) / 1000);
      const remaining = Math.max(0, IDLE_LIMIT_SECONDS - elapsedSeconds);
      setIdleSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerInterval);
        logout();
        setSessionExpiredMsg('⚠️ Admin session expired due to 5 minutes of inactivity. Please sign in again.');
      }
    }, 1000);

    return () => {
      trackedEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(timerInterval);
    };
  }, [user, logout]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSessionExpiredMsg(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('password', password);
      
      const res = await loginUser(formData);
      
      if (!res.user || !res.user.is_admin) {
        setLoginError('This account does not have administrator privileges.');
        return;
      }

      login(res.access_token, res.user);
      setIdleSecondsLeft(300);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncMsg('Triggering full competition season sync in background...');
      const res = await triggerAdminSync();
      setSyncMsg(res.detail);
    } catch (err: any) {
      setSyncMsg(`Sync error: ${err.message}`);
    }
  };

  const handleOddsSync = async () => {
    try {
      setOddsMsg('Fetching live Bet365 / Pinnacle odds from The Odds API in background...');
      const res = await triggerAdminOddsSync();
      setOddsMsg(res.detail);
    } catch (err: any) {
      setOddsMsg(`Odds sync error: ${err.message}`);
    }
  };

  const handleScore = async () => {
    try {
      setScoreMsg('Calculating and scoring predictions in background...');
      const res = await triggerAdminScoring();
      setScoreMsg(res.detail);
    } catch (err: any) {
      setScoreMsg(`Scoring error: ${err.message}`);
    }
  };

  const handleSendTestEmail = async (type: string) => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setEmailStatusMsg('❌ Please enter a valid recipient email address first.');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatusMsg(`Sending test ${type} email to ${testEmailRecipient}...`);
    try {
      const res = await testSendAdminEmail(testEmailRecipient, type);
      setEmailStatusMsg(`✅ Result: ${res.message} (Mode: ${res.mode})`);
    } catch (err: any) {
      setEmailStatusMsg(`❌ Error sending email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleTriggerDailyReminders = async () => {
    setEmailStatusMsg('Dispatching daily match reminders to all active users in background...');
    try {
      const res = await triggerAdminDailyReminders();
      setEmailStatusMsg(`✅ ${res.detail}`);
    } catch (err: any) {
      setEmailStatusMsg(`❌ Error triggering reminders: ${err.message}`);
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="container" style={{ marginTop: '3.5rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Portal Login</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '0.3rem' }}>
              Restricted management area. Sign in with your administrator account.
            </p>
          </div>

          {sessionExpiredMsg && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#facc15',
              fontSize: '0.86rem',
              marginBottom: '1.2rem',
              lineHeight: 1.4,
            }}>
              {sessionExpiredMsg}
            </div>
          )}

          {loginError && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.88rem',
              marginBottom: '1.2rem',
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Admin Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Admin Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Top Admin Status Ribbon & Navigation Bar */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.3rem' }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Logged in as: <span style={{ color: 'var(--accent-blue)' }}>{user.username}</span> (Super Admin)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              System Administrator • Full Permissions
            </div>
          </div>

          {/* 5-Minute Inactivity Auto-Logout Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            background: idleSecondsLeft < 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.15)',
            border: idleSecondsLeft < 60 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(234, 179, 8, 0.3)',
            color: idleSecondsLeft < 60 ? '#f87171' : '#facc15',
            fontSize: '0.76rem',
            fontWeight: 800,
          }}>
            <span>⏱️ Inactivity Logout:</span>
            <span>{formatTimer(idleSecondsLeft)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link
            href="/"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.80rem', padding: '0.4rem 0.85rem', fontWeight: 700 }}
          >
            🌐 View Public Site →
          </Link>
          <button
            onClick={() => logout()}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.80rem', padding: '0.4rem 0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          Admin Dashboard ⚙️
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          System telemetry, manual data sync triggers, live bookmaker odds integration, email tester, and prediction scoring controls.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading telemetry stats...
        </div>
      ) : (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                {stats?.total_users || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Fixture Matches</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: '0.2rem' }}>
                {stats?.total_matches || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total User Predictions</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '0.2rem' }}>
                {stats?.total_predictions || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upcoming Scheduled</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                {stats?.scheduled_matches || 0}
              </div>
            </div>
          </div>

          {/* Admin Control Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>🔄 Sync Live Fixtures</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Fetch current season schedules, live scores, and finished match results from football-data.org.
              </p>
              <button onClick={handleSync} className="btn btn-primary" style={{ width: '100%', fontSize: '0.86rem' }}>
                Trigger Match Sync Now
              </button>
              {syncMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', fontSize: '0.82rem' }}>
                  {syncMsg}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>🏷️ Sync Live Bookmaker Odds</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Fetch live real-time Bet365 / Pinnacle bookmaker odds from <strong>The Odds API</strong>.
              </p>
              <button onClick={handleOddsSync} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.86rem', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
                Sync Live Odds API Now
              </button>
              {oddsMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', fontSize: '0.82rem' }}>
                  {oddsMsg}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>🎯 Score Predictions</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Process all unscored user predictions for finished matches and update user leaderboard points.
              </p>
              <button onClick={handleScore} className="btn btn-accent" style={{ width: '100%', fontSize: '0.86rem' }}>
                Calculate &amp; Score Predictions
              </button>
              {scoreMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', fontSize: '0.82rem' }}>
                  {scoreMsg}
                </div>
              )}
            </div>

            {/* Email Testing & Reminder Dispatch Card */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>📧 Email Service &amp; Reminders</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Test live transactional email delivery (Welcome, Daily Digest, Password Reset) or trigger daily reminders.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Enter recipient email..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    marginBottom: '0.6rem',
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <button
                    onClick={() => handleSendTestEmail('welcome')}
                    disabled={isSendingEmail}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Send Welcome Email
                  </button>
                  <button
                    onClick={() => handleSendTestEmail('reminder')}
                    disabled={isSendingEmail}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Send Match Reminder
                  </button>
                </div>
                <button
                  onClick={handleTriggerDailyReminders}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem' }}
                >
                  🚀 Dispatch Daily Reminders to All Users
                </button>
              </div>

              {emailStatusMsg && (
                <div style={{ marginTop: '0.8rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', fontSize: '0.82rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  {emailStatusMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
