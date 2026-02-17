import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { trackEvent } from '../services/analytics.ts';
import { loginWithMicrosoftPopup } from '../services/msal.ts';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'signup';
  message?: string;
}

export function AuthModal({ onClose, initialTab = 'signup', message }: AuthModalProps) {
  const { login, signup, loginWithGoogle, loginWithApple, loginWithMicrosoft, validateEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailValidating, setEmailValidating] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const emailValidationTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      renderGoogleButton();
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  useEffect(() => {
    renderGoogleButton();
  }, [tab]);

  function renderGoogleButton() {
    const buttonDiv = googleBtnRef.current;
    if (buttonDiv && window.google) {
      buttonDiv.innerHTML = '';
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: tab === 'login' ? 'signin_with' : 'signup_with',
      });
    }
  }

  function handleGoogleCredential(response: { credential: string }) {
    setLoading(true);
    setError(null);
    loginWithGoogle(response.credential)
      .then(() => {
        trackEvent('auth_google');
        onClose();
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Google login failed'))
      .finally(() => setLoading(false));
  }

  const handleAppleSignIn = useCallback(async () => {
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    if (!clientId || !window.AppleID) return;

    setLoading(true);
    setError(null);
    try {
      window.AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization.id_token;
      const userName = response.authorization.user
        ? `${response.authorization.user.name.firstName} ${response.authorization.user.name.lastName}`
        : undefined;

      await loginWithApple(idToken, userName);
      trackEvent('auth_apple');
      onClose();
    } catch (err) {
      if (err && typeof err === 'object' && 'error' in err) {
        const appleErr = err as { error: string };
        if (appleErr.error !== 'popup_closed_by_user') {
          setError('Apple sign-in failed');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loginWithApple, onClose]);

  const handleMicrosoftSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await loginWithMicrosoftPopup();
      if (idToken) {
        await loginWithMicrosoft(idToken);
        trackEvent('auth_microsoft');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [loginWithMicrosoft, onClose]);

  const handleEmailBlur = useCallback(() => {
    if (tab !== 'signup' || !email || email.length < 5) return;

    clearTimeout(emailValidationTimer.current);
    emailValidationTimer.current = setTimeout(async () => {
      setEmailValidating(true);
      const result = await validateEmail(email);
      setEmailValidating(false);
      if (!result.valid) {
        setEmailError(result.reason || 'Invalid email');
      } else {
        setEmailError(null);
      }
    }, 300);
  }, [email, tab, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;
    setLoading(true);
    setError(null);

    try {
      if (tab === 'login') {
        await login(email, password);
        trackEvent('auth_login');
      } else {
        await signup(email, password, name || undefined);
        trackEvent('auth_signup');
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasApple = !!import.meta.env.VITE_APPLE_CLIENT_ID;
  const hasMicrosoft = !!import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const hasSocialLogin = hasGoogle || hasApple || hasMicrosoft;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-sm w-full p-5 sm:p-8 animate-scale-in relative" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-800 flex items-center justify-center text-white mx-auto mb-4 shadow-soft">
          <Scale className="w-6 h-6" />
        </div>

        <h2 id="auth-modal-title" className="text-xl font-semibold text-primary-900 text-center">
          {tab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        {message && (
          <p className="text-sm text-surface-500 text-center mt-2">{message}</p>
        )}

        {/* Tab toggle */}
        <div className="flex bg-surface-100 rounded-xl p-1 mt-5">
          <button
            onClick={() => { setTab('signup'); setError(null); setEmailError(null); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
              tab === 'signup' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('login'); setError(null); setEmailError(null); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
              tab === 'login' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Social Login Buttons */}
        {hasSocialLogin && (
          <div className="mt-5 space-y-2">
            {hasGoogle && (
              <div ref={googleBtnRef} className="flex justify-center" />
            )}

            {hasApple && (
              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {tab === 'login' ? 'Sign in with Apple' : 'Sign up with Apple'}
              </button>
            )}

            {hasMicrosoft && (
              <button
                onClick={handleMicrosoftSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-surface-200 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 21 21" fill="none">
                  <rect width="10" height="10" fill="#F25022"/>
                  <rect x="11" width="10" height="10" fill="#7FBA00"/>
                  <rect y="11" width="10" height="10" fill="#00A4EF"/>
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                </svg>
                {tab === 'login' ? 'Sign in with Microsoft' : 'Sign up with Microsoft'}
              </button>
            )}

            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400">or continue with email</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {tab === 'signup' && (
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
            />
          )}
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(null); }}
              onBlur={handleEmailBlur}
              required
              className={`input-field ${emailError ? 'border-error-400 focus:ring-error-400' : ''}`}
            />
            {emailValidating && (
              <p className="text-xs text-surface-400 mt-1">Validating email...</p>
            )}
            {emailError && (
              <p className="text-xs text-error-600 mt-1">{emailError}</p>
            )}
          </div>
          <input
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="input-field"
          />
          {error && (
            <p className="text-sm text-error-600 bg-error-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !!emailError}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-surface-400 text-center mt-4">
          {tab === 'signup'
            ? 'By signing up, you agree to our Terms of Service.'
            : 'Forgot your password? Contact support.'}
        </p>
      </div>
    </div>
  );
}
