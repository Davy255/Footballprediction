'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { forgotPassword, resetPassword } from '@/lib/api';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [step, setStep] = useState<1 | 2>(tokenFromUrl ? 2 : 1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    tokenFromUrl ? 'Reset token loaded from your email! Please enter your new password below.' : null
  );

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setStep(2);
    }
  }, [tokenFromUrl]);

  // Step 1: Request Password Reset Token
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setStep(2);
        setSuccessMsg('Reset token generated! Please set your new password below.');
      } else {
        setSuccessMsg(res.detail || 'If this email is registered, password reset instructions have been generated.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await resetPassword({ token: resetToken, new_password: newPassword });
      setSuccessMsg(res.detail || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const strength = newPassword.length === 0 ? 0 : newPassword.length < 8 ? 1 : (/[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword)) ? 3 : 2;
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
              fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              FootballPredict
            </span>
          </Link>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            Account Security &<br />
            <span style={{ color: 'var(--accent-blue)' }}>Password Recovery</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Quickly recover access to your account to continue predicting matches, earning points, and tracking your global leaderboard ranking.
          </p>

          <ul className="auth-feature-list">
            {[
              { icon: '🔒', text: 'Secure, time-limited token authentication' },
              { icon: '🛡️', text: 'Strict password complexity protection' },
              { icon: '⚡', text: 'Instant password reset and account unlock' },
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
            {step === 1 ? 'Forgot Password? 🔑' : 'Reset Password 🔒'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Remembered your password?{' '}
            <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
              Back to Sign In →
            </Link>
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Your Registered Email</label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email address"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                {loading ? (
                  <><span className="spinner" /> Generating Reset Token...</>
                ) : (
                  'Continue to Reset Password →'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
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
                  <><span className="spinner" /> Updating Password...</>
                ) : (
                  'Update Password & Sign In 🚀'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: '100%', marginTop: '0.75rem', background: 'none',
                  border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                ← Back to enter email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span className="spinner" style={{ borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }} />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
