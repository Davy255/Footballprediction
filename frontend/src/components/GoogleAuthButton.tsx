'use client';

import React, { useEffect, useState } from 'react';
import { loginWithGoogle } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function GoogleAuthButton({
  mode = 'signin',
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '705959190306-83n3aesdq2mpfu7hn5fbq12mm120rl99.apps.googleusercontent.com';

  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services Script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode === 'signup' ? 'signup' : 'signin',
        });

        const btnContainer = document.getElementById(`google-btn-container-${mode}`);
        if (btnContainer) {
          btnContainer.innerHTML = '';
          const cardWidth = btnContainer.parentElement?.clientWidth || 380;
          const targetWidth = Math.min(390, Math.max(280, cardWidth));

          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: targetWidth,
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            logo_alignment: 'center',
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, mode]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      let email = '';
      let name = '';
      let picture = '';

      if (response && response.credential) {
        try {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const parsed = JSON.parse(jsonPayload);
          email = parsed.email || '';
          name = parsed.name || parsed.given_name || '';
          picture = parsed.picture || '';
        } catch (e) {
          console.warn('Could not parse Google JWT locally:', e);
        }
      }

      const res = await loginWithGoogle({
        token: response.credential,
        email: email || undefined,
        name: name || undefined,
        picture: picture || undefined,
      });

      login(res.access_token, res.user);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (onError) onError(err.message || 'Google authentication failed. Please try username sign in.');
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (clientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      if (onError) {
        onError('Google Client ID is loading. Please wait a moment or use standard sign in.');
      }
    }
  };

  return (
    <div className="google-auth-wrapper" style={{ width: '100%', margin: '0.85rem auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Official Google Account Chooser Button */}
      <div id={`google-btn-container-${mode}`} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }} />

      {/* Fallback button if Google SDK is loading or not configured */}
      {!clientId && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: '390px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-card)',
            margin: '0 auto',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Connecting to Google...' : mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </button>
      )}
    </div>
  );
}
