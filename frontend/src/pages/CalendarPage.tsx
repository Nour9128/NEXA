import React, { useState, useEffect } from 'react';
import { tasksApi, plansApi } from '../services/api';
import { Task, Plan } from '../types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, plansData] = await Promise.all([
          tasksApi.getTasks(),
          plansApi.getPlans(),
        ]);
        setTasks(tasksData);
        setPlans(plansData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTasksForDate = (dateString: string) => {
    return tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateString));
  };

  const getPlansForDate = (dateString: string) => {
    return plans.filter(p => p.targetDate && p.targetDate.startsWith(dateString));
  };

  const selectedDateTasks = getTasksForDate(selectedDate);
  const selectedDatePlans = getPlansForDate(selectedDate);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Calendar & Timeline</h1>
          <p className="text-xs text-slate-400">Timezone-aware scheduling across all active plans and deadlines</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-white px-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono font-semibold text-slate-400 pb-2 border-b border-white/10">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((d, idx) => {
              if (d === null) {
                return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-white/[0.01]" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayTasks = getTasksForDate(dateStr);
              const dayPlans = getPlansForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 p-1.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-primary'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300'
                      }`}
                    >
                      {d}
                    </span>
                    {(dayTasks.length > 0 || dayPlans.length > 0) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayPlans.map(p => (
                      <div
                        key={p.id}
                        className="text-[9px] truncate bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded font-mono"
                      >
                        Plan: {p.title}
                      </div>
                    ))}
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        className="text-[9px] truncate bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded font-mono"
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Selected Day Focus & Deadlines (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Selected Date</span>
              <h3 className="text-base font-bold text-white">
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
          </div>

          {/* Items for selected date */}
          <div className="space-y-3">
            {selectedDatePlans.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-purple-400">Plan Deadlines:</span>
                {selectedDatePlans.map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs">
                    <p className="font-semibold text-white">{p.title}</p>
                    <span className="text-[10px] text-purple-300 font-mono">{p.category}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDateTasks.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-400">Scheduled Tasks:</span>
                {selectedDateTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{t.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDatePlans.length === 0 && selectedDateTasks.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <CalendarDays className="w-8 h-8 mx-auto text-slate-600" />
                <p>No deadlines scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
