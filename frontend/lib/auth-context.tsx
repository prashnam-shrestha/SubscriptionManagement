'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  apiClient,
  setAccessToken,
} from './api-client';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Staff';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const userData = await apiClient<User>('/auth/me');

        if (!cancelled) {
          setUser(userData);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ) => {
    const data = await apiClient<{
      accessToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
      skipAuth: true,
    });

    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore logout API errors.
    } finally {
      setAccessToken(null);
      setUser(null);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
};
