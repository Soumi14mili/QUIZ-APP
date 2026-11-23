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

  // Theme styling based on remaining duration
  let containerStyle = 'bg-[#f7b955] text-[#173c34] border-2 border-[#173c34] shadow-[3px_3px_0_#173c34]';
  let badgeText = 'Time Left';

  if (remainingMs < 30000) {
    containerStyle = 'bg-[#ffb6aa] text-[#173c34] border-2 border-[#e65f45] shadow-[3px_3px_0_#e65f45] animate-pulse';
    badgeText = 'Hurry Up!';
  } else if (remainingMs < 60000) {
    containerStyle = 'bg-[#ffb6aa] text-[#173c34] border-2 border-[#173c34] shadow-[3px_3px_0_#173c34]';
    badgeText = '< 1 Min Left';
  } else if (remainingMs < 300000) {
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
        {remainingMs < 60000 ? (
          <FiAlertTriangle className="w-4 h-4 text-[#e65f45] animate-bounce" />
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
