import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { API_BASE } from '../services/api.ts';

export function ReferralCard() {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({ totalReferrals: 0, bonusChecks: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/referral/code`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setReferralLink(data.link))
      .catch(() => {});

    fetch(`${API_BASE}/referral/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-900 mb-1">Refer a Friend</h3>
      <p className="text-sm text-surface-400 mb-4">
        Share your link and earn 5 bonus checks for each friend who signs up.
      </p>

      {/* Referral link */}
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={referralLink}
          className="input-field flex-1 text-xs font-mono"
          onClick={e => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            copied
              ? 'bg-verified-50 text-verified-700'
              : 'btn-primary'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-surface-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary-900">{stats.totalReferrals}</div>
          <div className="text-xs text-surface-400 mt-0.5">Referrals</div>
        </div>
        <div className="flex-1 bg-verified-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-verified-700">{stats.bonusChecks}</div>
          <div className="text-xs text-surface-400 mt-0.5">Bonus Checks</div>
        </div>
      </div>
    </div>
  );
}
