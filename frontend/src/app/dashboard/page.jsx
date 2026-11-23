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
  FiZap,
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
      <div className="relative overflow-hidden bg-[#173c34] rounded-[2.5rem] p-8 sm:p-12 text-[#f7f4ec] border-3 border-[#173c34] shadow-[10px_10px_0_#f7b955]">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#b5e7d2] text-[#173c34] rounded-full text-xs font-black uppercase tracking-wider border border-[#173c34]">
            <FiZap className="w-3.5 h-3.5 text-[#e65f45]" />
            <span>Learner Arena</span>
          </span>

          <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight">
            Welcome back, <span className="text-[#f7b955]">{user?.full_name?.split(' ')[0] || 'Architect'}</span>!
          </h1>

          <p className="text-[#f7f4ec]/85 text-sm sm:text-base leading-relaxed max-w-2xl">
            Test your cloud architecture skills under pressure. Enter your room join code below or select an open live session to challenge the leaderboard.
          </p>
        </div>
      </div>

      {/* Section 1: Join Quiz by Code */}
      <section className="bg-white rounded-[2.25rem] p-6 sm:p-9 border-2 border-[#173c34] shadow-[8px_8px_0_#173c34]">
        <div className="max-w-xl">
          <div className="flex items-center space-x-2 text-[#e65f45] mb-2">
            <FiHash className="w-5 h-5" />
            <h2 className="font-display text-xl font-bold text-[#173c34]">Got a Quiz Join Code?</h2>
          </div>
          <p className="text-sm text-[#173c34]/70 mb-6">
            Enter the 6-character room code provided by your instructor or host to jump straight in.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinQuiz(joinCode);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={10}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. QZ-4892"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#173c34] bg-[#fdfbf7] text-[#173c34] font-mono font-bold tracking-widest uppercase text-base placeholder-[#173c34]/40 focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="py-3.5 px-8 rounded-full font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#173c34] shadow-[0_5px_0_#a83a29] transition-all flex items-center justify-center space-x-2 flex-shrink-0"
            >
              {joining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Session</span>
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
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#173c34]">
              Available Live Quizzes
            </h2>
            <p className="text-sm text-[#173c34]/70">Live sessions currently accepting submissions</p>
          </div>

          <button
            onClick={() => fetchSessions(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34] transition-all"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#e65f45]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 bg-white rounded-[2.25rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] flex items-center justify-center">
            <LoadingSpinner message="Scanning active sessions..." />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-[2.25rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f7f4ec] border-2 border-[#173c34] text-[#173c34] flex items-center justify-center mx-auto shadow-[3px_3px_0_#173c34]">
              <FiHelpCircle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#173c34]">No active quizzes right now</h3>
            <p className="text-sm text-[#173c34]/70 max-w-md mx-auto">
              There are no public quiz sessions open at the moment. Ask your instructor for a session join code or check back soon!
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
                  className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] hover:shadow-[10px_10px_0_#173c34] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#b5e7d2] text-[#173c34] border border-[#173c34]">
                        <span className="w-2 h-2 rounded-full bg-[#173c34] mr-1.5 animate-pulse" />
                        Live Now
                      </span>
                      {session.join_code && (
                        <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[#f7b955] text-[#173c34] border border-[#173c34]">
                          {session.join_code}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-[#173c34] line-clamp-1">
                        {session.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#173c34]/70 mt-1.5 line-clamp-2 leading-relaxed">
                        {session.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#173c34]/10 text-xs font-semibold text-[#173c34]/80">
                      <div className="flex items-center space-x-1.5">
                        <FiClock className="w-4 h-4 text-[#e65f45]" />
                        <span>{session.duration_minutes || 10} Mins</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <FiHelpCircle className="w-4 h-4 text-[#173c34]" />
                        <span>{session.question_count || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#173c34]/10 flex items-center gap-2.5">
                    {hasAttempted && attemptId ? (
                      <button
                        onClick={() => router.push(`/results/${attemptId}`)}
                        className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-[#173c34] bg-[#b5e7d2] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_3px_0_#236653] transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FiCheckCircle className="w-4 h-4 text-[#173c34]" />
                        <span>View Results</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinQuiz(session.join_code)}
                        className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] shadow-[0_3px_0_#a83a29] transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FiPlay className="w-3.5 h-3.5" />
                        <span>Start Quiz</span>
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/leaderboard/${sessionId}`)}
                      title="View Leaderboard"
                      className="w-10 h-10 rounded-full border-2 border-[#173c34] bg-[#f7b955] text-[#173c34] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] flex items-center justify-center transition-all flex-shrink-0"
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
