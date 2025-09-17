import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { User } from '../types/api';
import { api } from '../utils/api';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: User['role']; unit?: string }) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'qi-tool-selector-token';
const USER_KEY = 'qi-tool-selector-user';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persist = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    api.setToken(nextToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.client.post('/auth/login', { email, password });
    persist(data.user, data.token);
  }, [persist]);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; role: User['role']; unit?: string }) => {
      const { data } = await api.client.post('/auth/register', payload);
      persist(data.user, data.token);
    },
    [persist]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    api.setToken(null);
  }, []);

  const updatePreferences = useCallback(
    async (prefs: Partial<User['preferences']>) => {
      if (!user) return;
      const previous = user;
      const next = { ...user, preferences: { ...user.preferences, ...prefs } };
      setUser(next);
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      try {
        await api.client.patch('/auth/preferences', prefs);
      } catch (error) {
        // revert on failure
        setUser(previous);
        localStorage.setItem(USER_KEY, JSON.stringify(previous));
        throw error;
      }
    },
    [user]
  );

  const value = useMemo(() => ({ user, token, loading, login, register, logout, updatePreferences }), [
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePreferences,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
