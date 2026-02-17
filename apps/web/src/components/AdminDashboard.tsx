import { useState, useEffect, useCallback } from 'react';
import { X, Users, BarChart3, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react';
import { authenticatedFetch } from '../services/api.ts';

interface AdminDashboardProps {
  onClose: () => void;
}

interface Stats {
  totalUsers: number;
  signups7d: number;
  signups30d: number;
  totalCitations: number;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  featureUsage: Record<string, number>;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  oauthProvider: string;
  createdAt: string;
}

interface FeedbackRow {
  id: string;
  citationText: string | null;
  isHelpful: boolean;
  comment: string | null;
  createdAt: string;
  userEmail: string | null;
}

interface SignupData {
  date: string;
  count: number;
}

interface Insight {
  id: string;
  ruleId: string;
  pattern: string;
  occurrences: number;
  negativeFeedbackRate: number;
  status: string;
}

type Tab = 'overview' | 'users' | 'feedback' | 'insights';

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [signups, setSignups] = useState<SignupData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);

  const fetchData = useCallback(async (endpoint: string) => {
    const res = await authenticatedFetch(`/api/admin/${endpoint}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(data.error || `Failed to fetch ${endpoint}`);
    }
    return res.json();
  }, []);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, signupsData] = await Promise.all([
        fetchData('stats'),
        fetchData('signups'),
      ]);
      setStats(statsData);
      setSignups(signupsData.signups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData('users');
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData('feedback');
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData('insights');
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const computeInsights = useCallback(async () => {
    setComputing(true);
    try {
      await fetchData('compute-insights');
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute insights');
    } finally {
      setComputing(false);
    }
  }, [fetchData, loadInsights]);

  useEffect(() => {
    if (tab === 'overview') loadOverview();
    else if (tab === 'users') loadUsers();
    else if (tab === 'feedback') loadFeedback();
    else if (tab === 'insights') loadInsights();
  }, [tab, loadOverview, loadUsers, loadFeedback, loadInsights]);

  const maxSignupCount = Math.max(...signups.map(s => s.count), 1);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-primary-900">Admin Dashboard</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 px-6">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'insights', label: 'Insights', icon: TrendingUp },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-surface-400 hover:text-surface-600'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl text-sm text-error-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-surface-400">Loading...</div>
          ) : tab === 'overview' && stats ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers} />
                <StatCard label="Signups (7d)" value={stats.signups7d} />
                <StatCard label="Signups (30d)" value={stats.signups30d} />
                <StatCard label="Total Citations" value={stats.totalCitations} />
              </div>

              {/* Feedback Summary */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Feedback" value={stats.totalFeedback} />
                <StatCard label="Positive" value={stats.positiveFeedback} color="text-verified-600" />
                <StatCard label="Negative" value={stats.negativeFeedback} color="text-error-600" />
              </div>

              {/* Feature Usage */}
              {Object.keys(stats.featureUsage).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary-900 mb-3">Feature Usage (30d)</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.featureUsage)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feature, count]) => {
                        const maxUsage = Math.max(...Object.values(stats.featureUsage), 1);
                        return (
                          <div key={feature} className="flex items-center gap-3">
                            <span className="text-xs text-surface-600 w-32 truncate">{feature}</span>
                            <div className="flex-1 bg-surface-100 rounded-full h-5 overflow-hidden">
                              <div
                                className="bg-primary-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(count / maxUsage) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-surface-700 w-12 text-right">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Signup Trend */}
              {signups.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary-900 mb-3">Daily Signups (30d)</h3>
                  <div className="flex items-end gap-1 h-32">
                    {signups.map(s => (
                      <div
                        key={s.date}
                        className="flex-1 bg-primary-400 hover:bg-primary-500 rounded-t transition-colors cursor-default"
                        style={{ height: `${Math.max((s.count / maxSignupCount) * 100, 4)}%` }}
                        title={`${s.date}: ${s.count} signups`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-surface-400">{signups[0]?.date}</span>
                    <span className="text-[10px] text-surface-400">{signups[signups.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </div>
          ) : tab === 'users' ? (
            <div>
              <p className="text-xs text-surface-400 mb-3">{users.length} users</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-surface-400 border-b border-surface-200">
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Provider</th>
                      <th className="pb-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-surface-100">
                        <td className="py-2 pr-4 text-surface-700 truncate max-w-[200px]">{u.email}</td>
                        <td className="py-2 pr-4 text-surface-500">{u.name || '-'}</td>
                        <td className="py-2 pr-4">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-100 text-surface-600">
                            {u.oauthProvider}
                          </span>
                        </td>
                        <td className="py-2 text-surface-400 text-xs">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : tab === 'feedback' ? (
            <div className="space-y-3">
              <p className="text-xs text-surface-400 mb-1">{feedback.length} recent feedback entries</p>
              {feedback.map(f => (
                <div key={f.id} className="p-3 border border-surface-200 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {f.citationText && (
                        <p className="text-xs font-mono text-surface-600 truncate mb-1">{f.citationText}</p>
                      )}
                      {f.comment && (
                        <p className="text-sm text-surface-700">{f.comment}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-surface-400">
                        <span>{formatDate(f.createdAt)}</span>
                        {f.userEmail && <span>{f.userEmail}</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      f.isHelpful ? 'bg-verified-100 text-verified-700' : 'bg-error-100 text-error-700'
                    }`}>
                      {f.isHelpful ? 'Helpful' : 'Not helpful'}
                    </span>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <p className="text-center text-surface-400 py-8">No feedback yet</p>
              )}
            </div>
          ) : tab === 'insights' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-surface-400">{insights.length} insights</p>
                <button
                  onClick={computeInsights}
                  disabled={computing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${computing ? 'animate-spin' : ''}`} />
                  {computing ? 'Computing...' : 'Recompute'}
                </button>
              </div>
              <div className="space-y-3">
                {insights.map(ins => (
                  <div key={ins.id} className="p-3 border border-surface-200 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-primary-900">{ins.ruleId}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{ins.pattern}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-surface-700">{ins.occurrences} occurrences</p>
                        <p className={`text-xs font-medium ${
                          ins.negativeFeedbackRate > 0.3 ? 'text-error-600' : 'text-surface-400'
                        }`}>
                          {(ins.negativeFeedbackRate * 100).toFixed(0)}% negative
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <p className="text-center text-surface-400 py-8">No insights computed yet. Click Recompute to generate.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
      <p className={`text-2xl font-bold ${color || 'text-primary-900'}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-surface-400 mt-1">{label}</p>
    </div>
  );
}
