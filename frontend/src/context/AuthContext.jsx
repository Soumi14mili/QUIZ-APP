import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('quizapp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('quizapp_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('quizapp_token');
      if (storedToken) {
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
      localStorage.setItem('quizapp_token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('quizapp_user', JSON.stringify(userData));
      setUser(userData);
    }

    return response.data;
  };

  const register = async (full_name, email, password) => {
    const response = await api.post('/auth/register', { full_name, email, password });
    const { token: newToken, user: userData } = response.data;

    if (newToken) {
      localStorage.setItem('quizapp_token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('quizapp_user', JSON.stringify(userData));
      setUser(userData);
    }

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('quizapp_token');
    localStorage.removeItem('quizapp_user');
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
