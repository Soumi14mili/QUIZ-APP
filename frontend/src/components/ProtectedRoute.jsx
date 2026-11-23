'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const targetLogin = requiredRole === 'admin' ? '/admin/login' : '/login';
        router.replace(targetLogin);
      } else if (requiredRole && user?.role !== requiredRole) {
        if (requiredRole === 'admin') {
          router.replace('/dashboard');
        } else if (requiredRole === 'student') {
          router.replace('/admin/dashboard');
        }
      }
    }
  }, [loading, isAuthenticated, requiredRole, user, router]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner fullScreen message="Redirecting to login..." />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <LoadingSpinner fullScreen message="Redirecting..." />;
  }

  return children;
};

export default ProtectedRoute;
