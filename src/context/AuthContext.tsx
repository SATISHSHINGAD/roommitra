import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { apiRequest, getStoredToken, setStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: UserRole; city?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isRoommate: boolean;
  isProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch {
      // Token invalid or expired
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (regData: { name: string; email: string; password: string; phone?: string; role?: UserRole; city?: string }) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(regData),
      });
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const data = await apiRequest<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setUser(data.user);
  };

  const adminRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'SUPPORT',
    'CONTENT_MANAGER',
    'FINANCE_MANAGER',
  ];
  const isAdmin = Boolean(user && adminRoles.includes(user.role));
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isOwner = user?.role === 'PROPERTY_OWNER';
  const isRoommate = user?.role === 'ROOMMATE';
  const isProvider = user?.role === 'SERVICE_PROVIDER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAdmin,
        isSuperAdmin,
        isOwner,
        isRoommate,
        isProvider,
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
