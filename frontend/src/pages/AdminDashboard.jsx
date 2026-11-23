import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SessionForm from './SessionForm';
import LoadingSpinner from '../components/LoadingSpinner';
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

const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

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
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your quizzes, questions, monitor live attempts, and export results
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSessionForEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex-shrink-0"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create New Session</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Quizzes</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{sessions.length}</p>
            <p className="text-xs text-indigo-600 mt-1 font-medium">{draftCount} draft sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FiLayers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Quizzes</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{liveCount}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Accepting students</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Participants</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalParticipants}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Across all sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FiUsers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or join code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 text-slate-900"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Live', 'Draft', 'Ended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 flex items-center justify-center">
          <LoadingSpinner message="Loading quiz sessions..." />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FiLayers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No sessions found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
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
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : session.status === 'Draft'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={sessionId}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    {/* Status dropdown */}
                    <div className="relative">
                      <select
                        value={session.status || 'Draft'}
                        onChange={(e) => handleStatusChange(session, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${statusColor}`}
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
                        className="inline-flex items-center space-x-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                      >
                        <span>{session.join_code}</span>
                        <FiShare2 className="w-3 h-3 text-indigo-500" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{session.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {session.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata pill counters */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Duration</span>
                      <span className="font-bold text-slate-800 mt-0.5">{session.duration_minutes}m</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Questions</span>
                      <span className="font-bold text-slate-800 mt-0.5">{session.question_count || 0}</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Students</span>
                      <span className="font-bold text-slate-800 mt-0.5">{session.participant_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/sessions/${sessionId}/questions`)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <FiHelpCircle className="w-3.5 h-3.5" />
                      <span>Manage Questions</span>
                    </button>

                    <button
                      onClick={() => navigate(`/leaderboard/${sessionId}`)}
                      title="View Leaderboard"
                      className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <FiAward className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExportCSV(sessionId, session.title)}
                      title="Export CSV Report"
                      className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors"
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
                      className="flex-1 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <FiEdit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(sessionId, session.title)}
                      className="flex-1 py-1.5 px-3 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
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
};

export default AdminDashboard;
