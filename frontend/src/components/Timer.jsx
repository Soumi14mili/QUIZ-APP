'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiAlertTriangle, FiZap } from 'react-icons/fi';

const Timer = ({
  mode = 'quiz', // 'quiz' | 'question'
  durationMs = null,
  durationSeconds = null,
  startedAt = null,
  resetKey = 0,
  onTimeUp,
}) => {
  const hasTriggeredRef = useRef(false);

  // Compute total duration in milliseconds
  const totalDurationMs = durationSeconds
    ? durationSeconds * 1000
    : durationMs || 900000;

  // In 'question' mode, count down from totalDurationMs directly
  // In 'quiz' mode, calculate remaining using startedAt and Date.now()
  const calculateRemaining = () => {
    if (mode === 'question') {
      return totalDurationMs;
    }

    if (!startedAt) return totalDurationMs;
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    return Math.max(0, totalDurationMs - elapsed);
  };

  const [remainingMs, setRemainingMs] = useState(calculateRemaining);

  // Reset when resetKey or totalDurationMs changes
  useEffect(() => {
    hasTriggeredRef.current = false;
    const initialRemaining = calculateRemaining();
    setRemainingMs(initialRemaining);

    if (initialRemaining <= 0) {
      hasTriggeredRef.current = true;
      onTimeUp?.();
      return;
    }

    let currentRemaining = initialRemaining;
    const interval = setInterval(() => {
      if (mode === 'question') {
        currentRemaining = Math.max(0, currentRemaining - 1000);
        setRemainingMs(currentRemaining);
        if (currentRemaining <= 0) {
          clearInterval(interval);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTimeUp?.();
          }
        }
      } else {
        const remaining = calculateRemaining();
        setRemainingMs(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTimeUp?.();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, totalDurationMs, startedAt, resetKey, onTimeUp]);

  // Format display as MM:SS (or SSs if under a minute)
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Badge & alert styling
  let containerStyle = 'bg-[#f7b955] text-[#173c34] border-2 border-[#173c34] shadow-[3px_3px_0_#173c34]';
  let badgeText = mode === 'question' ? 'Question Timer' : 'Total Time Left';

  if (remainingMs <= 10000) {
    containerStyle = 'bg-[#ffb6aa] text-[#173c34] border-2 border-[#e65f45] shadow-[3px_3px_0_#e65f45] animate-pulse';
    badgeText = mode === 'question' ? 'Hurry! Expiring...' : 'Time almost up!';
  } else if (remainingMs <= 30000) {
    containerStyle = 'bg-[#ffb6aa] text-[#173c34] border-2 border-[#e65f45] shadow-[3px_3px_0_#e65f45]';
    badgeText = mode === 'question' ? '< 30s left' : '< 30s left';
  } else if (remainingMs <= 60000) {
    containerStyle = 'bg-[#ffb6aa] text-[#173c34] border-2 border-[#173c34] shadow-[3px_3px_0_#173c34]';
    badgeText = '< 1 Min Left';
  } else if (mode === 'quiz' && remainingMs < 300000) {
    containerStyle = 'bg-[#f7b955] text-[#173c34] border-2 border-[#173c34] shadow-[3px_3px_0_#173c34]';
    badgeText = '< 5 Mins Left';
  }

  return (
    <div
      className={`inline-flex items-center space-x-3 px-4 py-2 rounded-2xl font-bold transition-all duration-300 ${containerStyle}`}
      role="timer"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <div className="w-8 h-8 rounded-full bg-white/70 border border-[#173c34]/20 flex items-center justify-center flex-shrink-0">
        {remainingMs <= 10000 ? (
          <FiAlertTriangle className="w-4 h-4 text-[#e65f45] animate-bounce" />
        ) : mode === 'question' ? (
          <FiZap className="w-4 h-4 text-[#173c34]" />
        ) : (
          <FiClock className="w-4 h-4 text-[#173c34]" />
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">
          {badgeText}
        </span>
        <span className="text-xl font-display font-bold leading-none tracking-tight">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default Timer;
