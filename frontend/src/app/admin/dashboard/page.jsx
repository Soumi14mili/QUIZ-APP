'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminSessions, updateQuizSession, deleteQuizSession, getSessionLeaderboard } from '../../../lib/supabase';
import ProtectedRoute from '../../../components/ProtectedRoute';
import SessionForm from '../../../components/SessionForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ThemeToggle from '../../../components/ThemeToggle';
import { useTheme } from '../../../context/ThemeContext';
import {
  KawaiiCloud,
  KawaiiServerRack,
  KawaiiS3Cup,
  StarSparkle,
} from '../../../components/Caricatures';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiHelpCircle,
  FiUsers,
  FiClock,
  FiAward,
  FiDownload,
  FiSearch,
  FiLayers,
  FiCheckCircle,
  FiShare2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminDashboardContent() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { isDark } = useTheme();
  const router = useRouter();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const list = await getAdminSessions();
      setSessions(list || []);
    } catch (err) {
      console.error('Failed to load admin sessions:', err);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete session "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteQuizSession(id);
      toast.success('Session deleted successfully');
      setSessions((prev) => prev.filter((s) => (s.id || s._id) !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete session');
    }
  };

  const handleStatusChange = async (session, newStatus) => {
    const sessionId = session.id || session._id;
    const normalized = newStatus.toLowerCase();
    try {
      await updateQuizSession(sessionId, {
        status: normalized,
      });
      toast.success(`Session status changed to ${normalized}`);
      setSessions((prev) =>
        prev.map((s) => ((s.id || s._id) === sessionId ? { ...s, status: normalized } : s))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      const msg = err.message || 'Failed to update session status';
      toast.error(msg);
    }
  };

  const handleExportCSV = async (sessionId, sessionTitle) => {
    try {
      toast.loading('Preparing CSV export...', { id: 'export-csv' });
      const data = await getSessionLeaderboard(sessionId);
      const rows = data.leaderboard || [];

      const csvContent = [
        ['Rank', 'Student Name', 'Score', 'Total Questions', 'Time Taken (s)'].join(','),
        ...rows.map((r) => [
          r.rank,
          `"${(r.student_name || '').replace(/"/g, '""')}"`,
          r.score,
          r.total_questions || '',
          (r.time_taken_ms ? (r.time_taken_ms / 1000).toFixed(1) : '0'),
        ].join(',')),
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session-${sessionTitle || sessionId}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded successfully', { id: 'export-csv' });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export CSV report', { id: 'export-csv' });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filterStatus === 'All' || s.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.join_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const liveCount = sessions.filter((s) => s.status?.toLowerCase() === 'live').length;
  const draftCount = sessions.filter((s) => s.status?.toLowerCase() === 'draft').length;
  const totalParticipants = sessions.reduce((acc, curr) => acc + (curr.participant_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#f5f3ec] dark:bg-[#0c0a23] text-[#18332c] dark:text-[#f0eeff] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* ======================================================== */}
        {/* 1. TOP HERO BANNER with FLOATING PROFESSOR CLOUD CARICATURE */}
        {/* ======================================================== */}
        <div className="relative rounded-[2.5rem] bg-white dark:bg-[#1a1644] p-6 sm:p-8 border-2 border-[#18332c] dark:border-[#352f76] shadow-[8px_8px_0_#18332c] dark:shadow-[8px_8px_0_#7c6cff] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden transition-all">
          
          {/* Subtle background cartoon caricature */}
          <div className="absolute -right-4 -bottom-6 opacity-15 dark:opacity-20 pointer-events-none select-none">
            <KawaiiServerRack className="w-40 h-48" isDark={isDark} />
          </div>

          <div className="flex items-center gap-5 z-10">
            {/* Cute Professor Cloud Caricature with Graduation Cap & Glasses! */}
            <div className="flex-shrink-0">
              <KawaiiCloud variant="professor" className="w-24 h-20 sm:w-28 sm:h-22" isDark={isDark} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#b5e7d2] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] border border-[#173c34] dark:border-[#7c6cff] shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff]">
                  Instructor Console
                </span>
                <span className="text-xs font-bold text-[#e65f45] dark:text-[#ff6fb5] flex items-center gap-1">
                  <StarSparkle className="w-3.5 h-3.5 text-[#f6c453] dark:text-[#5ce1e6]" />
                  <span>Live Arena</span>
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-normal text-[#173c34] dark:text-[#f0eeff] tracking-tight">
                Session &amp; Question Manager
              </h1>
              <p className="text-sm text-[#173c34]/70 dark:text-[#aca8d8] mt-1 max-w-xl">
                Author and orchestrate live quiz arenas, manage question pools, and inspect real-time student rankings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 z-10">
            {/* Theme Toggle in Header */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#18332c] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] shadow-[2px_2px_0_#18332c] dark:shadow-[2px_2px_0_#7c6cff]">
              <span className="text-xs font-bold text-[#18332c] dark:text-[#aca8d8] hidden sm:inline">Theme:</span>
              <ThemeToggle />
            </div>

            <button
              onClick={() => {
                setSelectedSessionForEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[#e65f45] dark:bg-[#ff6fb5] dark:text-[#0c0a23] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_4px_0_#a83a29] dark:shadow-[0_4px_0_#1a1060] transition-all"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" />
              <span>Create New Session</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. METRICS ROW with FLOATING CARTOONS                    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Sessions */}
          <div className="relative bg-white dark:bg-[#1a1644] rounded-[2rem] p-6 border-2 border-[#173c34] dark:border-[#352f76] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] flex items-center justify-between transition-all overflow-hidden group">
            {/* Cute peek-in server rack */}
            <div className="absolute -right-2 -bottom-2 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
              <KawaiiServerRack className="w-16 h-20" isDark={isDark} />
            </div>

            <div className="z-10">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#173c34]/70 dark:text-[#aca8d8]">Total Sessions</p>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] dark:text-[#f0eeff] mt-1">{sessions.length}</p>
              <p className="text-xs text-[#173c34]/70 dark:text-[#aca8d8]/80 mt-1 font-semibold">{draftCount} in draft</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#f7f4ec] dark:bg-[#221d57] border-2 border-[#173c34] dark:border-[#7c6cff] text-[#173c34] dark:text-[#5ce1e6] flex items-center justify-center shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] z-10">
              <FiLayers className="w-6 h-6" />
            </div>
          </div>

          {/* Live Now */}
          <div className="relative bg-[#b5e7d2] dark:bg-[#2f2891] rounded-[2rem] p-6 border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] text-[#173c34] dark:text-white flex items-center justify-between transition-all overflow-hidden group">
            {/* Cute floating cloud cheer */}
            <div className="absolute right-12 -top-2 opacity-35 group-hover:opacity-60 transition-opacity pointer-events-none">
              <KawaiiCloud className="w-18 h-12" isDark={isDark} />
            </div>

            <div className="z-10">
              <p className="text-[11px] font-black uppercase tracking-wider opacity-80 text-[#173c34] dark:text-[#5ce1e6]">Live Now</p>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] dark:text-white mt-1">{liveCount}</p>
              <p className="text-xs font-semibold opacity-80 mt-1 text-[#173c34] dark:text-[#aca8d8]">Accepting answers</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1644] border-2 border-[#173c34] dark:border-[#7c6cff] text-[#173c34] dark:text-[#5ce1e6] flex items-center justify-center shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] z-10">
              <FiCheckCircle className="w-6 h-6 text-[#236653] dark:text-[#5ce1e6]" />
            </div>
          </div>

          {/* Total Submissions */}
          <div className="relative bg-[#f7b955] dark:bg-[#5ce1e6] rounded-[2rem] p-6 border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] text-[#173c34] dark:text-[#0c0a23] flex items-center justify-between transition-all overflow-hidden group">
            {/* Cute floating S3 cup cheer */}
            <div className="absolute right-14 -bottom-1 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
              <KawaiiS3Cup className="w-14 h-18" isDark={isDark} />
            </div>

            <div className="z-10">
              <p className="text-[11px] font-black uppercase tracking-wider opacity-85 text-[#173c34] dark:text-[#0c0a23]">Total Submissions</p>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] dark:text-[#0c0a23] mt-1">{totalParticipants}</p>
              <p className="text-xs font-semibold opacity-85 mt-1 text-[#173c34] dark:text-[#0c0a23]/80">Across all cohorts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1644] border-2 border-[#173c34] dark:border-[#7c6cff] text-[#173c34] dark:text-[#5ce1e6] flex items-center justify-center shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] z-10">
              <FiUsers className="w-6 h-6 text-[#173c34] dark:text-[#5ce1e6]" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. CONTROLS & SEARCH                                    */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1a1644] p-4 rounded-2xl border-2 border-[#173c34] dark:border-[#352f76] shadow-[4px_4px_0_#173c34] dark:shadow-[4px_4px_0_#7c6cff] transition-all">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#173c34]/50 dark:text-[#aca8d8]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or code..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-xs font-medium focus:outline-none focus:shadow-[3px_3px_0_#173c34] dark:focus:shadow-[3px_3px_0_#7c6cff] text-[#173c34] dark:text-[#f0eeff] placeholder-[#173c34]/50 dark:placeholder-[#aca8d8]/60 transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Live', 'Draft', 'Ended'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${
                  filterStatus === status
                    ? 'bg-[#173c34] dark:bg-[#2f2891] text-white border-[#173c34] dark:border-[#7c6cff] shadow-[2px_2px_0_#e65f45] dark:shadow-[2px_2px_0_#ff6fb5]'
                    : 'bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#aca8d8] border-[#173c34] dark:border-[#352f76] hover:bg-[#eef3f0] dark:hover:bg-[#29246b]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. SESSIONS GRID / EMPTY STATE with FLOATING CARTOONS   */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 bg-white dark:bg-[#1a1644] rounded-[2rem] border-2 border-[#173c34] dark:border-[#352f76] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] flex flex-col items-center justify-center space-y-4">
            <KawaiiCloud className="w-24 h-16" isDark={isDark} />
            <LoadingSpinner message="Scanning sessions repository..." />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-[#1a1644] rounded-[2rem] border-2 border-[#173c34] dark:border-[#352f76] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] space-y-6">
            
            {/* Playful Floating Caricatures in Empty State */}
            <div className="flex items-center justify-center gap-6">
              <KawaiiCloud variant="professor" className="w-28 h-20" isDark={isDark} />
              <KawaiiServerRack className="w-16 h-22" isDark={isDark} />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-display text-2xl font-bold text-[#173c34] dark:text-[#f0eeff]">
                {searchQuery || filterStatus !== 'All' ? 'No matching sessions' : 'Ready to launch your first quiz?'}
              </h3>
              <p className="text-xs sm:text-sm text-[#173c34]/70 dark:text-[#aca8d8] leading-relaxed">
                {searchQuery || filterStatus !== 'All'
                  ? 'No quiz sessions matched your search or status filter. Try clearing filters.'
                  : 'Welcome, Quiz Master! Create a quiz session, add questions, set the countdown timer, and watch your students climb the live leaderboard!'}
              </p>
            </div>

            {!searchQuery && filterStatus === 'All' && (
              <button
                onClick={() => {
                  setSelectedSessionForEdit(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full text-xs font-bold text-white bg-[#e65f45] dark:bg-[#ff6fb5] dark:text-[#0c0a23] border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_4px_0_#a83a29] dark:shadow-[0_4px_0_#1a1060] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <FiPlus className="w-4 h-4 stroke-[3]" />
                <span>Create Your First Session</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const sessionId = session.id || session._id;
              const curStatus = (session.status || 'draft').toLowerCase();
              const statusColor =
                curStatus === 'live'
                  ? 'bg-[#b5e7d2] text-[#173c34] border-[#173c34] dark:bg-[#5ce1e6] dark:text-[#0c0a23] dark:border-[#7c6cff]'
                  : curStatus === 'draft'
                  ? 'bg-[#f7b955] text-[#173c34] border-[#173c34] dark:bg-[#f7b955] dark:text-[#0c0a23] dark:border-[#7c6cff]'
                  : 'bg-[#eef3f0] text-[#173c34] border-[#173c34] dark:bg-[#221d57] dark:text-[#aca8d8] dark:border-[#352f76]';

              return (
                <div
                  key={sessionId}
                  className="group relative bg-white dark:bg-[#1a1644] rounded-[2rem] p-6 border-2 border-[#173c34] dark:border-[#352f76] shadow-[6px_6px_0_#173c34] dark:shadow-[6px_6px_0_#7c6cff] hover:shadow-[10px_10px_0_#173c34] dark:hover:shadow-[10px_10px_0_#7c6cff] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={curStatus}
                          onChange={(e) => handleStatusChange(session, e.target.value)}
                          className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 cursor-pointer focus:outline-none transition-all ${statusColor}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="live">Live</option>
                          <option value="ended">Ended</option>
                        </select>
                      </div>

                      {session.join_code && (
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(session.join_code);
                            toast.success(`Copied join code: ${session.join_code}`);
                          }}
                          title="Click to copy join code"
                          className="inline-flex items-center space-x-1.5 text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[#f7f4ec] dark:bg-[#221d57] hover:bg-[#ffb6aa] dark:hover:bg-[#ff6fb5]/20 text-[#173c34] dark:text-[#5ce1e6] border border-[#173c34] dark:border-[#7c6cff] transition-colors"
                        >
                          <span>{session.join_code}</span>
                          <FiShare2 className="w-3 h-3 text-[#e65f45] dark:text-[#ff6fb5]" />
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold text-[#173c34] dark:text-[#f0eeff] line-clamp-1">
                          {session.title}
                        </h3>
                        {curStatus === 'live' && (
                          <span className="flex-shrink-0 animate-pulse" title="Live session">
                            <StarSparkle className="w-4 h-4 text-[#e65f45] dark:text-[#ff6fb5]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#173c34]/70 dark:text-[#aca8d8] mt-1 line-clamp-2 leading-relaxed">
                        {session.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Metadata pill counters */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#173c34]/10 dark:border-[#352f76] text-xs text-[#173c34] dark:text-[#f0eeff]">
                      <div className="flex flex-col items-center bg-[#fdfbf7] dark:bg-[#221d57] p-2 rounded-xl border border-[#173c34]/15 dark:border-[#7c6cff]/30">
                        <span className="text-[10px] uppercase font-bold text-[#173c34]/60 dark:text-[#aca8d8]">
                          {session.timer_mode === 'question' ? 'Per-Q Timer' : 'Duration'}
                        </span>
                        <span className="font-display font-bold text-sm text-[#173c34] dark:text-[#5ce1e6] mt-0.5" title={session.timer_mode === 'question' ? `${session.duration_seconds || 30} seconds per question` : `${session.duration_seconds || session.duration_minutes * 60} seconds total`}>
                          {session.timer_mode === 'question'
                            ? `${session.duration_seconds || 30}s / Q`
                            : (session.duration_seconds && session.duration_seconds < 60
                                ? `${session.duration_seconds}s`
                                : `${session.duration_minutes || Math.ceil((session.duration_seconds || 900) / 60)}m`)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-[#fdfbf7] dark:bg-[#221d57] p-2 rounded-xl border border-[#173c34]/15 dark:border-[#7c6cff]/30">
                        <span className="text-[10px] uppercase font-bold text-[#173c34]/60 dark:text-[#aca8d8]">Questions</span>
                        <span className="font-display font-bold text-sm text-[#173c34] dark:text-[#5ce1e6] mt-0.5">{session.question_count || 0}</span>
                      </div>
                      <div className="flex flex-col items-center bg-[#fdfbf7] dark:bg-[#221d57] p-2 rounded-xl border border-[#173c34]/15 dark:border-[#7c6cff]/30">
                        <span className="text-[10px] uppercase font-bold text-[#173c34]/60 dark:text-[#aca8d8]">Students</span>
                        <span className="font-display font-bold text-sm text-[#173c34] dark:text-[#5ce1e6] mt-0.5">{session.participant_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-[#173c34]/10 dark:border-[#352f76] space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/sessions/${sessionId}/questions`)}
                        className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-white bg-[#173c34] dark:bg-[#2f2891] hover:-translate-y-0.5 border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_3px_0_#0d2923] dark:shadow-[0_3px_0_#1a1060] transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FiHelpCircle className="w-3.5 h-3.5" />
                        <span>Manage Questions</span>
                      </button>

                      <button
                        onClick={() => router.push(`/leaderboard/${sessionId}`)}
                        title="View Leaderboard"
                        className="w-9 h-9 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <FiAward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleExportCSV(sessionId, session.title)}
                        title="Export CSV Report"
                        className="w-9 h-9 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-[#b5e7d2] dark:bg-[#b9b0ff] text-[#173c34] dark:text-[#0c0a23] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff] flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSessionForEdit(session);
                          setIsFormOpen(true);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-[#173c34] dark:text-[#f0eeff] bg-white dark:bg-[#221d57] hover:bg-[#eef3f0] dark:hover:bg-[#29246b] border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[1px_1px_0_#173c34] dark:shadow-[1px_1px_0_#7c6cff] transition-all flex items-center justify-center space-x-1"
                      >
                        <FiEdit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(sessionId, session.title)}
                        className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-[#e65f45] dark:text-[#ff6fb5] bg-[#fff0ed] dark:bg-[#ff6fb5]/10 hover:bg-[#ffb6aa] dark:hover:bg-[#ff6fb5]/20 border-2 border-[#e65f45] dark:border-[#ff6fb5] shadow-[1px_1px_0_#e65f45] dark:shadow-[1px_1px_0_#ff6fb5] transition-all flex items-center justify-center space-x-1"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form for Create / Edit */}
        <SessionForm
          isOpen={isFormOpen}
          initialData={selectedSessionForEdit}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchSessions}
        />

        {/* Floating Theme Toggle Switcher */}
        <ThemeToggle floating />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
