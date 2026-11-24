'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLiveSessions, joinQuizSession } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThemeToggle from '../../components/ThemeToggle';
import {
  KawaiiCloud,
  KawaiiServerRack,
  KawaiiS3Cup,
  StarSparkle,
  QuestionMarkDoodle,
} from '../../components/Caricatures';
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
  const { isDark } = useTheme();
  const [joinCode, setJoinCode] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchSessions = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const sessionList = await getLiveSessions();
      setSessions(sessionList || []);
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
      const res = await joinQuizSession(code);
      const { attempt, session, questions } = res;

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
        err.message || err.response?.data?.message || err.response?.data?.error || 'Unable to join quiz with this code';
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8ed] dark:bg-[#080b16] text-[#18332c] dark:text-[#f1f3f9] bg-dot-pattern transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* ======================================================== */}
        {/* 1. WELCOME HERO BANNER with FLOATING MASCOTS            */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2f2891] dark:bg-[#1a1654] p-8 sm:p-12 text-white border-3 border-[#173c34] dark:border-[#7c6cff] shadow-[10px_10px_0_#5ce1e6] dark:shadow-[10px_10px_0_#7c6cff] transition-all bg-dot-pattern-dark">
          
          {/* Floating background decorative caricatures */}
          <div className="absolute right-8 -bottom-6 hidden sm:flex items-end gap-5 pointer-events-none select-none z-0">
            <KawaiiServerRack className="w-24 h-32" isDark={isDark} />
            <KawaiiCloud className="w-32 h-24 mb-4" isDark={isDark} />
          </div>

          <div className="relative max-w-2xl space-y-4 z-10">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#5ce1e6] text-[#173c34] rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]">
              <FiZap className="w-3.5 h-3.5 text-[#ff6b8b]" />
              <span>Learner Arena</span>
            </span>

            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Welcome back, <span className="text-[#5ce1e6] italic font-normal">{user?.full_name?.split(' ')[0] || 'Architect'}</span>!
            </h1>

            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Test your cloud architecture skills under pressure. Enter your room join code below or select an open live session to challenge the class leaderboard.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. JOIN QUIZ BY CODE CARD with FLOATING S3 CUP           */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-white dark:bg-[#121629] p-6 sm:p-9 border-3 border-[#173c34] dark:border-[#232b47] shadow-[8px_8px_0_#173c34] dark:shadow-[8px_8px_0_#7c6cff] transition-all">
          
          {/* Cute S3 Cup peeking in top-right */}
          <div className="absolute top-4 right-6 hidden md:block pointer-events-none select-none">
            <KawaiiS3Cup className="w-16 h-20" isDark={isDark} />
          </div>

          <div className="max-w-xl z-10 relative">
            <div className="flex items-center space-x-2 text-[#ff6b8b] mb-2">
              <FiHash className="w-5 h-5 stroke-[2.5]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#173c34] dark:text-white">
                Got a Quiz Join Code?
              </h2>
            </div>
            <p className="text-sm text-[#576b63] dark:text-[#8b97b8] mb-6 font-medium">
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
                  className="w-full px-5 py-3.5 rounded-2xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-[#fdfbf7] dark:bg-[#1c223c] text-[#173c34] dark:text-[#f1f3f9] font-mono font-bold tracking-widest uppercase text-base placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="py-3.5 px-8 rounded-full font-black text-sm text-[#173c34] dark:text-white bg-[#ff6b8b] dark:bg-[#ff5480] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed border-2.5 border-[#173c34] dark:border-[#ff6b8b] shadow-[4px_4px_0_#173c34] dark:shadow-[4px_4px_0_#1a1060] transition-all flex items-center justify-center space-x-2 flex-shrink-0"
              >
                {joining ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Join Session</span>
                    <FiArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. AVAILABLE LIVE QUIZZES                                */}
        {/* ======================================================== */}
        <section id="quizzes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#173c34] dark:text-white">
                Available Live Quizzes
              </h2>
              <p className="text-sm text-[#576b63] dark:text-[#8b97b8] font-medium">
                Live sessions currently accepting student submissions
              </p>
            </div>

            <button
              onClick={() => fetchSessions(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold text-[#173c34] dark:text-[#f1f3f9] bg-white dark:bg-[#121629] hover:bg-[#eef3f0] dark:hover:bg-[#1c223c] border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] transition-all"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#ff6b8b]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 bg-white dark:bg-[#121629] rounded-[2.25rem] border-2 border-[#173c34] dark:border-[#232b47] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] flex flex-col items-center justify-center space-y-4">
              <KawaiiCloud className="w-24 h-16" isDark={isDark} />
              <LoadingSpinner message="Scanning active sessions..." />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-[#121629] rounded-[2.25rem] border-2 border-[#173c34] dark:border-[#232b47] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] space-y-6">
              
              {/* Playful Floating Mascot Caricatures */}
              <div className="flex items-center justify-center gap-6">
                <KawaiiCloud className="w-28 h-20" isDark={isDark} />
                <KawaiiServerRack className="w-16 h-22" isDark={isDark} />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-display text-2xl font-bold text-[#173c34] dark:text-white">
                  No active quizzes right now
                </h3>
                <p className="text-sm text-[#576b63] dark:text-[#8b97b8] leading-relaxed">
                  There are no public quiz sessions open at the moment. Ask your instructor for a session join code or check back soon!
                </p>
              </div>
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
                    className="group bg-white dark:bg-[#121629] rounded-[2rem] p-6 sm:p-7 border-2 border-[#173c34] dark:border-[#232b47] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] hover:shadow-[10px_10px_0_#173c34] dark:hover:shadow-[10px_10px_0_#7c6cff] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#b5e7d2] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] border border-[#173c34] dark:border-[#7c6cff]">
                          <span className="w-2 h-2 rounded-full bg-[#173c34] dark:bg-[#0c0a23] mr-1.5 animate-pulse" />
                          Live Now
                        </span>
                        {session.join_code && (
                          <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] border border-[#173c34] dark:border-[#7c6cff]">
                            {session.join_code}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-[#173c34] dark:text-white line-clamp-1">
                            {session.title}
                          </h3>
                          <span className="animate-pulse">
                            <StarSparkle className="w-4 h-4 text-[#ff6b8b]" />
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#576b63] dark:text-[#8b97b8] mt-1.5 line-clamp-2 leading-relaxed">
                          {session.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#173c34]/10 dark:border-[#2f3a60] text-xs font-semibold text-[#173c34] dark:text-[#f1f3f9]">
                        <div className="flex items-center space-x-1.5 bg-[#fdfbf7] dark:bg-[#1c223c] p-2 rounded-xl border border-[#173c34]/15 dark:border-[#2f3a60]">
                          <FiClock className="w-4 h-4 text-[#ff6b8b]" />
                          <span>
                            {session.timer_mode === 'question'
                              ? `${session.duration_seconds || 30}s / Q`
                              : (session.duration_seconds && session.duration_seconds < 60
                                  ? `${session.duration_seconds}s`
                                  : `${session.duration_minutes || Math.ceil((session.duration_seconds || 600) / 60)} Mins`)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-[#fdfbf7] dark:bg-[#1c223c] p-2 rounded-xl border border-[#173c34]/15 dark:border-[#2f3a60]">
                          <FiHelpCircle className="w-4 h-4 text-[#5ce1e6]" />
                          <span>{session.question_count || 0} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#173c34]/10 dark:border-[#2f3a60] flex items-center gap-2.5">
                      {hasAttempted && attemptId ? (
                        <button
                          onClick={() => router.push(`/results/${attemptId}`)}
                          className="flex-1 py-2.5 px-4 rounded-full text-xs font-black text-[#173c34] dark:text-[#0c0a23] bg-[#b5e7d2] dark:bg-[#5ce1e6] hover:-translate-y-0.5 border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_3px_0_#236653] dark:shadow-[0_3px_0_#1a1060] transition-all flex items-center justify-center space-x-1.5"
                        >
                          <FiCheckCircle className="w-4 h-4 text-[#173c34] dark:text-[#0c0a23]" />
                          <span>View Results</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinQuiz(session.join_code)}
                          className="flex-1 py-2.5 px-4 rounded-full text-xs font-black text-[#173c34] dark:text-white bg-[#ff6b8b] dark:bg-[#ff5480] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] dark:border-[#ff6b8b] shadow-[0_3px_0_#173c34] dark:shadow-[0_3px_0_#1a1060] transition-all flex items-center justify-center space-x-1.5"
                        >
                          <FiPlay className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Start Quiz</span>
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/leaderboard/${sessionId}`)}
                        title="View Leaderboard"
                        className="w-10 h-10 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <FiAward className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Floating Theme Toggle Switcher */}
        <ThemeToggle floating />
      </div>
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
