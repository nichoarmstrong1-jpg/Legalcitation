import { useState, useCallback } from 'react';
import { X, Pencil, Check, Key, Trash2, Shield, Calendar, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { updateProfile, changePassword, deleteAccount } from '../services/api.ts';

interface ProfileModalProps {
  onClose: () => void;
  onFormatChange: (style: 'italics' | 'underline') => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  email: 'Email & Password',
  google: 'Google',
  apple: 'Apple',
  microsoft: 'Microsoft',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  student: 'Student',
  professional: 'Professional',
};

export function ProfileModal({ onClose, onFormatChange }: ProfileModalProps) {
  const { user, logout, refreshUser } = useAuth();

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);

  // Format preference
  const [formatSaving, setFormatSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSaveName = useCallback(async () => {
    if (!user) return;
    setNameSaving(true);
    setGeneralError(null);
    try {
      await updateProfile({ name: nameValue });
      await refreshUser();
      setEditingName(false);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setNameSaving(false);
    }
  }, [nameValue, user, refreshUser]);

  const handleFormatChange = useCallback(async (style: 'italics' | 'underline') => {
    setFormatSaving(true);
    setGeneralError(null);
    try {
      await updateProfile({ formatPreference: style });
      await refreshUser();
      onFormatChange(style);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to update preference');
    } finally {
      setFormatSaving(false);
    }
  }, [refreshUser, onFormatChange]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteAccount(deleteEmail);
      await logout();
      onClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  }, [deleteEmail, user, logout, onClose]);

  if (!user) return null;

  const isEmailAccount = user.oauthProvider === 'email';
  const formatPref = user.formatPreference || 'italics';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        className="bg-white rounded-3xl shadow-modal max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
          <h2 id="profile-title" className="text-lg font-semibold text-primary-900">My Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {generalError && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
              {generalError}
            </div>
          )}

          {/* Section 1: Profile Info */}
          <div className="space-y-4">
            {/* Avatar + Name */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      className="input-field flex-1 text-sm py-1.5"
                      placeholder="Your name"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') {
                          setEditingName(false);
                          setNameValue(user.name || '');
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Save name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-primary-900 truncate">
                      {user.name || 'No name set'}
                    </h3>
                    <button
                      onClick={() => { setEditingName(true); setNameValue(user.name || ''); }}
                      className="p-1 text-surface-400 hover:text-primary-600 hover:bg-surface-100 rounded-lg transition-colors"
                      aria-label="Edit name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-surface-500 truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Info badges */}
            <div className="flex flex-wrap gap-2">
              {user.oauthProvider && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 text-surface-600 rounded-lg text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  {PROVIDER_LABELS[user.oauthProvider] || user.oauthProvider}
                </span>
              )}
              {user.plan && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  {PLAN_LABELS[user.plan] || user.plan} Plan
                </span>
              )}
              {memberSince && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 text-surface-600 rounded-lg text-xs font-medium">
                  <Calendar className="w-3 h-3" />
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Preferences */}
          <div className="border-t border-surface-100 pt-5">
            <h3 className="text-sm font-semibold text-primary-900 mb-3">Preferences</h3>
            <div>
              <label className="text-xs text-surface-500 font-medium mb-1.5 block">Citation Format Style</label>
              <div className="flex bg-surface-100 rounded-xl p-1 max-w-xs">
                <button
                  onClick={() => handleFormatChange('italics')}
                  disabled={formatSaving}
                  className={`flex-1 px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    formatPref === 'italics'
                      ? 'bg-white shadow-soft text-primary-900 font-medium'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                >
                  <em>Italics</em>
                </button>
                <button
                  onClick={() => handleFormatChange('underline')}
                  disabled={formatSaving}
                  className={`flex-1 px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    formatPref === 'underline'
                      ? 'bg-white shadow-soft text-primary-900 font-medium'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                >
                  <u>Underline</u>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Security (email accounts only) */}
          {isEmailAccount && (
            <div className="border-t border-surface-100 pt-5">
              <h3 className="text-sm font-semibold text-primary-900 mb-3">Security</h3>

              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-3">
                  Password changed successfully.
                </div>
              )}

              {!showPasswordForm ? (
                <button
                  onClick={() => { setShowPasswordForm(true); setPasswordSuccess(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4 text-surface-400" />
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="input-field text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New password (8+ characters)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-field text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-field text-sm"
                  />
                  {passwordError && (
                    <p className="text-sm text-error-600 bg-error-50 rounded-xl px-4 py-2">{passwordError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                    >
                      {passwordSaving ? 'Saving...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError(null);
                      }}
                      className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Section 4: Danger Zone */}
          <div className="border-t border-surface-100 pt-5">
            <h3 className="text-sm font-semibold text-error-600 mb-3">Danger Zone</h3>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="bg-error-50 border border-error-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-error-700 font-medium">
                  This will permanently delete your account and all associated data including projects, documents, and history.
                </p>
                <div>
                  <label className="text-xs text-error-600 font-medium mb-1 block">
                    Type your email to confirm: <span className="font-mono">{user.email}</span>
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={e => setDeleteEmail(e.target.value)}
                    placeholder={user.email}
                    className="input-field text-sm border-error-300 focus:ring-error-400"
                  />
                </div>
                {deleteError && (
                  <p className="text-sm text-error-600">{deleteError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteEmail.toLowerCase() !== user.email.toLowerCase()}
                    className="px-4 py-2 text-sm font-medium text-white bg-error-500 hover:bg-error-600 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteEmail(''); setDeleteError(null); }}
                    className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
