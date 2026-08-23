'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({ username, email, password });
      login(res.access_token, res.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) ? 3 : 2;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Too short (min 8 chars)', 'Fair', 'Strong'];

  return (
    <div className="auth-page">
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
          <h1 className="auth-title">Create Account 🚀</h1>
          <p className="auth-subtitle">
            Already registered?{' '}
            <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
              Sign in →
            </Link>
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 1-Tap Google Sign Up */}
        <GoogleAuthButton
          mode="signup"
          onSuccess={() => router.push('/')}
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
          <span>Or register with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              required
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. striker99"
              autoComplete="username"
            />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              3–30 characters (letters, numbers, underscore)
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars (letters & numbers)"
                autoComplete="new-password"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: '0.45rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '3px',
                        borderRadius: '3px',
                        background: strength >= level ? strengthColors[strength] : 'var(--border-color)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: strengthColors[strength], fontWeight: 600 }}>
                  {strengthLabels[strength]}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.25rem' }}
          >
            {loading ? (
              <><span className="spinner" /> Creating Account...</>
            ) : (
              'Create Free Account 🚀'
            )}
          </button>
        </form>

        {/* Feature Badges */}
        <div className="auth-feature-pills">
          <span className="auth-pill">🆓 100% Free Forever</span>
          <span className="auth-pill">📊 Deep Match Stats</span>
          <span className="auth-pill">🏆 Global Rankings</span>
        </div>

        {/* Terms footer note */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '1rem',
            lineHeight: 1.4,
          }}
        >
          By signing up, you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
