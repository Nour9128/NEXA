import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { spacesApi } from '../services/api';
import { SharedSpace, SpaceRole } from '../types';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  Compass,
  CheckSquare,
  DollarSign,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

export const SharedSpaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invite link state
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  // Log expense state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Shared');
  const [isLoggingExpense, setIsLoggingExpense] = useState(false);

  const loadSpace = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await spacesApi.getSpaceById(id);
      setSpace(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpace();
  }, [id]);

  const handleGenerateInvite = async () => {
    if (!id) return;
    setIsGeneratingInvite(true);
    try {
      const res = await spacesApi.createInvitation(id, { role: 'MEMBER' });
      const fullUrl = `${window.location.origin}/join/${res.invitation.token}`;
      setInviteUrl(fullUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !expenseTitle || !expenseAmount) return;
    setIsLoggingExpense(true);
    try {
      await spacesApi.addSpaceExpense(id, {
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
      });
      setExpenseTitle('');
      setExpenseAmount('');
      loadSpace();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingExpense(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-slate-400">Loading space...</div>;
  }

  if (!space) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center space-y-3">
        <p className="text-slate-400 text-sm">Space not found or unauthorized.</p>
        <Link to="/app/spaces" className="text-purple-400 underline text-xs">Return to Spaces</Link>
      </div>
    );
  }

  const isOwnerOrAdmin = space.currentUserRole === 'OWNER' || space.currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/spaces"
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Spaces</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
              Role: {space.currentUserRole}
            </span>
            <span className="text-xs text-slate-400">
              {space.members?.length || 1} Collaborators
            </span>
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={handleGenerateInvite}
              disabled={isGeneratingInvite}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-secondary flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isGeneratingInvite ? 'Generating...' : 'Invite Member'}</span>
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{space.name}</h1>
        {space.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {space.description}
          </p>
        )}

        {/* Invite link display if generated */}
        {inviteUrl && (
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-purple-300 block">Active Invite Link:</span>
              <p className="font-mono text-cyan-300 truncate">{inviteUrl}</p>
            </div>
            <button
              onClick={handleCopyInvite}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
            >
              {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedInvite ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Members & Shared Budget */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Members List (5 Cols) */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Space Members</h2>
            <span className="text-xs font-mono text-slate-400">{space.members?.length} members</span>
          </div>

          <div className="space-y-3">
            {space.members?.map((mem: any) => (
              <div
                key={mem.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-white/5 text-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {mem.user.avatarUrl ? (
                    <img src={mem.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white uppercase text-[10px]">
                      {mem.user.fullName?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{mem.user.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{mem.user.email}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                  {mem.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Expenses & Split Tracker (7 Cols) */}
        <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Shared Expenses Ledger</h2>
            </div>
          </div>

          {/* Log Expense Form */}
          <form onSubmit={handleAddExpense} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
            <span className="text-xs font-medium text-slate-300 block">Log Group Expense</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={expenseTitle}
                onChange={e => setExpenseTitle(e.target.value)}
                placeholder="Description (e.g. 4x4 Safari)"
                className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              />
              <input
                type="number"
                required
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
                placeholder="Amount ($)"
                className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoggingExpense}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Log Expense
              </button>
            </div>
          </form>

          {/* Expenses List */}
          <div className="space-y-2">
            {space.budget?.expenses && space.budget.expenses.length > 0 ? (
              space.budget.expenses.map((exp: any) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{exp.title}</p>
                    <p className="text-[10px] text-slate-400">Paid by {exp.paidBy?.fullName || 'User'}</p>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">${Number(exp.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No group expenses recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
