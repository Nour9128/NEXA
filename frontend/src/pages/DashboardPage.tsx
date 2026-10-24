import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { plansApi, tasksApi, spacesApi, savedItemsApi } from '../services/api';
import { Plan, Task, SharedSpace } from '../types';
import {
  Sparkles,
  Compass,
  CheckSquare,
  Users,
  Bookmark,
  ArrowRight,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const { user, stats, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [aiPrompt, setAiPrompt] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaces, setSpaces] = useState<SharedSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic greeting based on user's local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [plansRes, tasksRes, spacesRes] = await Promise.all([
          plansApi.getPlans(),
          tasksApi.getTasks({ status: 'TODO' }),
          spacesApi.getSpaces(),
        ]);
        setPlans(plansRes.slice(0, 3));
        setTasks(tasksRes.slice(0, 5));
        setSpaces(spacesRes.slice(0, 3));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      if (newStatus === 'DONE') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366F1', '#38BDF8', '#10B981'],
        });
      }
      await tasksApi.updateTask(task.id, { status: newStatus });
      setTasks(prev => prev.filter(t => t.id !== task.id));
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigate(`/app/assistant?q=${encodeURIComponent(aiPrompt)}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Greeting & Central AI Command Bar */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-indigo-500/20 shadow-glass overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NEXA Life Intelligence • {user?.timezone || 'Africa/Cairo'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Here is your life synthesis for today. All dots are connected and in motion.
              </p>
            </div>

            {/* Quick Action Pill */}
            <div className="flex items-center space-x-2 self-start sm:self-center">
              <Link
                to="/app/assistant"
                className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Open Copilot</span>
              </Link>
            </div>
          </div>

          {/* Central AI Command Bar */}
          <form onSubmit={handleAiCommandSubmit} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="What would you like to organize today? (e.g. Plan my calculus study schedule, Dahab weekend budget...)"
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#080B15]/90 border border-indigo-500/30 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 shadow-glow-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-md"
              >
                <span>Synthesize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="text-slate-400 text-[11px]">Quick Ideas:</span>
              {[
                'Prepare 3-week study schedule for exams',
                'Organize Dahab weekend trip for 4',
                'Weekly organic grocery restock',
                'Realistic morning focus routine',
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => navigate(`/app/assistant?q=${encodeURIComponent(chip)}`)}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors text-[11px]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* 2. Key Metrics Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Plans',
            value: stats?.plansCount ?? plans.length,
            icon: Compass,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            link: '/app/plans',
          },
          {
            label: 'Pending Tasks',
            value: stats?.tasksCount ?? tasks.length,
            icon: CheckSquare,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            link: '/app/tasks',
          },
          {
            label: 'Shared Spaces',
            value: stats?.spacesCount ?? spaces.length,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            link: '/app/spaces',
          },
          {
            label: 'Saved Items',
            value: stats?.savedItemsCount ?? 0,
            icon: Bookmark,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            link: '/app/saved',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-display text-white">{stat.value}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Active</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Main Split View: Tasks & Recent Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Focus & Priority Tasks (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Today's Focus & Tasks</h2>
            </div>
            <Link to="/app/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1">
              <span>View all tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto" />
              <p className="text-xs text-slate-400">All caught up! No pending tasks right now.</p>
              <Link to="/app/tasks" className="inline-block text-xs text-indigo-400 underline">
                Add a task
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 transition-all group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="w-5 h-5 rounded-lg border border-slate-600 hover:border-cyan-400 flex items-center justify-center text-transparent hover:text-cyan-400 transition-colors"
                      title="Mark as done"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {task.title}
                      </p>
                      {task.plan && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Plan: {task.plan.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Plans & Active Shared Spaces (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Plans Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Active Plans</h2>
              </div>
              <Link to="/app/plans" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active plans yet. Create your first plan!</p>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => (
                  <Link
                    key={plan.id}
                    to={`/app/plans/${plan.id}`}
                    className="block p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 hover:border-indigo-500/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {plan.category}
                      </span>
                      {plan.targetDate && (
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{new Date(plan.targetDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {plan.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Progress</span>
                        <span>{plan.stats?.progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${plan.stats?.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Shared Spaces Quick Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-semibold text-white">Shared Spaces</h2>
              </div>
              <Link to="/app/spaces" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {spaces.map(space => (
                <Link
                  key={space.id}
                  to={`/app/spaces/${space.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{space.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {space.memberCount || 1} members • {space.plansCount || 0} shared plans
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {space.userRole || 'MEMBER'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
