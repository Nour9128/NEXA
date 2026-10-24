import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Compass,
  CheckSquare,
  CalendarDays,
  Users,
  Bookmark,
  Bell,
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';
import { CaptureModal } from '../capture/CaptureModal';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/app/assistant', label: 'AI Assistant', icon: Bot },
    { to: '/app/plans', label: 'My Plans', icon: Compass },
    { to: '/app/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/app/spaces', label: 'Shared Spaces', icon: Users },
    { to: '/app/saved', label: 'Saved Items', icon: Bookmark },
    { to: '/app/notifications', label: 'Notifications', icon: Bell },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#07080E] text-slate-100 overflow-hidden font-sans">
      {/* Universal Quick Capture Modal */}
      <CaptureModal
        isOpen={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh event if needed
        }}
      />

      {/* Sidebar */}
      <aside
        className={`relative z-30 flex flex-col border-r border-white/10 bg-[#0A0D18]/90 backdrop-blur-2xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-white/10">
          <NavLink to="/app" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-1 flex-shrink-0 flex items-center justify-center shadow-glow-primary">
              <img src="/logo.svg" alt="NEXA" className="w-full h-full object-contain" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-wider text-white">NEXA</span>
                <span className="text-[9px] tracking-widest text-cyan-400 font-mono uppercase -mt-1">LIFE OS</span>
              </div>
            )}
          </NavLink>

          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={() => setCaptureModalOpen(true)}
            className={`w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-glow-primary transition-all group ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            title="Quick Capture Anything"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {!sidebarCollapsed && <span>Quick Capture</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Mini NEXA Core Status Indicator */}
        <div className="p-4 border-t border-white/10">
          <div
            onClick={() => navigate('/app/assistant')}
            className={`p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600/30 border border-cyan-400/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-slate-200 truncate">NEXA Core Active</span>
                <span className="text-[10px] text-indigo-300/80 truncate">Ready to synthesize</span>
              </div>
            )}
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-white/10 relative">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 cursor-pointer min-w-0"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover border border-indigo-500/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-medium text-slate-200 truncate">{user?.fullName || 'User'}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-[#0A0D18]/60 backdrop-blur-xl px-6 flex items-center justify-between z-20">
          {/* Search Trigger */}
          <div className="flex items-center space-x-3 w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plans, tasks, captures, or ask NEXA... (Ctrl+K)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    navigate(`/app/assistant?q=${encodeURIComponent((e.target as any).value)}`);
                  }
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app/notifications')}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            </button>

            <button
              onClick={() => navigate('/app/settings')}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#07080E] relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
