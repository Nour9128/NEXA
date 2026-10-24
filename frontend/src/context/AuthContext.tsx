import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStats } from '../types';
import { authApi, userApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await userApi.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch {
      setUser(null);
      setStats(null);
      localStorage.removeItem('nexa_access_token');
      localStorage.removeItem('nexa_refresh_token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('nexa_access_token');
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    localStorage.setItem('nexa_access_token', res.data.accessToken);
    localStorage.setItem('nexa_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    // Fetch stats
    await refreshProfile();
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    localStorage.setItem('nexa_access_token', res.data.accessToken);
    localStorage.setItem('nexa_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    await refreshProfile();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setStats(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
