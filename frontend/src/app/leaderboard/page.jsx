'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLiveSessions, getSessionLeaderboard } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThemeToggle from '../../components/ThemeToggle';
import {
  KawaiiCloud,
  KawaiiServerRack,
  KawaiiS3Cup,
  QuestionMarkDoodle,
  SquigglyWave,
  Starburst,
  StarSparkle,
} from '../../components/Caricatures';
import { FiAward, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const formatTimeTaken = (ms) => {
  if (ms === null || ms === undefined) return '--:--';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function GeneralLeaderboardPage() {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGlobalOrLatestLeaderboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const liveSessions = await getLiveSessions();
      if (liveSessions && liveSessions.length > 0) {
        const activeSession = liveSessions[0];
        const sId = activeSession.id || activeSession._id;
        setSessionTitle(activeSession.title);
        const data = await getSessionLeaderboard(sId);
        const list = Array.isArray(data)
          ? data
          : data.leaderboard || data.participants || [];
        setLeaderboard(list);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Failed to load global leaderboard:', err);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalOrLatestLeaderboard();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fcf8ed] dark:bg-[#080b16] px-5 py-8 text-[#173c34] dark:text-[#f1f3f9] transition-colors duration-300 bg-dot-pattern">
      {/* Background Caricatures & Doodles */}
      <div className="doodle-float absolute left-6 top-24 hidden w-32 pointer-events-none select-none lg:block z-0">
        <KawaiiCloud className="w-32 h-24" isDark={isDark} />
      </div>
      <div className="doodle-float absolute right-8 top-36 hidden w-24 pointer-events-none select-none lg:block z-0">
        <KawaiiS3Cup className="w-24 h-28" isDark={isDark} />
      </div>
      <div className="doodle-float absolute bottom-12 left-8 hidden w-20 pointer-events-none select-none lg:block z-0">
        <KawaiiServerRack className="w-20 h-28" isDark={isDark} />
      </div>
      <div className="absolute bottom-24 right-[12%] hidden pointer-events-none select-none lg:block z-0 opacity-70">
        <Starburst className="w-10 h-10 text-[#f7b955] dark:text-[#5ce1e6]" />
      </div>
      <div className="absolute left-[15%] top-[52%] hidden pointer-events-none select-none lg:block z-0 opacity-40">
        <SquigglyWave className="w-28 text-[#e65f45] dark:text-[#ff6b8b]" />
      </div>
      <div className="absolute right-[8%] bottom-16 hidden pointer-events-none select-none lg:block z-0 opacity-50">
        <QuestionMarkDoodle className="w-8 h-12 text-[#e65f45] dark:text-[#ff6b8b]" />
      </div>

      <section className="relative mx-auto max-w-5xl py-6 z-10">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(user ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/')}
            className="flex items-center gap-2 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#121629] px-4 py-2 text-xs font-black text-[#173c34] dark:text-[#f1f3f9] shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] hover:-translate-y-0.5 transition-all"
          >
            <FiArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Back to {user ? 'Dashboard' : 'Home'}</span>
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => fetchGlobalOrLatestLeaderboard(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#121629] px-4 py-2 text-xs font-black text-[#173c34] dark:text-[#f1f3f9] shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#ff6b8b]' : ''}`} />
              <span>Refresh ranks</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#080b16] border-2 border-[#173c34] dark:border-[#5ce1e6] shadow-[4px_4px_0_#0b2721] dark:shadow-[4px_4px_0_#1a1060] mx-auto animate-float-bob">
            <FiAward className="h-8 w-8 stroke-[2.2]" />
          </div>

          <p className="text-xs font-black uppercase tracking-[.18em] text-[#e65f45] dark:text-[#ff6b8b]">
            {sessionTitle ? `${sessionTitle} rankings` : 'AWS Class Rankings'}
          </p>

          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight text-[#173c34] dark:text-white">
            Leaderboard
          </h1>

          <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-[#526b64] dark:text-[#8b97b8] font-medium">
            Accuracy takes the podium. Faster completion time breaks a tie.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 py-20 flex flex-col items-center justify-center space-y-4">
            <KawaiiCloud className="w-24 h-16" isDark={isDark} />
            <LoadingSpinner message="Calculating rankings and scores..." />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="mt-12 overflow-hidden rounded-[2rem] bg-white dark:bg-[#121629] text-[#173c34] dark:text-[#f1f3f9] shadow-[10px_10px_0_#f7b955] dark:shadow-[10px_10px_0_#5ce1e6] border-2.5 border-[#173c34] dark:border-[#232b47] transition-all">
            <div className="grid grid-cols-[48px_1fr_80px_90px] gap-3 border-b border-[#173c34]/15 dark:border-[#2f3a60] bg-[#f4eee0] dark:bg-[#1c223c] px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#526b64] dark:text-[#8b97b8] sm:grid-cols-[70px_1fr_120px_130px]">
              <span>Rank</span>
              <span>Student</span>
              <span>Score</span>
              <span>Time</span>
            </div>

            <div className="p-14 text-center space-y-4">
              <div className="flex items-center justify-center gap-5">
                <KawaiiCloud className="w-24 h-18" isDark={isDark} />
                <KawaiiServerRack className="w-14 h-20" isDark={isDark} />
              </div>
              <h2 className="font-display font-black text-2xl text-[#173c34] dark:text-white">
                The board is ready.
              </h2>
              <p className="text-sm text-[#526b64] dark:text-[#8b97b8] max-w-md mx-auto">
                Completed quiz sessions will appear here. Start a quiz session to claim #1!
              </p>
              <button
                onClick={() => router.push(user ? '/dashboard' : '/login')}
                className="inline-block mt-4 rounded-full bg-[#173c34] dark:bg-[#2f2891] dark:hover:bg-[#4338c0] px-7 py-3 text-xs font-black text-white border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_4px_0_#0d2923] dark:shadow-[0_4px_0_#1a1060] hover:-translate-y-0.5 transition-all"
              >
                {user ? 'Go to Dashboard' : 'Sign In to Play'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {/* Top 3 Podium */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Rank 2 */}
                <div className="rounded-[2rem] border-2.5 border-[#173c34] dark:border-[#7c6cff] bg-[#b5e7d2] dark:bg-[#b9b0ff] p-6 text-[#173c34] dark:text-[#080b16] shadow-[6px_6px_0_#0b2721] dark:shadow-[6px_6px_0_#7c6cff] order-2 sm:order-1 sm:h-52 flex flex-col justify-between transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🥈</span>
                    <span className="rounded-full bg-white/40 dark:bg-black/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      2nd Place
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl truncate font-black">
                      {leaderboard[1]?.student_name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black">{leaderboard[1]?.score}</span>
                      <span className="text-xs font-bold opacity-75">pts</span>
                      <span className="ml-auto font-mono text-xs font-black">
                        ⏱ {formatTimeTaken(leaderboard[1]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank 1 Champion */}
                <div className="rounded-[2.25rem] border-3 border-[#173c34] dark:border-[#5ce1e6] bg-[#f7b955] dark:bg-[#5ce1e6] p-7 text-[#173c34] dark:text-[#080b16] shadow-[8px_8px_0_#0b2721] dark:shadow-[8px_8px_0_#7c6cff] order-1 sm:order-2 sm:h-60 flex flex-col justify-between transition-all relative">
                  <div className="absolute -top-4 -right-2">
                    <StarSparkle className="w-7 h-7 text-[#ff6b8b] dark:text-[#ff6fb5]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">👑</span>
                    <span className="rounded-full bg-[#173c34] text-[#f7b955] dark:bg-[#080b16] dark:text-[#5ce1e6] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Champion
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl truncate font-black">
                      {leaderboard[0]?.student_name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-black">{leaderboard[0]?.score}</span>
                      <span className="text-sm font-bold opacity-75">pts</span>
                      <span className="ml-auto font-mono text-xs font-black">
                        ⏱ {formatTimeTaken(leaderboard[0]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="rounded-[2rem] border-2.5 border-[#173c34] dark:border-[#ff6fb5] bg-[#ffb6aa] dark:bg-[#ff6fb5] p-6 text-[#173c34] dark:text-[#080b16] shadow-[6px_6px_0_#0b2721] dark:shadow-[6px_6px_0_#7c6cff] order-3 sm:h-48 flex flex-col justify-between transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🥉</span>
                    <span className="rounded-full bg-white/40 dark:bg-black/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      3rd Place
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl truncate font-black">
                      {leaderboard[2]?.student_name || 'Contender'}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black">{leaderboard[2]?.score || 0}</span>
                      <span className="text-xs font-bold opacity-75">pts</span>
                      <span className="ml-auto font-mono text-xs font-black">
                        ⏱ {formatTimeTaken(leaderboard[2]?.time_taken_ms)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Rankings Table */}
            <div className="overflow-hidden rounded-[2.25rem] bg-white dark:bg-[#121629] text-[#173c34] dark:text-[#f1f3f9] shadow-[10px_10px_0_#f7b955] dark:shadow-[10px_10px_0_#5ce1e6] border-2.5 border-[#173c34] dark:border-[#232b47] transition-all">
              <div className="grid grid-cols-[60px_1fr_90px_100px] sm:grid-cols-[80px_1fr_120px_130px] gap-3 border-b border-[#173c34]/15 dark:border-[#2f3a60] bg-[#f4eee0] dark:bg-[#1c223c] px-6 py-4 text-[10px] font-black uppercase tracking-wider text-[#526b64] dark:text-[#8b97b8]">
                <span>Rank</span>
                <span>Student</span>
                <span>Score</span>
                <span>Time</span>
              </div>

              <div className="divide-y divide-[#eceeea] dark:divide-[#2f3a60]">
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
                          ? 'bg-[#fff0ed] dark:bg-[#ff5480]/15 font-black text-[#173c34] dark:text-[#5ce1e6] border-l-4 border-[#ff6b8b]'
                          : 'hover:bg-[#fbfbfa] dark:hover:bg-[#1c223c]/40'
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black ${
                            rank === 1
                              ? 'bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#080b16] shadow-[2px_2px_0_#173c34]'
                              : rank === 2
                              ? 'bg-[#b5e7d2] dark:bg-[#b9b0ff] text-[#173c34] dark:text-[#080b16]'
                              : rank === 3
                              ? 'bg-[#ffb6aa] dark:bg-[#ff6fb5] text-[#173c34] dark:text-[#080b16]'
                              : 'bg-[#eceeea] dark:bg-[#221d57] text-[#596b65] dark:text-[#aca8d8]'
                          }`}
                        >
                          #{rank}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold text-sm truncate">{row.student_name}</span>
                        {isCurrentUser && (
                          <span className="rounded-full bg-[#ff6b8b] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            You
                          </span>
                        )}
                      </div>

                      <div className="font-black text-sm">
                        <span className="text-[#e65f45] dark:text-[#ff6fb5]">{row.score}</span>
                        {row.total_questions && (
                          <span className="text-xs font-medium text-[#8a9692] dark:text-[#8b97b8]">
                            {' '}
                            / {row.total_questions}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs font-bold text-[#596b65] dark:text-[#8b97b8]">
                        {formatTimeTaken(row.time_taken_ms)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#526b64] dark:text-[#8b97b8]">
          Leaderboard updates whenever a student completes a quiz.
        </p>
      </section>

      <ThemeToggle floating />
    </main>
  );
}
