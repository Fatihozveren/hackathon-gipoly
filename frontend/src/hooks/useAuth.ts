import { useState, useEffect } from 'react';
import axios from 'axios';

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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gipoly-token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('gipoly-token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('gipoly-token', access_token);
      setToken(access_token);
      await fetchUser(access_token);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await axios.post<User>('/api/auth/register', {
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

  return {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };
}; 