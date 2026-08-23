'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GoogleAuthButton from '@/components/GoogleAuthButton';

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
    <div className="auth-card">
      {/* Header */}
      <div className="auth-header">
        <Link href="/" className="auth-logo">
          <span style={{ fontSize: '2rem' }}>⚽</span>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: '1.45rem',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FootballPredict
          </span>
        </Link>
        <h1 className="auth-title">Welcome Back 👋</h1>
        <p className="auth-subtitle">
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
            Sign up free →
          </Link>
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 1-Tap Google Sign In */}
      <GoogleAuthButton
        mode="signin"
        onSuccess={() => router.push(redirect)}
        onError={(err) => setError(err)}
      />

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.25rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        <span>Or continue with username</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
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

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text-muted)',
                padding: '0.25rem',
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
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.25rem' }}
        >
          {loading ? (
            <><span className="spinner" /> Signing in...</>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      {/* Feature Badges */}
      <div className="auth-feature-pills">
        <span className="auth-pill">📈 Match Analytics</span>
        <span className="auth-pill">🎯 Over/Under 2.5</span>
        <span className="auth-pill">👑 Global Leaderboard</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span className="spinner" style={{ borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }} />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
