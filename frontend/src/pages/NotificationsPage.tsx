import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/api';
import { Notification, NotificationType } from '../types';
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  UserPlus,
  CheckSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAsRead('all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'DEADLINE':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case 'INVITATION':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'ASSIGNMENT':
        return <CheckSquare className="w-4 h-4 text-cyan-400" />;
      case 'SYSTEM':
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Notifications</h1>
          <p className="text-xs text-slate-400">Updates, deadlines, invitations, and system alerts</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No notifications to display.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-slate-900/30 border-white/5 text-slate-400'
                  : 'bg-slate-900/80 border-indigo-500/30 text-white shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkOneRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
