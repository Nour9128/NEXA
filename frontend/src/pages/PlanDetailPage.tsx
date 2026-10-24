import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { plansApi, tasksApi } from '../services/api';
import { Plan, Task, Subtask } from '../types';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  Users,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const loadPlan = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await plansApi.getPlanById(id);
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    if (newStatus === 'DONE') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
    try {
      await tasksApi.updateTask(task.id, { status: newStatus });
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await tasksApi.toggleSubtask(subtaskId);
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id) return;
    try {
      await tasksApi.createTask({
        title: newTaskTitle,
        planId: id,
        priority: 'MEDIUM',
      });
      setNewTaskTitle('');
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async () => {
    if (!id || !window.confirm('Delete this entire plan?')) return;
    try {
      await plansApi.deletePlan(id);
      navigate('/app/plans');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-slate-400">
        Loading plan details...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400 text-sm">Plan not found or access denied.</p>
        <Link to="/app/plans" className="text-indigo-400 underline text-xs">
          Return to Plans
        </Link>
      </div>
    );
  }

  const tasks: Task[] = plan.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalExpenses = plan.budget?.expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;
  const budgetLimit = plan.budget?.totalLimit ? Number(plan.budget.totalLimit) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/plans"
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDeletePlan}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Plan Info Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
              {plan.category}
            </span>
            {plan.space && (
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {plan.space.name}
              </span>
            )}
          </div>

          {plan.targetDate && (
            <div className="flex items-center space-x-1.5 text-xs text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
              <Clock className="w-3.5 h-3.5" />
              <span>Target: {new Date(plan.targetDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{plan.title}</h1>

        {plan.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {plan.description}
          </p>
        )}

        {/* Progress Bar & Summary */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Execution Progress ({completedTasks} of {tasks.length} tasks completed)
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Breakdown Card (If Budget Exists) */}
      {plan.budget && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Plan Budget Tracker</h2>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Allocated: <span className="text-emerald-400">${totalExpenses}</span> / ${budgetLimit} {plan.budget.currency}
            </div>
          </div>

          {plan.budget.expenses && plan.budget.expenses.length > 0 ? (
            <div className="space-y-2 pt-1">
              {plan.budget.expenses.map((exp: any) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                >
                  <span className="text-slate-200">{exp.title}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400 font-mono text-[11px]">{exp.category}</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      ${Number(exp.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No expenses recorded yet.</p>
          )}
        </div>
      )}

      {/* Task Milestones List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Tasks & Checklist</h2>
          <span className="text-xs text-slate-400 font-mono">{tasks.length} items</span>
        </div>

        {/* Inline Add Task Form */}
        <form onSubmit={handleAddTask} className="flex items-center space-x-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task to this plan..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Tasks List */}
        <div className="space-y-3 pt-2">
          {tasks.map(task => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-600 hover:border-cyan-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <span
                      className={`text-xs sm:text-sm font-medium truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

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

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="pl-8 space-y-1.5 pt-1 border-t border-white/5">
                    {task.subtasks.map((st: Subtask) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id)}
                        className="flex items-center space-x-2 text-xs cursor-pointer group select-none"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            st.isCompleted
                              ? 'bg-cyan-500 border-cyan-500 text-white'
                              : 'border-slate-600 group-hover:border-slate-400'
                          }`}
                        >
                          {st.isCompleted && '✓'}
                        </span>
                        <span className={st.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
