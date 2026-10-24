import React, { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import { Task, Priority } from '../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Clock,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('');

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        search: search.trim() || undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      };

      if (filter === 'completed') {
        params.status = 'DONE';
      } else if (filter === 'all') {
        // default all
      } else {
        params.filter = filter; // 'today', 'upcoming', 'overdue'
      }

      const data = await tasksApi.getTasks(params);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter, priorityFilter, search]);

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    if (newStatus === 'DONE') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
    try {
      await tasksApi.updateTask(task.id, { status: newStatus });
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await tasksApi.createTask({
        title: newTitle,
        priority: newPriority,
        dueDate: newDueDate || undefined,
      });
      setTasks(prev => [created, ...prev]);
      setNewTitle('');
      setNewDueDate('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Tasks & Focus</h1>
          <p className="text-xs text-slate-400">Keep daily execution synchronized with your core goals</p>
        </div>
      </div>

      {/* Quick Add Inline Form */}
      <form onSubmit={handleCreateTask} className="p-4 glass-panel rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Add a new task (e.g. Schedule flight to Sharm, Review raft consensus notes...)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center space-x-2">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Timing Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-glow-primary'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-36 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-white/5 space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">No tasks found matching this view.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map(task => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 transition-all group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-600 hover:border-cyan-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-medium truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                      {task.plan && <span>Plan: {task.plan.title}</span>}
                      {task.dueDate && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
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

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
