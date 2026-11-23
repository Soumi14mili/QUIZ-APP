'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../api/axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import SessionForm from '../../../components/SessionForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
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
  FiSliders,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminDashboardContent() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sessions');
      const list = Array.isArray(res.data) ? res.data : res.data.sessions || [];
      setSessions(list);
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
      await api.delete(`/admin/sessions/${id}`);
      toast.success('Session deleted successfully');
      setSessions((prev) => prev.filter((s) => (s.id || s._id) !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete session');
    }
  };

  const handleStatusChange = async (session, newStatus) => {
    const sessionId = session.id || session._id;
    try {
      await api.put(`/admin/sessions/${sessionId}`, {
        title: session.title,
        description: session.description,
        duration_minutes: session.duration_minutes,
        status: newStatus,
      });
      toast.success(`Session status changed to ${newStatus}`);
      setSessions((prev) =>
        prev.map((s) => ((s.id || s._id) === sessionId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update session status');
    }
  };

  const handleExportCSV = async (sessionId, sessionTitle) => {
    try {
      toast.loading('Preparing CSV export...', { id: 'export-csv' });
      const response = await api.get(`/admin/sessions/${sessionId}/export`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
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
    const matchesFilter = filterStatus === 'All' || s.status === filterStatus;
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.join_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const liveCount = sessions.filter((s) => s.status === 'Live').length;
  const draftCount = sessions.filter((s) => s.status === 'Draft').length;
  const totalParticipants = sessions.reduce((acc, curr) => acc + (curr.participant_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#b5e7d2] text-[#173c34] border border-[#173c34] mb-2">
            Instructor Console
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-[#173c34] tracking-tight">
            Session & Question Manager
          </h1>
          <p className="text-sm text-[#173c34]/70 mt-1">
            Author and orchestrate live quiz arenas, manage question pools, and inspect rankings
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSessionForEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[#e65f45] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all flex-shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create New Session</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-[2rem] p-6 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-[#173c34]/70">Total Sessions</p>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] mt-1">{sessions.length}</p>
            <p className="text-xs text-[#173c34]/70 mt-1 font-semibold">{draftCount} in draft</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f7f4ec] border-2 border-[#173c34] text-[#173c34] flex items-center justify-center shadow-[2px_2px_0_#173c34]">
            <FiLayers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#b5e7d2] rounded-[2rem] p-6 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] text-[#173c34] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider opacity-80">Live Now</p>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] mt-1">{liveCount}</p>
            <p className="text-xs font-semibold opacity-80 mt-1">Accepting answers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#173c34] text-[#173c34] flex items-center justify-center shadow-[2px_2px_0_#173c34]">
            <FiCheckCircle className="w-6 h-6 text-[#236653]" />
          </div>
        </div>

        <div className="bg-[#f7b955] rounded-[2rem] p-6 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] text-[#173c34] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider opacity-80">Total Submissions</p>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#173c34] mt-1">{totalParticipants}</p>
            <p className="text-xs font-semibold opacity-80 mt-1">Across all cohorts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#173c34] text-[#173c34] flex items-center justify-center shadow-[2px_2px_0_#173c34]">
            <FiUsers className="w-6 h-6 text-[#173c34]" />
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-[#173c34] shadow-[4px_4px_0_#173c34]">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#173c34]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-[#173c34] text-xs font-medium focus:outline-none focus:shadow-[3px_3px_0_#173c34] text-[#173c34]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Live', 'Draft', 'Ended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-[#173c34] flex-shrink-0 ${
                filterStatus === status
                  ? 'bg-[#173c34] text-white shadow-[2px_2px_0_#e65f45]'
                  : 'bg-white text-[#173c34] hover:bg-[#eef3f0]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-16 bg-white rounded-[2rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] flex items-center justify-center">
          <LoadingSpinner message="Scanning sessions repository..." />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-[2rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f7f4ec] border-2 border-[#173c34] text-[#173c34] flex items-center justify-center mx-auto shadow-[3px_3px_0_#173c34]">
            <FiLayers className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#173c34]">No sessions found</h3>
          <p className="text-xs sm:text-sm text-[#173c34]/70 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'All'
              ? 'No quiz sessions matched your search or status filter.'
              : 'Create your first quiz session to start adding questions and hosting live competitions!'}
          </p>
          {!searchQuery && filterStatus === 'All' && (
            <button
              onClick={() => {
                setSelectedSessionForEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Session</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const sessionId = session.id || session._id;
            const statusColor =
              session.status === 'Live'
                ? 'bg-[#b5e7d2] text-[#173c34] border-[#173c34]'
                : session.status === 'Draft'
                ? 'bg-[#f7b955] text-[#173c34] border-[#173c34]'
                : 'bg-[#eef3f0] text-[#173c34] border-[#173c34]';

            return (
              <div
                key={sessionId}
                className="bg-white rounded-[2rem] p-6 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] hover:shadow-[10px_10px_0_#173c34] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    {/* Status dropdown */}
                    <div className="relative">
                      <select
                        value={session.status || 'Draft'}
                        onChange={(e) => handleStatusChange(session, e.target.value)}
                        className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 cursor-pointer focus:outline-none ${statusColor}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Live">Live</option>
                        <option value="Ended">Ended</option>
                      </select>
                    </div>

                    {session.join_code && (
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(session.join_code);
                          toast.success(`Copied join code: ${session.join_code}`);
                        }}
                        title="Click to copy join code"
                        className="inline-flex items-center space-x-1.5 text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-[#f7f4ec] hover:bg-[#ffb6aa] text-[#173c34] border border-[#173c34] transition-colors"
                      >
                        <span>{session.join_code}</span>
                        <FiShare2 className="w-3 h-3 text-[#e65f45]" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-[#173c34] line-clamp-1">{session.title}</h3>
                    <p className="text-xs text-[#173c34]/70 mt-1 line-clamp-2 leading-relaxed">
                      {session.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata pill counters */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#173c34]/10 text-xs text-[#173c34]">
                    <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-xl border border-[#173c34]/15">
                      <span className="text-[10px] uppercase font-bold text-[#173c34]/60">Duration</span>
                      <span className="font-display font-bold text-sm text-[#173c34] mt-0.5">{session.duration_minutes}m</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-xl border border-[#173c34]/15">
                      <span className="text-[10px] uppercase font-bold text-[#173c34]/60">Questions</span>
                      <span className="font-display font-bold text-sm text-[#173c34] mt-0.5">{session.question_count || 0}</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-xl border border-[#173c34]/15">
                      <span className="text-[10px] uppercase font-bold text-[#173c34]/60">Students</span>
                      <span className="font-display font-bold text-sm text-[#173c34] mt-0.5">{session.participant_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[#173c34]/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/sessions/${sessionId}/questions`)}
                      className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-white bg-[#173c34] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_3px_0_#0d2923] transition-all flex items-center justify-center space-x-1.5"
                    >
                      <FiHelpCircle className="w-3.5 h-3.5" />
                      <span>Manage Questions</span>
                    </button>

                    <button
                      onClick={() => router.push(`/leaderboard/${sessionId}`)}
                      title="View Leaderboard"
                      className="w-9 h-9 rounded-full border-2 border-[#173c34] bg-[#f7b955] text-[#173c34] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <FiAward className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExportCSV(sessionId, session.title)}
                      title="Export CSV Report"
                      className="w-9 h-9 rounded-full border-2 border-[#173c34] bg-[#b5e7d2] text-[#173c34] hover:-translate-y-0.5 shadow-[2px_2px_0_#173c34] flex items-center justify-center transition-all flex-shrink-0"
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
                      className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] shadow-[1px_1px_0_#173c34] transition-all flex items-center justify-center space-x-1"
                    >
                      <FiEdit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(sessionId, session.title)}
                      className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-[#e65f45] bg-[#fff0ed] hover:bg-[#ffb6aa] border-2 border-[#e65f45] shadow-[1px_1px_0_#e65f45] transition-all flex items-center justify-center space-x-1"
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
