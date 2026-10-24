import React, { useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { PlansPage } from './pages/PlansPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SharedSpacesPage } from './pages/SharedSpacesPage';
import { SharedSpaceDetailPage } from './pages/SharedSpaceDetailPage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { spacesApi } from './services/api';

// Route Guard for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080E] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Synchronizing NEXA Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route Guard for unauthenticated routes (login/register)
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/app" replace />;
  return children;
};

// Auto Join Invitation Handler
const JoinSpacePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate(`/login?redirect=/join/${token}`);
      return;
    }

    if (token) {
      spacesApi
        .joinSpace(token)
        .then(res => {
          navigate(`/app/spaces/${res.data.spaceId}`);
        })
        .catch(err => {
          setError(err.response?.data?.error?.message || 'Failed to join space.');
        });
    }
  }, [token, user, isLoading]);

  return (
    <div className="min-h-screen bg-[#07080E] flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-sm">
        {error ? (
          <>
            <p className="text-sm text-rose-400">{error}</p>
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-300">Joining shared space...</p>
          </>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/join/:token" element={<JoinSpacePage />} />

      {/* Protected Workspace Pages */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="assistant" element={<AiAssistantPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="spaces" element={<SharedSpacesPage />} />
        <Route path="spaces/:id" element={<SharedSpaceDetailPage />} />
        <Route path="saved" element={<SavedItemsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
