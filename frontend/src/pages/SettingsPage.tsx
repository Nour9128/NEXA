import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, aiApi } from '../services/api';
import {
  User,
  Lock,
  Download,
  Trash2,
  Cpu,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Africa/Cairo');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // AI Status State
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    aiApi.getStatus().then(setAiStatus).catch(console.error);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await userApi.updateMe({
        fullName,
        bio,
        timezone,
        avatarUrl: avatarUrl || undefined,
      });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await userApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexa-export-${user?.id || 'archive'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure? This will delete your account, plans, tasks, and data permanently.')) {
      return;
    }
    try {
      await userApi.deleteMe();
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Account & Preferences</h1>
        <p className="text-xs text-slate-400">Manage your profile, security, AI configuration, and personal data</p>
      </div>

      {/* 1. Profile Information */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
          <User className="w-5 h-5" />
          <span>Profile Information</span>
        </div>

        {profileSuccess && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Goals</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell NEXA a bit about what you do or what you're working towards..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-all disabled:opacity-50"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* 2. AI Service & Model Configuration */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
          <Cpu className="w-5 h-5" />
          <span>AI Engine Configuration</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Provider & Model</span>
            <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/40">
              {aiStatus?.provider || 'OpenAI'} • {aiStatus?.model || 'gpt-4o-mini'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Connection Status</span>
            <span className="text-xs font-semibold flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{aiStatus?.status || 'ACTIVE'}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            {aiStatus?.message}
          </p>
        </div>
      </div>

      {/* 3. Security: Password Change */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
          <Lock className="w-5 h-5" />
          <span>Security & Password</span>
        </div>

        {passwordSuccess && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password updated successfully.</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password (Min 8)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-secondary transition-all disabled:opacity-50"
          >
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 4. Privacy & Data Ownership */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
          <Shield className="w-5 h-5" />
          <span>Privacy & Data Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 gap-3">
          <div>
            <h4 className="text-xs font-semibold text-white">Export Complete Life Archive</h4>
            <p className="text-[11px] text-slate-400">Download a full JSON archive containing all plans, tasks, budgets, and saved items</p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5 shrink-0 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 gap-3">
          <div>
            <h4 className="text-xs font-semibold text-rose-300">Permanent Account Deletion</h4>
            <p className="text-[11px] text-slate-400">Permanently purge all account credentials, plans, tasks, and data from PostgreSQL</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
