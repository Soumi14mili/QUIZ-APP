'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {
  FiAward,
  FiClock,
  FiArrowLeft,
  FiRefreshCw,
  FiUser,
} from 'react-icons/fi';
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

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-extrabold text-sm shadow-md shadow-amber-200 ring-2 ring-amber-400/50">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900 font-extrabold text-sm shadow-md ring-2 ring-slate-300">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-extrabold text-sm shadow-md ring-2 ring-amber-700/50">
          🥉 3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {sessionTitle || 'Session Leaderboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Official ranking of participants sorted by highest score and fastest completion time
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Scores</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 flex items-center justify-center">
          <LoadingSpinner message="Calculating rankings and scores..." />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <FiAward className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No submissions yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Be the first student to complete this quiz and claim the #1 spot on the leaderboard!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <span>Go to Dashboard</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {leaderboard.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Rank 2 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center order-2 sm:order-1 sm:mt-6">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">2nd Place</span>
                <h4 className="font-bold text-slate-900 mt-1 truncate max-w-full">
                  {leaderboard[1]?.student_name || 'Participant'}
                </h4>
                <div className="text-xl font-extrabold text-slate-800 mt-2">
                  {leaderboard[1]?.score} <span className="text-xs font-normal text-slate-500">pts</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ⏱ {formatTimeTaken(leaderboard[1]?.time_taken_ms)}
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-300 shadow-lg shadow-amber-100 flex flex-col items-center text-center order-1 sm:order-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shadow-md mb-2">
                  👑
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Champion</span>
                <h4 className="font-extrabold text-lg text-slate-900 mt-1 truncate max-w-full">
                  {leaderboard[0]?.student_name || 'Participant'}
                </h4>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">
                  {leaderboard[0]?.score} <span className="text-sm font-normal text-slate-600">pts</span>
                </div>
                <div className="text-xs font-bold text-slate-600 font-mono mt-1">
                  ⏱ {formatTimeTaken(leaderboard[0]?.time_taken_ms)}
                </div>
              </div>

              {/* Rank 3 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center order-3 sm:mt-8">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700/80">3rd Place</span>
                <h4 className="font-bold text-slate-900 mt-1 truncate max-w-full">
                  {leaderboard[2]?.student_name || 'Participant'}
                </h4>
                <div className="text-xl font-extrabold text-slate-800 mt-2">
                  {leaderboard[2]?.score} <span className="text-xs font-normal text-slate-500">pts</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ⏱ {formatTimeTaken(leaderboard[2]?.time_taken_ms)}
                </div>
              </div>
            </div>
          )}

          {/* Table for Desktop */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6 w-24 text-center">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-right">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leaderboard.map((row, index) => {
                  const rank = row.rank || index + 1;
                  const isCurrentUser =
                    user &&
                    (row.student_name === user.full_name ||
                      row.user_id === user.id ||
                      row.student_id === user.id);

                  let rowStyles = isCurrentUser
                    ? 'bg-indigo-50/80 font-semibold ring-2 ring-indigo-500 ring-inset'
                    : 'hover:bg-slate-50/80';

                  return (
                    <tr key={index} className={`transition-colors ${rowStyles}`}>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">{getRankBadge(rank)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                            {row.student_name ? row.student_name.charAt(0).toUpperCase() : <FiUser />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{row.student_name}</span>
                            {isCurrentUser && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-900">
                        <span className="text-base text-indigo-600 font-extrabold">{row.score}</span>
                        {row.total_questions && (
                          <span className="text-xs text-slate-400 font-normal"> / {row.total_questions}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600 font-medium">
                        {formatTimeTaken(row.time_taken_ms)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Responsive) */}
          <div className="md:hidden space-y-3">
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
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
                    isCurrentUser
                      ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-400'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankBadge(rank)}
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-slate-900">{row.student_name}</h4>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <FiClock className="w-3 h-3" />
                        <span className="font-mono">{formatTimeTaken(row.time_taken_ms)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-indigo-600">{row.score}</span>
                    {row.total_questions && (
                      <span className="text-xs text-slate-400 font-normal">/{row.total_questions}</span>
                    )}
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Score</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
