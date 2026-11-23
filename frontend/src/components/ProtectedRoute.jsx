import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    const targetLogin = requiredRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If authenticated but role doesn't match
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (requiredRole === 'student') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
