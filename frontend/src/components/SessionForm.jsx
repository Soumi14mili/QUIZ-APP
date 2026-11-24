'use client';

import React, { useState, useEffect } from 'react';
import { createQuizSession, updateQuizSession } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { KawaiiCloud } from './Caricatures';
import { FiX, FiClock, FiFileText, FiLayers, FiCheck, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SessionForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEdit = Boolean(initialData && (initialData.id || initialData._id));
  const { isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timerMode, setTimerMode] = useState('quiz'); // 'quiz' | 'question'
  const [durationSeconds, setDurationSeconds] = useState(900);
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      const mode = initialData.timer_mode || 'quiz';
      setTimerMode(mode);
      const secs = initialData.duration_seconds || (initialData.duration_minutes ? initialData.duration_minutes * 60 : (mode === 'question' ? 30 : 900));
      setDurationSeconds(secs);
      setStatus((initialData.status || 'draft').toLowerCase());
    } else {
      setTitle('');
      setDescription('');
      setTimerMode('quiz');
      setDurationSeconds(900);
      setStatus('draft');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Format seconds into readable string (e.g. "1m 30s" or "45s")
  const formatSecondsHelper = (totalSec) => {
    const s = parseInt(totalSec, 10);
    if (isNaN(s) || s <= 0) return '0 seconds';
    if (s < 60) return `${s} second${s > 1 ? 's' : ''}`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (rem === 0) return `${m} minute${m > 1 ? 's' : ''} (${s}s)`;
    return `${m}m ${rem}s (${s}s)`;
  };

  const handleModeChange = (newMode) => {
    setTimerMode(newMode);
    if (newMode === 'question') {
      // Default to 30s per question if previous duration was quiz scale (>180s)
      if (durationSeconds > 180) {
        setDurationSeconds(30);
      }
    } else {
      // Default to 900s (15 min) if previous duration was short (<120s)
      if (durationSeconds < 120) {
        setDurationSeconds(900);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Session title is required');
      return;
    }

    const secs = parseInt(durationSeconds, 10);
    if (isNaN(secs) || secs <= 0) {
      toast.error('Duration must be at least 1 second');
      return;
    }

    try {
      setLoading(true);
      const mins = Math.max(1, Math.ceil(secs / 60));
      const payload = {
        title: title.trim(),
        description: description.trim(),
        timer_mode: timerMode,
        duration_seconds: secs,
        duration_minutes: mins,
      };

      if (isEdit) {
        payload.status = status.toLowerCase();
        const sessionId = initialData.id || initialData._id;
        await updateQuizSession(sessionId, payload);
        toast.success('Session updated successfully');
      } else {
        await createQuizSession(payload);
        toast.success('New quiz session created');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Save session error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Failed to save session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const quizPresets = [
    { label: '60s (1m)', val: 60 },
    { label: '120s (2m)', val: 120 },
    { label: '300s (5m)', val: 300 },
    { label: '600s (10m)', val: 600 },
    { label: '900s (15m)', val: 900 },
    { label: '1800s (30m)', val: 1800 },
  ];

  const questionPresets = [
    { label: '15s', val: 15 },
    { label: '30s', val: 30 },
    { label: '45s', val: 45 },
    { label: '60s', val: 60 },
    { label: '90s', val: 90 },
    { label: '120s', val: 120 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c0a23]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#f7f4ec] dark:bg-[#1a1644] rounded-[2.25rem] max-w-lg w-full p-6 sm:p-8 border-3 border-[#173c34] dark:border-[#7c6cff] shadow-[12px_12px_0_#173c34] dark:shadow-[12px_12px_0_#7c6cff] transition-all animate-in fade-in zoom-in-95 duration-200 text-[#173c34] dark:text-[#f0eeff]">
        {/* Floating Cute Professor Cloud peeking on top of modal */}
        <div className="absolute -top-10 -left-4 pointer-events-none z-20">
          <KawaiiCloud variant="professor" className="w-20 h-16" isDark={isDark} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b-2 border-[#173c34]/15 dark:border-[#352f76]">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#b5e7d2] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] border border-[#173c34] dark:border-[#7c6cff] mb-2 shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff]">
              Instructor Session
            </span>
            <h3 className="font-display text-2xl font-bold text-[#173c34] dark:text-[#f0eeff]">
              {isEdit ? 'Edit Quiz Session' : 'Create New Session'}
            </h3>
            <p className="text-xs text-[#173c34]/70 dark:text-[#aca8d8] mt-1">
              {isEdit ? 'Update session parameters and timer settings' : 'Configure details & timing options for the upcoming quiz'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] hover:bg-[#ffb6aa] dark:hover:bg-[#ff6fb5]/20 flex items-center justify-center transition-all shadow-[2px_2px_0_#173c34] dark:shadow-[2px_2px_0_#7c6cff]"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-2" htmlFor="title">
              Session Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Solutions Architect Associate Quiz"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] font-medium placeholder-[#173c34]/40 dark:placeholder-[#aca8d8]/50 focus:outline-none focus:shadow-[4px_4px_0_#173c34] dark:focus:shadow-[4px_4px_0_#7c6cff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of topics covered, difficulty level, rules..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] font-medium placeholder-[#173c34]/40 dark:placeholder-[#aca8d8]/50 focus:outline-none focus:shadow-[4px_4px_0_#173c34] dark:focus:shadow-[4px_4px_0_#7c6cff] transition-all resize-none"
            />
          </div>

          {/* Timing Mode Options: Whole Quiz vs Each Question */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#221d57] border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[3px_3px_0_#173c34] dark:shadow-[3px_3px_0_#7c6cff] space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8]">
              Timing Mode *
            </label>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleModeChange('quiz')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  timerMode === 'quiz'
                    ? 'border-[#173c34] dark:border-[#5ce1e6] bg-[#b5e7d2] dark:bg-[#29246b] text-[#173c34] dark:text-[#5ce1e6] font-black shadow-[3px_3px_0_#173c34] dark:shadow-[3px_3px_0_#5ce1e6]'
                    : 'border-[#173c34]/20 dark:border-[#352f76] bg-[#fdfbf7] dark:bg-[#1a1644] text-[#173c34]/70 dark:text-[#aca8d8] hover:border-[#173c34]'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <FiClock className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">Whole Quiz</span>
                </div>
                <p className="text-[10px] leading-tight opacity-80 font-normal">
                  One total countdown for all questions combined.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('question')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  timerMode === 'question'
                    ? 'border-[#173c34] dark:border-[#5ce1e6] bg-[#f7b955] dark:bg-[#29246b] text-[#173c34] dark:text-[#5ce1e6] font-black shadow-[3px_3px_0_#173c34] dark:shadow-[3px_3px_0_#5ce1e6]'
                    : 'border-[#173c34]/20 dark:border-[#352f76] bg-[#fdfbf7] dark:bg-[#1a1644] text-[#173c34]/70 dark:text-[#aca8d8] hover:border-[#173c34]'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <FiZap className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">Each Question</span>
                </div>
                <p className="text-[10px] leading-tight opacity-80 font-normal">
                  Individual timer resets per question. Auto-advances!
                </p>
              </button>
            </div>
          </div>

          {/* Duration in Seconds */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8]" htmlFor="duration">
                {timerMode === 'quiz' ? 'Total Quiz Duration (in Seconds) *' : 'Per-Question Duration (in Seconds) *'}
              </label>
              <span className="text-xs font-bold font-mono text-[#e65f45] dark:text-[#ff6fb5]">
                {formatSecondsHelper(durationSeconds)}
              </span>
            </div>

            <div className="relative">
              <input
                id="duration"
                type="number"
                min="5"
                max="86400"
                required
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] font-bold focus:outline-none focus:shadow-[4px_4px_0_#173c34] dark:focus:shadow-[4px_4px_0_#7c6cff] transition-all"
                placeholder={timerMode === 'quiz' ? 'e.g. 900 for 15 min' : 'e.g. 30 seconds'}
              />
              <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#173c34]/60 dark:text-[#aca8d8]" />
            </div>

            {/* Quick Presets in Seconds */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] uppercase font-bold text-[#173c34]/60 dark:text-[#aca8d8] mr-1">Presets:</span>
              {(timerMode === 'quiz' ? quizPresets : questionPresets).map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setDurationSeconds(preset.val)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    parseInt(durationSeconds, 10) === preset.val
                      ? 'bg-[#173c34] dark:bg-[#5ce1e6] text-white dark:text-[#0c0a23] border-[#173c34] dark:border-[#5ce1e6] shadow-[1px_1px_0_#e65f45]'
                      : 'bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] border-[#173c34]/30 dark:border-[#7c6cff]/40 hover:bg-[#ffb6aa]/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#173c34]/60 dark:text-[#aca8d8]/70 mt-1">
              {timerMode === 'quiz'
                ? 'Countdown starts immediately when a student begins and spans the entire quiz.'
                : 'Each question starts its own countdown and auto-advances to the next question on 00:00.'}
            </p>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-2" htmlFor="status">
                Session Status
              </label>
              <select
                id="status"
                value={status.toLowerCase()}
                onChange={(e) => setStatus(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] font-bold focus:outline-none focus:shadow-[4px_4px_0_#173c34] dark:focus:shadow-[4px_4px_0_#7c6cff] transition-all cursor-pointer"
              >
                <option value="draft">Draft (Only Admin can see & edit)</option>
                <option value="live">Live (Open for student joins)</option>
                <option value="ended">Ended (Submissions closed, results visible)</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-[#173c34]/15 dark:border-[#352f76]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border-2 border-[#173c34] dark:border-[#7c6cff] bg-white dark:bg-[#221d57] text-[#173c34] dark:text-[#f0eeff] font-bold text-sm hover:bg-[#eef3f0] dark:hover:bg-[#29246b] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#e65f45] dark:bg-[#ff6fb5] text-white dark:text-[#0c0a23] font-bold text-sm border-2 border-[#173c34] dark:border-[#7c6cff] shadow-[0_4px_0_#a83a29] dark:shadow-[0_4px_0_#1a1060] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FiCheck className="w-4 h-4 stroke-[3]" />
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
