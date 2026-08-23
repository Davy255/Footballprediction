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
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Too short', 'Fair', 'Strong'];

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-panel-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>⚽</span>
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              FootballPredict
            </span>
          </Link>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            Join Thousands of<br />
            <span style={{ color: 'var(--accent-green)' }}>Expert Predictors</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Create your free account to submit match predictions and climb the global leaderboard.
          </p>

          <ul className="auth-feature-list">
            {[
              { icon: '🆓', text: 'Free to join — no credit card required' },
              { icon: '📊', text: 'Access comprehensive match analysis and odds' },
              { icon: '📈', text: 'Track your accuracy and prediction history' },
              { icon: '🏆', text: 'Earn points and compete globally' },
            ].map((f) => (
              <li key={f.text}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-panel-right">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem' }}>
            Create Account 🚀
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Already registered?{' '}
            <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
              Sign in →
            </Link>
          </p>

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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.25rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span>Or register with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
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
                placeholder="Enter your username"
                autoComplete="username"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                3–30 characters (letters, numbers, underscore)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
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
                  placeholder="Min 8 characters (letters & numbers)"
                  autoComplete="new-password"
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

              {/* Password Strength Bar */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                    {[1, 2, 3].map((level) => (
                      <div key={level} style={{
                        flex: 1, height: '3px', borderRadius: '3px',
                        background: strength >= level ? strengthColors[strength] : 'var(--border-color)',
                        transition: 'background 0.3s ease',
                      }} />
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
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <><span className="spinner" /> Creating account...</>
              ) : (
                'Create Free Account 🚀'
              )}
            </button>
          </form>

          <p style={{
            marginTop: '1.5rem', fontSize: '0.78rem',
            color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5,
          }}>
            By signing up, you agree to our Terms of Service. Provided for entertainment and statistical analysis purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
