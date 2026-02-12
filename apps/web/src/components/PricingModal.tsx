import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { API_BASE } from '../services/api.ts';

interface PricingModalProps {
  onClose: () => void;
  onSignupRequired: () => void;
}

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    checks: '5 lifetime',
    features: [
      'Full Claude AI verification',
      'All 4 citation modes',
      'Formatting corrections',
      'Logic trace & references',
      'Copy formatted citations',
    ],
  },
  {
    id: 'student' as const,
    name: 'Student',
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    checks: '100 / month',
    popular: true,
    features: [
      'Everything in Free',
      'Citation history',
      'Bulk check mode',
      'Builder mode',
      'Priority processing',
    ],
  },
  {
    id: 'professional' as const,
    name: 'Professional',
    monthlyPrice: 29.99,
    annualPrice: 24.99,
    checks: 'Unlimited',
    features: [
      'Everything in Student',
      'Unlimited checks',
      'API access',
      'Priority support',
      'Team features (coming soon)',
    ],
  },
];

export function PricingModal({ onClose, onSignupRequired }: PricingModalProps) {
  const { user } = useAuth();
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: 'free' | 'student' | 'professional') => {
    if (planId === 'free') {
      onClose();
      return;
    }

    if (!user) {
      onSignupRequired();
      return;
    }

    if (user.plan === planId) return;

    setLoadingPlan(planId);
    try {
      const res = await fetch(`${API_BASE}/billing/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planId, interval }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start checkout');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch(`${API_BASE}/billing/portal`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to open portal');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-3xl w-full p-8 animate-scale-in overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary-900">Choose Your Plan</h2>
          <p className="text-sm text-surface-400 mt-1">All plans include full Claude AI verification</p>

          {/* Interval Toggle */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex bg-surface-100 rounded-xl p-1">
              <button
                onClick={() => setInterval('month')}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  interval === 'month' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('year')}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  interval === 'year' ? 'bg-white shadow-soft text-primary-900 font-medium' : 'text-surface-400'
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs text-verified-600 font-semibold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const price = interval === 'month' ? plan.monthlyPrice : plan.annualPrice;
            const isCurrent = user?.plan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-200 ${
                  plan.popular
                    ? 'border-primary-500 shadow-glow-blue'
                    : 'border-surface-200 hover:border-surface-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary-900">{plan.name}</h3>
                  <div className="mt-3">
                    {price === 0 ? (
                      <span className="text-3xl font-bold text-primary-900">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-primary-900">${price.toFixed(2)}</span>
                        <span className="text-sm text-surface-400">/mo</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-surface-400 mt-1 font-medium">{plan.checks} checks</p>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-surface-600">
                      <span className="text-verified-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => isCurrent ? undefined : handleSelectPlan(plan.id)}
                  disabled={isCurrent || loadingPlan === plan.id}
                  className={`w-full mt-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isCurrent
                      ? 'bg-surface-100 text-surface-400 cursor-default'
                      : plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                  }`}
                >
                  {loadingPlan === plan.id
                    ? 'Redirecting...'
                    : isCurrent
                      ? 'Current Plan'
                      : plan.id === 'free'
                        ? 'Get Started'
                        : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Manage subscription link */}
        {user && user.plan !== 'free' && (
          <div className="text-center mt-6">
            <button
              onClick={handleManageSubscription}
              className="text-sm text-primary-600 hover:text-primary-800 underline transition-colors"
            >
              Manage subscription
            </button>
          </div>
        )}

        {/* Close */}
        <div className="text-center mt-4">
          <button onClick={onClose} className="text-sm text-surface-400 hover:text-surface-600 transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
