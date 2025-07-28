'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

interface User {
  id: number;
  email: string;
  full_name?: string;
  website_url?: string;
  store_platform?: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('gipoly-token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('gipoly-token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('gipoly-token', access_token);
      setToken(access_token);
      await fetchUser();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.post<User>('/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      await login(email, password);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('gipoly-token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 