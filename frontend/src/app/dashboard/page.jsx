'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FiHash,
  FiPlay,
  FiClock,
  FiHelpCircle,
  FiAward,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function StudentDashboardContent() {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchSessions = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await api.get('/quiz/sessions');
      const sessionList = Array.isArray(response.data) ? response.data : response.data.sessions || [];
      setSessions(sessionList);
    } catch (err) {
      console.error('Failed to fetch live quiz sessions:', err);
      toast.error('Failed to load available quizzes');
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleJoinQuiz = async (codeToJoin) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a 6-character quiz join code');
      return;
    }

    try {
      setJoining(true);
      const res = await api.post('/quiz/sessions/join', { join_code: code });
      const { attempt, session, questions } = res.data;

      const sessionId = session.id || session._id;
      // Store in sessionStorage for resilient Next.js client retrieval
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `quiz_data_${sessionId}`,
          JSON.stringify({ attempt, session, questions })
        );
      }

      toast.success('Joined quiz successfully!');
      router.push(`/quiz/${sessionId}`);
    } catch (err) {
      console.error('Join quiz error:', err);
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || 'Unable to join quiz with this code';
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-200">
        <div className="max-w-3xl space-y-3">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-100">
            Student Dashboard
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Ready to challenge yourself? Enter a quiz code from your instructor or pick an active quiz below to begin.
          </p>
        </div>
      </div>

      {/* Section 1: Join Quiz by Code */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="max-w-xl">
          <div className="flex items-center space-x-2.5 text-indigo-600 mb-2">
            <FiHash className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">Have a Quiz Code?</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter the 6-character room code provided by your instructor or host.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinQuiz(joinCode);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={10}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. QZ-4892"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 text-slate-900 font-mono font-bold tracking-widest uppercase text-base placeholder-slate-400 placeholder:tracking-normal placeholder:font-sans transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="py-3.5 px-7 rounded-2xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
            >
              {joining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Quiz</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Section 2: Available Quizzes */}
      <section id="quizzes" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available Live Quizzes</h2>
            <p className="text-sm text-slate-500">Live sessions currently accepting participants</p>
          </div>

          <button
            onClick={() => fetchSessions(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-3xl border border-slate-200 flex items-center justify-center">
            <LoadingSpinner message="Loading live quizzes..." />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FiHelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No active quizzes right now</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              There are no live quiz sessions open at the moment. Ask your instructor for a session join code or check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const sessionId = session.id || session._id;
              const hasAttempted = session.attempt_id || session.has_submitted || session.attempt?.is_submitted;
              const attemptId = session.attempt_id || session.attempt?.id;

              return (
                <div
                  key={sessionId}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        Live Now
                      </span>
                      {session.join_code && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {session.join_code}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                        {session.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {session.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <FiClock className="w-4 h-4 text-slate-400" />
                        <span>{session.duration_minutes || 10} Mins</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <FiHelpCircle className="w-4 h-4 text-slate-400" />
                        <span>{session.question_count || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    {hasAttempted && attemptId ? (
                      <button
                        onClick={() => router.push(`/results/${attemptId}`)}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>View Results</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinQuiz(session.join_code)}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <FiPlay className="w-4 h-4" />
                        <span>Start Quiz</span>
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/leaderboard/${sessionId}`)}
                      title="View Leaderboard"
                      className="p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <FiAward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
