'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle({ className = '', floating = false }) {
  const { isDark, toggleTheme } = useTheme();

  if (floating) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border-2 transition-all shadow-[3px_3px_0_#18332c] dark:shadow-[3px_3px_0_#7c6cff] flex items-center justify-center hover:scale-110 active:scale-95 ${
          isDark
            ? 'bg-[#1a1644] border-[#7c6cff] text-[#5ce1e6]'
            : 'bg-white border-[#18332c] text-[#18332c]'
        } ${className}`}
        aria-label="Toggle theme"
      >
        {isDark ? <FiSun className="w-5 h-5 text-[#5ce1e6]" /> : <FiMoon className="w-5 h-5 text-[#18332c]" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
        isDark
          ? 'bg-[#1a1644] border-[#7c6cff] text-[#5ce1e6] hover:bg-[#221d57]'
          : 'bg-white border-[#18332c] text-[#18332c] hover:bg-[#f5f3ec]'
      } ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? <FiSun className="w-4 h-4 text-[#5ce1e6]" /> : <FiMoon className="w-4 h-4 text-[#18332c]" />}
    </button>
  );
}
