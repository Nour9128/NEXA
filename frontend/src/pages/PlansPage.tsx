import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plansApi } from '../services/api';
import { Plan, PlanCategory } from '../types';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle2,
  Copy,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New plan form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<PlanCategory>('PERSONAL');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await plansApi.getPlans({
        category: category !== 'ALL' ? category : undefined,
        search: search.trim() || undefined,
      });
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [category, search]);

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      await plansApi.duplicatePlan(id);
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await plansApi.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await plansApi.createPlan({
        title: newTitle,
        description: newDesc || undefined,
        category: newCategory,
        targetDate: newTargetDate || undefined,
        budget: newBudgetLimit
          ? { totalLimit: parseFloat(newBudgetLimit), currency: 'USD' }
          : undefined,
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewTargetDate('');
      setNewBudgetLimit('');
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All Plans' },
    { id: 'STUDY', label: 'Study & Exams' },
    { id: 'TRAVEL', label: 'Travel & Trips' },
    { id: 'WORK', label: 'Work & Projects' },
    { id: 'PERSONAL', label: 'Personal & Habits' },
    { id: 'EVENT', label: 'Events & Parties' },
    { id: 'FINANCE', label: 'Finance & Budgets' },
    { id: 'HEALTH', label: 'Health' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">My Plans</h1>
          <p className="text-xs text-slate-400">Manage and track your goals, itineraries, and schedules</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-3xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 space-y-4">
          <Compass className="w-12 h-12 text-indigo-400/50 mx-auto" />
          <h3 className="text-base font-semibold text-white">No plans found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || category !== 'ALL'
              ? 'Try adjusting your search query or category filters.'
              : 'Create your first plan or ask the AI copilot to structure one for you.'}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <Link
              key={plan.id}
              to={`/app/plans/${plan.id}`}
              className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {plan.category}
                  </span>
                  <div className="flex items-center space-x-1" onClick={e => e.preventDefault()}>
                    <button
                      onClick={e => handleDuplicate(e, plan.id)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Duplicate Plan"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDelete(e, plan.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {plan.stats?.completedTasks || 0}/{plan.stats?.totalTasks || 0} tasks
                    </span>
                  </span>
                  {plan.targetDate && (
                    <span className="flex items-center space-x-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(plan.targetDate).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${plan.stats?.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0C0F1D] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Plan</h3>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Sinai Camping Expedition"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="STUDY">Study & Exams</option>
                  <option value="TRAVEL">Travel & Trips</option>
                  <option value="WORK">Work & Projects</option>
                  <option value="PERSONAL">Personal & Habits</option>
                  <option value="EVENT">Events & Parties</option>
                  <option value="FINANCE">Finance & Budgets</option>
                  <option value="HEALTH">Health</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Goals</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Summary of this plan's focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Budget Limit ($)</label>
                  <input
                    type="number"
                    value={newBudgetLimit}
                    onChange={e => setNewBudgetLimit(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
