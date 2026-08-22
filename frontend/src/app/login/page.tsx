'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const res = await loginUser(formData);
      login(res.access_token, res.user);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem' }}>
        Welcome Back 👋
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
          Sign up free →
        </Link>
      </p>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">Username or Email</label>
          <input
            id="login-username"
            type="text"
            className="form-input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username or email"
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '1rem',
                color: 'var(--text-muted)', padding: '0.25rem',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
        >
          {loading ? (
            <><span className="spinner" /> Signing in...</>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-panel-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>⚽</span>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              FootballPredict
            </span>
          </Link>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            Your Edge in<br />
            <span style={{ color: 'var(--accent-blue)' }}>Match Predictions</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Log in to submit predictions, track your accuracy, and compete on the global leaderboard.
          </p>

          <ul className="auth-feature-list">
            {[
              { icon: '📈', text: 'Statistical match projections backed by 87k+ matches' },
              { icon: '📊', text: 'Live odds from Bet365, Pinnacle & more' },
              { icon: '🎯', text: 'Earn up to 8 points per correct prediction' },
              { icon: '👑', text: 'Compete globally on the leaderboard' },
            ].map((f) => (
              <li key={f.text}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Form Panel — Suspense required for useSearchParams */}
      <div className="auth-panel-right">
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span className="spinner" style={{ borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }} />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
