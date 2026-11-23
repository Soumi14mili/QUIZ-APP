import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuestionManager from './pages/QuestionManager';
import QuizPlay from './pages/QuizPlay';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';

// Root redirect handler
const RootRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
};

// Main App component containing layout and route switch
const AppContent = () => {
  const location = useLocation();
  // We can hide standard navbar during full-screen active quiz play
  const isQuizPlayPage = location.pathname.startsWith('/quiz/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isQuizPlayPage && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Default Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:sessionId"
            element={
              <ProtectedRoute requiredRole="student">
                <QuizPlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:attemptId"
            element={
              <ProtectedRoute requiredRole="student">
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions/:id/questions"
            element={
              <ProtectedRoute requiredRole="admin">
                <QuestionManager />
              </ProtectedRoute>
            }
          />

          {/* Leaderboard Route (accessible to any authenticated student or admin) */}
          <Route
            path="/leaderboard/:sessionId"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback wildcard route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
