'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminStats, triggerAdminSync, triggerAdminOddsSync, triggerAdminScoring, testSendAdminEmail, triggerAdminDailyReminders, loginUser } from '@/lib/api';
import { AdminStats } from '@/lib/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, login } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [oddsMsg, setOddsMsg] = useState<string | null>(null);
  const [scoreMsg, setScoreMsg] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await loginUser(formData);
      
      if (!res.user || !res.user.is_admin) {
        setLoginError('This account does not have administrator privileges.');
        return;
      }

      login(res.access_token, res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Portal Login 🔒</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Sign in with your administrator account to access controls.
            </p>
          </div>

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
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSync = async () => {
    try {
      setSyncMsg('Syncing matches from football-data.org in background...');
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

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Admin Dashboard ⚙️</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          System telemetry, manual data sync triggers, live bookmaker odds integration, and prediction scoring controls.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading stats...
        </div>
      ) : (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                {stats?.total_users || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Matches</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.2rem' }}>
                {stats?.total_matches || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Predictions</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.2rem' }}>
                {stats?.total_predictions || 0}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scheduled Matches</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                {stats?.scheduled_matches || 0}
              </div>
            </div>
          </div>

          {/* Admin Control Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>🔄 Sync Live Fixtures</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Fetch current season schedules, live scores, and finished match results from football-data.org.
              </p>
              <button onClick={handleSync} className="btn btn-primary" style={{ width: '100%' }}>
                Trigger Match Sync Now
              </button>
              {syncMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', fontSize: '0.85rem' }}>
                  {syncMsg}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>🏷️ Sync Live Bookmaker Odds</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Fetch live real-time Bet365 / Pinnacle bookmaker odds from <strong>The Odds API</strong>.
              </p>
              <button onClick={handleOddsSync} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
                Sync Live Odds API Now
              </button>
              {oddsMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', fontSize: '0.85rem' }}>
                  {oddsMsg}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>🎯 Score Predictions</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Process all unscored user predictions for finished matches and update user leaderboard points.
              </p>
              <button onClick={handleScore} className="btn btn-accent" style={{ width: '100%' }}>
                Calculate &amp; Score Predictions
              </button>
              {scoreMsg && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', fontSize: '0.85rem' }}>
                  {scoreMsg}
                </div>
              )}
            </div>

            {/* Email Testing & Reminder Dispatch Card */}
            <div className="glass-panel" style={{ padding: '1.8rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>📧 Email Service &amp; Reminders</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
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
                    color: '#fff',
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
