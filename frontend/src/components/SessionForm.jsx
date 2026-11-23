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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#173c34]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f7f4ec] rounded-[2.25rem] max-w-lg w-full p-6 sm:p-8 border-3 border-[#173c34] shadow-[12px_12px_0_#173c34] transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b-2 border-[#173c34]/15">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#b5e7d2] text-[#173c34] border border-[#173c34] mb-2">
              Instructor Session
            </span>
            <h3 className="font-display text-2xl font-bold text-[#173c34]">
              {isEdit ? 'Edit Quiz Session' : 'Create New Session'}
            </h3>
            <p className="text-xs text-[#173c34]/70 mt-1">
              {isEdit ? 'Update session parameters and visibility' : 'Configure details for the upcoming quiz'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#173c34] bg-white text-[#173c34] hover:bg-[#ffb6aa] flex items-center justify-center transition-all shadow-[2px_2px_0_#173c34]"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] mb-2" htmlFor="title">
              Session Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Solutions Architect Associate Quiz"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] bg-white text-[#173c34] font-medium placeholder-[#173c34]/40 focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of topics covered, difficulty level, rules..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] bg-white text-[#173c34] font-medium placeholder-[#173c34]/40 focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] mb-2" htmlFor="duration">
              Duration (Minutes) *
            </label>
            <div className="relative">
              <input
                id="duration"
                type="number"
                min="1"
                max="300"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#173c34] bg-white text-[#173c34] font-bold focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all"
              />
              <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#173c34]/60" />
            </div>
            <p className="text-[11px] text-[#173c34]/60 mt-1">Timer starts counting down once a student begins.</p>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] mb-2" htmlFor="status">
                Session Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] bg-white text-[#173c34] font-bold focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all"
              >
                <option value="Draft">Draft (Only Admin can see & edit)</option>
                <option value="Live">Live (Open for student joins)</option>
                <option value="Ended">Ended (Submissions closed, results visible)</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-[#173c34]/15">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border-2 border-[#173c34] bg-white text-[#173c34] font-bold text-sm hover:bg-[#eef3f0] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#e65f45] text-white font-bold text-sm border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{isEdit ? 'Update Session' : 'Create Session'}</span>
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
