'use client';

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiX, FiClock, FiFileText, FiLayers, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SessionForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEdit = Boolean(initialData && (initialData.id || initialData._id));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [status, setStatus] = useState('Draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDurationMinutes(initialData.duration_minutes || 15);
      setStatus(initialData.status || 'Draft');
    } else {
      setTitle('');
      setDescription('');
      setDurationMinutes(15);
      setStatus('Draft');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Session title is required');
      return;
    }

    if (durationMinutes <= 0) {
      toast.error('Duration must be at least 1 minute');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration_minutes: parseInt(durationMinutes, 10),
      };

      if (isEdit) {
        payload.status = status;
        const sessionId = initialData.id || initialData._id;
        await api.put(`/admin/sessions/${sessionId}`, payload);
        toast.success('Session updated successfully');
      } else {
        await api.post('/admin/sessions', payload);
        toast.success('New quiz session created');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Save session error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Quiz Session' : 'Create New Session'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update session parameters and visibility' : 'Configure details for the upcoming quiz'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="title">
              Session Title *
            </label>
            <div className="relative">
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Fundamentals & ES6"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, instructions, or rules for students..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-900 placeholder-slate-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="duration">
                Duration (Minutes) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiClock className="w-4 h-4" />
                </div>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="300"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-900"
                />
              </div>
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="status">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-900 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Live">Live</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create Session'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;
