import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'signup';
  message?: string;
}

export function AuthModal({ onClose, initialTab = 'signup', message }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name || undefined, referralCode || undefined);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-sm w-full p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
          &#10005;
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-800 flex items-center justify-center text-white text-xl mx-auto mb-4 shadow-soft">
          &#9878;
        </div>

        <h2 className="text-xl font-semibold text-primary-900 text-center">
          {tab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        {message && (
          <p className="text-sm text-surface-500 text-center mt-2">{message}</p>
        )}

        {/* Tab toggle */}
        <div className="flex bg-surface-100 rounded-xl p-1 mt-5">
          <button
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
              tab === 'signup' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
              tab === 'login' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {tab === 'signup' && (
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="input-field"
          />
          {tab === 'signup' && (
            <input
              type="text"
              placeholder="Referral code (optional)"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value)}
              className="input-field"
            />
          )}

          {error && (
            <p className="text-sm text-error-600 bg-error-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
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
