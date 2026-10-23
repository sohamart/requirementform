import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserDTO } from '@shared/types/index.js';
import { authApi } from '../services/api.js';

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: any) => {
    const res = await authApi.login(data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const logoutEverywhere = async () => {
    try {
      await authApi.logoutEverywhere();
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.permissions?.includes(permission as any) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        logoutEverywhere,
        refreshUser,
        isAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
