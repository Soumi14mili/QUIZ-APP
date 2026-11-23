'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signInUser, signUpStudent, signOutUser, getCurrentUserProfile } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session & profile on mount and listen to auth changes
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            const profile = await getCurrentUserProfile();
            setUser(profile || {
              id: initialSession.user.id,
              email: initialSession.user.email,
              full_name: initialSession.user.user_metadata?.full_name || initialSession.user.email,
              role: initialSession.user.user_metadata?.role || 'student',
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Supabase auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession?.user) {
        const profile = await getCurrentUserProfile();
        setUser(profile || {
          id: newSession.user.id,
          email: newSession.user.email,
          full_name: newSession.user.user_metadata?.full_name || newSession.user.email,
          role: newSession.user.user_metadata?.role || 'student',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password, isAdmin = false) => {
    const res = await signInUser(email, password, isAdmin);
    setSession(res.session);
    setUser(res.profile || {
      id: res.user.id,
      email: res.user.email,
      full_name: res.user.user_metadata?.full_name || res.user.email,
      role: res.profile?.role || (isAdmin ? 'admin' : 'student'),
    });
    return res;
  };

  const register = async (full_name, email, password) => {
    const res = await signUpStudent(email, password, full_name);
    // Note: If email confirmation is enabled on Supabase, res.session might be null until verified
    if (res.session) {
      setSession(res.session);
    }
    return res;
  };

  const logout = async () => {
    await signOutUser();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token: session?.access_token || null,
        loading,
        isAuthenticated: !!session && !!user,
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
