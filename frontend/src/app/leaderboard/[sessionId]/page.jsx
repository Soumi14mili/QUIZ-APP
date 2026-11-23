'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FiAward, FiArrowLeft, FiRefreshCw, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper to format time_taken_ms as mm:ss
const formatTimeTaken = (ms) => {
  if (ms === null || ms === undefined) return '--:--';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function LeaderboardContent() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async (isManual = false) => {
    if (!sessionId) return;
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/leaderboard/sessions/${sessionId}`);
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data.leaderboard || data.participants || [];
      setLeaderboard(list);

      if (data.session?.title || data.session_title) {
        setSessionTitle(data.session?.title || data.session_title);
      } else {
        try {
          const sRes = isAdmin
            ? await api.get(`/admin/sessions/${sessionId}`)
            : await api.get('/quiz/sessions');
          if (isAdmin) {
            setSessionTitle(sRes.data.session?.title || sRes.data.title || 'Quiz Session');
          } else {
            const sessionsList = Array.isArray(sRes.data) ? sRes.data : sRes.data.sessions || [];
            const cur = sessionsList.find((s) => (s.id || s._id) === sessionId);
            if (cur) setSessionTitle(cur.title);
          }
        } catch {
          // Ignore secondary session title lookup error
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sessionId, isAdmin]);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#173c34] px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-5xl py-8">
        {/* Navigation & Refresh */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/dashboard')}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-extrabold text-[#b8cec8] hover:bg-white/10 transition"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
          </button>

          <button
            onClick={() => fetchLeaderboard(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-extrabold text-[#b8cec8] hover:bg-white/10 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh ranks</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center">
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[#f7b955] text-[#173c34] shadow-[4px_4px_0_#0b2721]">
            <FiAward className="h-7 w-7" />
          </span>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-[#b5e7d2]">
            {sessionTitle ? `${sessionTitle} rankings` : 'Live class rankings'}
          </p>
          <h1 className="font-display mt-3 text-5xl tracking-[-.05em] sm:text-7xl text-white">
            Leaderboard
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#b8cec8]">
            Accuracy takes the podium. Faster completion time breaks a tie.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 py-20 flex justify-center">
            <LoadingSpinner message="Calculating rankings and scores..." />
          </div>
        ) : leaderboard.length === 0 ? (
          /* Empty state matching Figma exact layout */
          <div className="mt-12 overflow-hidden rounded-[2rem] bg-white text-[#173c34] shadow-[10px_10px_0_#f7b955] border-2 border-[#173c34]">
            <div className="grid grid-cols-[48px_1fr_80px_90px] gap-3 border-b border-[#e4e7e3] bg-[#f6f7f4] px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#7b8984] sm:grid-cols-[70px_1fr_120px_130px]">
              <span>Rank</span>
              <span>Student</span>
              <span>Score</span>
              <span>Time</span>
            </div>
            <div className="p-14 text-center">
              <h2 className="font-extrabold text-xl text-[#173c34]">The board is ready.</h2>
              <p className="mt-2 text-sm text-[#76847f]">
                Completed quiz sessions will appear here. Be the first to claim #1!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 rounded-full bg-[#173c34] px-6 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_0_#0d2923] hover:-translate-y-0.5 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {/* Top 3 Podium */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Rank 2 */}
                <div className="rounded-[1.75rem] border-2 border-[#173c34] bg-[#b5e7d2] p-6 text-[#173c34] shadow-[6px_6px_0_#0b2721] order-2 sm:order-1 sm:h-52 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🥈</span>
                    <span className="rounded-full bg-white/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      2nd Place
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl truncate font-bold">
                      {leaderboard[1]?.student_name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black">{leaderboard[1]?.score}</span>
                      <span className="text-xs font-bold text-[#173c34]/70">pts</span>
                      <span className="ml-auto font-mono text-xs font-bold">
                        ⏱ {formatTimeTaken(leaderboard[1]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank 1 (Gold Champion) */}
                <div className="rounded-[2rem] border-2 border-[#173c34] bg-[#f7b955] p-7 text-[#173c34] shadow-[8px_8px_0_#0b2721] order-1 sm:order-2 sm:h-60 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">👑</span>
                    <span className="rounded-full bg-[#173c34] text-[#f7b955] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Champion
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl truncate font-extrabold">
                      {leaderboard[0]?.student_name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-black">{leaderboard[0]?.score}</span>
                      <span className="text-sm font-bold text-[#173c34]/70">pts</span>
                      <span className="ml-auto font-mono text-xs font-black">
                        ⏱ {formatTimeTaken(leaderboard[0]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="rounded-[1.75rem] border-2 border-[#173c34] bg-[#ffb6aa] p-6 text-[#173c34] shadow-[6px_6px_0_#0b2721] order-3 sm:h-48 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🥉</span>
                    <span className="rounded-full bg-white/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      3rd Place
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl truncate font-bold">
                      {leaderboard[2]?.student_name || 'Participant'}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black">{leaderboard[2]?.score || 0}</span>
                      <span className="text-xs font-bold text-[#173c34]/70">pts</span>
                      <span className="ml-auto font-mono text-xs font-bold">
                        ⏱ {formatTimeTaken(leaderboard[2]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Rankings Table */}
            <div className="overflow-hidden rounded-[2rem] bg-white text-[#173c34] shadow-[10px_10px_0_#f7b955] border-2 border-[#173c34]">
              <div className="grid grid-cols-[60px_1fr_90px_100px] gap-3 border-b border-[#e4e7e3] bg-[#f6f7f4] px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#7b8984] sm:grid-cols-[80px_1fr_120px_130px]">
                <span>Rank</span>
                <span>Student</span>
                <span>Score</span>
                <span>Time</span>
              </div>

              <div className="divide-y divide-[#eceeea]">
                {leaderboard.map((row, index) => {
                  const rank = row.rank || index + 1;
                  const isCurrentUser =
                    user &&
                    (row.student_name === user.full_name ||
                      row.user_id === user.id ||
                      row.student_id === user.id);

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[60px_1fr_90px_100px] sm:grid-cols-[80px_1fr_120px_130px] items-center gap-3 px-6 py-4 transition ${
                        isCurrentUser
                          ? 'bg-[#fff0ed] font-extrabold text-[#173c34]'
                          : 'hover:bg-[#fbfbfa]'
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black ${
                            rank === 1
                              ? 'bg-[#f7b955] text-[#173c34] shadow-[2px_2px_0_#173c34]'
                              : rank === 2
                              ? 'bg-[#b5e7d2] text-[#173c34]'
                              : rank === 3
                              ? 'bg-[#ffb6aa] text-[#173c34]'
                              : 'bg-[#eceeea] text-[#596b65]'
                          }`}
                        >
                          #{rank}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold text-sm truncate">{row.student_name}</span>
                        {isCurrentUser && (
                          <span className="rounded-full bg-[#e65f45] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            You
                          </span>
                        )}
                      </div>

                      <div className="font-extrabold text-sm">
                        <span className="text-[#e65f45]">{row.score}</span>
                        {row.total_questions && (
                          <span className="text-xs font-medium text-[#8a9692]">
                            {' '}
                            / {row.total_questions}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs font-bold text-[#596b65]">
                        {formatTimeTaken(row.time_taken_ms)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#8eaaa2]">
          Leaderboard updates whenever a student completes a quiz.
        </p>
      </section>
    </main>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}