'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount (client-side only)
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('quizapp_token');
      const storedUser = localStorage.getItem('quizapp_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON error
          }
        }

        try {
          const res = await api.get('/auth/me');
          const userData = res.data.user || res.data;
          setUser(userData);
          localStorage.setItem('quizapp_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to validate token:', err);
          localStorage.removeItem('quizapp_token');
          localStorage.removeItem('quizapp_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const response = await api.post(endpoint, { email, password });
    const { token: newToken, user: userData } = response.data;

    if (newToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizapp_token', newToken);
      }
      setToken(newToken);
    }
    if (userData) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizapp_user', JSON.stringify(userData));
      }
      setUser(userData);
    }

    return response.data;
  };

  const register = async (full_name, email, password) => {
    const response = await api.post('/auth/register', { full_name, email, password });
    const { token: newToken, user: userData } = response.data;

    if (newToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizapp_token', newToken);
      }
      setToken(newToken);
    }
    if (userData) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizapp_user', JSON.stringify(userData));
      }
      setUser(userData);
    }

    return response.data;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizapp_token');
      localStorage.removeItem('quizapp_user');
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
