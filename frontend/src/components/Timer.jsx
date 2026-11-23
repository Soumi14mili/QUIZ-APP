'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';

const Timer = ({ durationMs, startedAt, onTimeUp }) => {
  const hasTriggeredRef = useRef(false);

  const calculateRemaining = () => {
    if (!durationMs || !startedAt) return 0;
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    return Math.max(0, durationMs - elapsed);
  };

  const [remainingMs, setRemainingMs] = useState(calculateRemaining);

  useEffect(() => {
    // Initial check
    const initialRemaining = calculateRemaining();
    setRemainingMs(initialRemaining);

    if (initialRemaining <= 0) {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTimeUp?.();
      }
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onTimeUp?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMs, startedAt, onTimeUp]);

  // Format as MM:SS
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Color styles based on thresholds
  let statusClasses = 'bg-indigo-50 border-indigo-200 text-indigo-700';
  let badgeText = 'Time Remaining';

  if (remainingMs < 30000) {
    statusClasses = 'bg-red-100 border-red-500 text-red-700 animate-pulse';
    badgeText = 'Hurry Up!';
  } else if (remainingMs < 60000) {
    statusClasses = 'bg-rose-50 border-rose-300 text-rose-600';
    badgeText = 'Under 1 Minute';
  } else if (remainingMs < 300000) {
    statusClasses = 'bg-amber-50 border-amber-300 text-amber-700';
    badgeText = 'Under 5 Minutes';
  }

  return (
    <div
      className={`inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl border font-mono font-bold shadow-sm transition-all duration-300 ${statusClasses}`}
      role="timer"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      {remainingMs < 60000 ? (
        <FiAlertTriangle className="w-5 h-5 text-current animate-bounce" />
      ) : (
        <FiClock className="w-5 h-5 text-current" />
      )}
      <div className="flex flex-col text-left font-sans">
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
          {badgeText}
        </span>
        <span className="text-xl font-mono font-bold leading-none">{formattedTime}</span>
      </div>
    </div>
  );
};

export default Timer;
