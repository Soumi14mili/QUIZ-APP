'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { FiArrowRight, FiShield, FiClock, FiAward } from 'react-icons/fi';

// ==========================================
// Kawaii Hand-drawn SVG Characters & Doodles
// (Adaptive to Neo-Pop Light and Dark palettes)
// ==========================================

function KawaiiCloud({ className = 'w-24 h-16', isDark = false }) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const sparkleColor = isDark ? '#5CE1E6' : '#F6C453';

  return (
    <div className={`relative inline-block ${className}`}>
      <svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Cloud Body */}
        <path
          d="M32 64H92C104 64 113 55 113 43C113 32 105 23 94 22C92 10 80 2 66 2C54 2 44 9 40 19C37 18 34 17 31 17C17 17 6 28 6 42C6 54 17 64 32 64Z"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Happy Curved Eyes */}
        <path d="M44 38C44 38 48 33 52 38" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 38C68 38 72 33 76 38" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Little Smile */}
        <path d="M57 44C57 44 60 48 63 44" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Pink Blush Cheeks */}
        <ellipse cx="38" cy="42" rx="4.5" ry="2.5" fill="#FFA59E" />
        <ellipse cx="82" cy="42" rx="4.5" ry="2.5" fill="#FFA59E" />
      </svg>
      {/* Little Star Sparkles */}
      <span className="absolute -top-1 -right-2 text-sm animate-pulse" style={{ color: sparkleColor }}>
        ✦
      </span>
      <span className="absolute top-2 -right-4 text-xs" style={{ color: sparkleColor }}>
        ★
      </span>
    </div>
  );
}

function KawaiiServerRack({ className = 'w-14 h-18', isDark = false }) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const bottomTierColor = isDark ? '#5CE1E6' : '#F6C453';

  return (
    <svg viewBox="0 0 70 85" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top Tier (Mint / Lavender) */}
      <rect x="6" y="6" width="56" height="18" rx="7" fill={isDark ? '#B9B0FF' : '#99E2C6'} stroke={strokeColor} strokeWidth="2.5" />
      <line x1="14" y1="15" x2="22" y2="15" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      {/* Happy face on top rack */}
      <circle cx="34" cy="14" r="1.5" fill={strokeColor} />
      <circle cx="44" cy="14" r="1.5" fill={strokeColor} />
      <path d="M38 17C38 17 39 19 40 17" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="53" cy="15" r="1.5" fill={strokeColor} />

      {/* Middle Tier (Lavender Blue) */}
      <rect x="6" y="27" width="56" height="18" rx="7" fill="#C3BBF5" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="14" y1="36" x2="30" y2="36" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="36" r="1.5" fill={strokeColor} />
      <circle cx="53" cy="36" r="1.5" fill={strokeColor} />

      {/* Bottom Tier (Golden Yellow / Electric Cyan) */}
      <rect x="6" y="48" width="56" height="18" rx="7" fill={bottomTierColor} stroke={strokeColor} strokeWidth="2.5" />
      <line x1="14" y1="57" x2="36" y2="57" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="57" r="1.5" fill={strokeColor} />
      <circle cx="53" cy="57" r="1.5" fill={strokeColor} />

      {/* Cute Stick Feet */}
      <line x1="20" y1="67" x2="16" y2="76" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="67" x2="52" y2="76" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function KawaiiS3Cup({ className = 'w-16 h-20', isDark = false }) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const textColor = isDark ? '#7C6CFF' : '#18332C';

  return (
    <svg viewBox="0 0 75 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* S3 Cup Body */}
      <path
        d="M12 18 L19 72 C19.5 76 23 80 27 80 H47 C51 80 54.5 76 55 72 L62 18 Z"
        fill="#FFB6AA"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Top rim lid */}
      <ellipse cx="37" cy="18" rx="26" ry="6" fill="#FFA59E" stroke={strokeColor} strokeWidth="2.5" />
      {/* Cute Face */}
      <circle cx="31" cy="38" r="1.8" fill={strokeColor} />
      <circle cx="43" cy="38" r="1.8" fill={strokeColor} />
      <path d="M35 44C35 44 37 47 39 44" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="25" cy="42" rx="2.5" ry="1.5" fill="#E6674E" opacity="0.6" />
      <ellipse cx="49" cy="42" rx="2.5" ry="1.5" fill="#E6674E" opacity="0.6" />
      {/* S3 Text */}
      <text x="37" y="66" textAnchor="middle" fill={textColor} fontFamily="sans-serif" fontSize="11" fontWeight="800">
        S3
      </text>
    </svg>
  );
}

function StarSparkle({ className = 'w-6 h-6 text-[#99E2C6]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
    </svg>
  );
}

function SquiggleOrange({ isDark = false }) {
  const strokeColor = isDark ? '#FF6FB5' : '#E6674E';
  return (
    <svg width="90" height="14" viewBox="0 0 90 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 7C8 2 14 12 20 7C26 2 32 12 38 7C44 2 50 12 56 7C62 2 68 12 74 7C80 2 86 12 88 7"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SquiggleDark({ isDark = false }) {
  const strokeColor = isDark ? '#5CE1E6' : '#1E5246';
  return (
    <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 8C10 2 18 14 26 8C34 2 42 14 50 8C58 2 66 14 74 8C82 2 90 14 98 8C106 2 114 14 118 8"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ==========================================
// Main Landing Page Component
// ==========================================

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const [selectedDemoOption, setSelectedDemoOption] = useState('B');

  const destinationLink = isAuthenticated
    ? (isAdmin ? '/admin/dashboard' : '/dashboard')
    : '/login';

  return (
    <div className="min-h-screen bg-[#f5f3ec] dark:bg-[#0c0a23] text-[#18332c] dark:text-[#f0eeff] bg-dot-pattern transition-colors duration-300">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                         */}
      {/* ======================================================== */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-20 lg:pt-14 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-7 z-10">
            {/* Built for AWS Pill Badge (Gold in Light, Electric Cyan in Dark) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6c453] dark:bg-[#5ce1e6] border-2 border-[#18332c] dark:border-[#7c6cff] shadow-[3px_3px_0_#18332c] dark:shadow-[3px_3px_0_#7c6cff] transition-all">
              <span className="w-2 h-2 rounded-full bg-[#e6674e] dark:bg-[#ff6fb5]" />
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#18332c] dark:text-[#0c0a23]">
                Built for AWS learners
              </span>
            </div>

            {/* Main Editorial Hero Title */}
            <h1 className="font-display text-[clamp(4rem,7.8vw,7.25rem)] leading-[0.88] tracking-[-0.04em] text-[#18332c] dark:text-[#f0eeff]">
              Ready. Set.<br />
              <span className="italic font-normal text-[#e6674e] dark:text-[#ff6fb5]">Cloud.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-lg font-medium leading-relaxed text-[#576b63] dark:text-[#aca8d8]">
              The focused quiz arena where <em className="italic font-bold text-[#18332c] dark:text-[#5ce1e6]">AWS</em> students sharpen their skills, race the clock, and rise through the class leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={destinationLink}
                className="group inline-flex items-center gap-4 rounded-full bg-[#18332c] dark:bg-[#2f2891] dark:hover:bg-[#4338c0] pl-7 pr-3 py-3.5 text-sm font-bold text-white border-2 border-[#18332c] dark:border-[#7c6cff] shadow-[4px_4px_0_#0d2923] dark:shadow-[4px_4px_0_#1a1060] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <span>{isAuthenticated ? 'Enter dashboard' : 'Start a quiz'}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6c453] dark:bg-[#5ce1e6] text-[#18332c] dark:text-[#2f2891] group-hover:rotate-45 transition-transform">
                  <FiArrowRight className="h-4 w-4 stroke-[2.5]" />
                </span>
              </Link>

              <Link
                href="/#leaderboard"
                className="rounded-full border-2 border-[#18332c] dark:border-[#7c6cff] px-7 py-4 text-sm font-bold transition-all text-[#18332c] dark:text-[#f0eeff] bg-transparent hover:bg-white/70 dark:hover:bg-[#1a1644]"
              >
                View leaderboard
              </Link>
            </div>

            {/* Squiggle Doodle under buttons (Turns Neon Pink in Dark Mode) */}
            <div className="pt-1">
              <SquiggleOrange isDark={isDark} />
            </div>

            {/* Social Proof & Class Stat with Kawaii Server Rack */}
            <div className="pt-2 flex items-start gap-4">
              {/* Stacked Server Rack Character */}
              <div className="relative -mt-1 flex-shrink-0">
                <div className="flex -space-x-2 mb-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f5f3ec] dark:border-[#0c0a23] text-[9px] font-black text-[#18332c] bg-[#99e2c6] dark:bg-[#b9b0ff]">
                    AM
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f5f3ec] dark:border-[#0c0a23] text-[9px] font-black text-[#18332c] bg-[#c3bbf5]">
                    JL
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f5f3ec] dark:border-[#0c0a23] text-[9px] font-black text-[#18332c] bg-[#ffb6aa]">
                    SK
                  </span>
                </div>
                <KawaiiServerRack isDark={isDark} />
              </div>

              <div className="pt-1">
                <strong className="block text-sm font-extrabold text-[#18332c] dark:text-[#f0eeff]">
                  One shared goal
                </strong>
                <span className="text-xs font-semibold text-[#576b63] dark:text-[#aca8d8]">
                  Get AWS exam-ready
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Quiz Preview Mockup Card */}
          <div className="lg:col-span-5 relative mx-auto w-full max-w-[490px]">
            {/* Floating Cute Smiling Cloud on top of Card */}
            <div className="absolute -top-12 left-16 z-20 pointer-events-none">
              <KawaiiCloud isDark={isDark} />
            </div>

            {/* Floating Streak Badge on top right (Mint in Light, Lavender in Dark) */}
            <div className="absolute -right-3 -top-5 z-20 rotate-6 rounded-2xl border-2 border-[#18332c] dark:border-[#7c6cff] bg-[#99e2c6] dark:bg-[#b9b0ff] px-4 py-2.5 shadow-[4px_4px_0_#18332c] dark:shadow-[4px_4px_0_#7c6cff] transition-all">
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#18332c] dark:text-[#0c0a23]">
                CURRENT STREAK
              </span>
              <strong className="font-display text-2xl font-black text-[#18332c] dark:text-[#0c0a23] leading-none">
                5×
              </strong>
            </div>

            {/* Neo-brutalist White Quiz Card (Crisp White with Lilac Border/Shadow in Dark Mode) */}
            <div className="relative rounded-[2.25rem] border-[2.5px] border-[#18332c] dark:border-[#7c6cff] bg-white p-7 shadow-[10px_10px_0_#18332c] dark:shadow-[10px_10px_0_#7c6cff] transition-all">
              {/* Category Pill & Score Circle */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#e8f5ef] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#236653]">
                  CLOUD CONCEPTS · 3/10
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f6c453] dark:bg-[#5ce1e6] border-2 border-[#18332c] dark:border-[#7c6cff] font-black text-[#18332c] dark:text-[#0c0a23] shadow-[2px_2px_0_#18332c] dark:shadow-[2px_2px_0_#7c6cff] text-sm">
                  12
                </span>
              </div>

              {/* Progress Bar with Coral / Neon Pink Accent */}
              <div className="my-5 h-1.5 rounded-full bg-[#eceeea] overflow-hidden">
                <div className="h-full w-[30%] rounded-full bg-[#e6674e] dark:bg-[#ff6fb5] transition-all" />
              </div>

              {/* Question Text */}
              <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-[#18332c] mb-6">
                Which AWS service provides object storage?
              </h2>

              {/* 4 Interactive MCQ Options (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'A', text: 'Amazon EC2' },
                  { key: 'B', text: 'Amazon S3' },
                  { key: 'C', text: 'AWS Lambda' },
                  { key: 'D', text: 'Amazon RDS' },
                ].map((opt) => {
                  const isSelected = selectedDemoOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedDemoOption(opt.key)}
                      className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                        isSelected
                          ? 'border-[#e6674e] dark:border-[#ff6fb5] bg-[#fef2f0] dark:bg-[#fff0f7] text-[#18332c] shadow-[2px_2px_0_#e6674e] dark:shadow-[2px_2px_0_#ff6fb5]'
                          : 'border-[#e6e2d6] bg-white text-[#18332c] hover:border-[#18332c] dark:hover:border-[#7c6cff]'
                      }`}
                    >
                      <span className="mb-1 block text-[10px] font-bold text-[#8c9c94]">
                        {opt.key}
                      </span>
                      <span className="text-sm font-bold block leading-tight">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex justify-between items-center text-xs font-semibold text-[#8c9c94]">
                <span>Choose one answer</span>
                <span className="font-mono font-bold text-[#18332c]">00:12</span>
              </div>
            </div>

            {/* Sparkle Star below Card */}
            <div className="absolute -bottom-6 -left-4">
              <StarSparkle className={`w-8 h-8 ${isDark ? 'text-[#5ce1e6]' : 'text-[#99e2c6]'}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. HOW CLOUDQUEST WORKS (Forest Green in Light, Royal Indigo in Dark) */}
      {/* ======================================================== */}
      <section
        id="how-it-works"
        className="w-full bg-[#143d34] dark:bg-[#2f2891] text-white py-24 relative overflow-hidden bg-dot-pattern-dark transition-colors duration-300"
      >
        {/* Decorative Sparkle on top left */}
        <div className="absolute top-12 left-10 hidden sm:block">
          <StarSparkle className={`w-7 h-7 opacity-80 ${isDark ? 'text-[#5ce1e6]' : 'text-[#f6c453]'}`} />
        </div>

        {/* Smiling Kawaii S3 Cup Doodle on right edge */}
        <div className="absolute top-12 right-6 hidden md:block">
          <KawaiiS3Cup isDark={isDark} />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Header Row */}
          <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#99e2c6] dark:text-[#5ce1e6] mb-3">
                ONE SMOOTH SESSION
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                How CloudQuest works
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#b4cbcf] dark:text-[#aca8d8] font-medium">
              No complicated setup. Your instructor prepares the session; you bring your AWS knowledge.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 01 */}
            <div className="rounded-[1.75rem] border border-white/10 dark:border-[#7c6cff]/30 bg-white/[0.05] dark:bg-[#1a1644]/60 p-7 hover:bg-white/[0.08] dark:hover:bg-[#1a1644] transition-all">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#99e2c6] dark:bg-[#b9b0ff] text-[#18332c] dark:text-[#0c0a23] shadow-[2px_2px_0_#0d2923] dark:shadow-[2px_2px_0_#1a1060]">
                  <FiShield className="h-6 w-6 stroke-[2.2]" />
                </span>
                <span className="font-display text-3xl font-bold text-white/25 dark:text-white/40">01</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-white font-display">Sign in securely</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#a2beb4] dark:text-[#aca8d8] font-medium">
                Enter with your student account and see every available assessment.
              </p>
            </div>

            {/* Step 02 */}
            <div className="rounded-[1.75rem] border border-white/10 dark:border-[#7c6cff]/30 bg-white/[0.05] dark:bg-[#1a1644]/60 p-7 hover:bg-white/[0.08] dark:hover:bg-[#1a1644] transition-all">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f6c453] dark:bg-[#5ce1e6] text-[#18332c] dark:text-[#0c0a23] shadow-[2px_2px_0_#0d2923] dark:shadow-[2px_2px_0_#1a1060]">
                  <FiClock className="h-6 w-6 stroke-[2.2]" />
                </span>
                <span className="font-display text-3xl font-bold text-white/25 dark:text-white/40">02</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-white font-display">Beat the clock</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#a2beb4] dark:text-[#aca8d8] font-medium">
                Answer focused AWS questions in a clean, distraction-free session.
              </p>
            </div>

            {/* Step 03 */}
            <div className="rounded-[1.75rem] border border-white/10 dark:border-[#7c6cff]/30 bg-white/[0.05] dark:bg-[#1a1644]/60 p-7 hover:bg-white/[0.08] dark:hover:bg-[#1a1644] transition-all">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6674e] dark:bg-[#ff6fb5] text-white shadow-[2px_2px_0_#0d2923] dark:shadow-[2px_2px_0_#1a1060]">
                  <FiAward className="h-6 w-6 stroke-[2.2] text-white" />
                </span>
                <span className="font-display text-3xl font-bold text-white/25 dark:text-white/40">03</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-white font-display">Claim your rank</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#a2beb4] dark:text-[#aca8d8] font-medium">
                Your score and finish time place you on the live class leaderboard.
              </p>
            </div>
          </div>

          {/* Squiggle at bottom center */}
          <div className="mt-16 flex justify-center">
            <SquiggleDark isDark={isDark} />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CALL TO ACTION (Golden Yellow in Light, Electric Cyan in Dark) */}
      {/* ======================================================== */}
      <section className="px-6 py-20 lg:py-28">
        <div className="relative mx-auto max-w-5xl rounded-[2.5rem] bg-[#f6c453] dark:bg-[#5ce1e6] px-6 py-16 text-center border-[3px] border-[#18332c] dark:border-[#7c6cff] shadow-[8px_8px_0_#18332c] dark:shadow-[8px_8px_0_#7c6cff] transition-all">
          
          {/* Top-Left Floating Question Mark Doodle */}
          <div className="absolute top-8 left-12 font-display text-4xl text-[#c99a38] dark:text-[#18332c]/20 font-bold select-none hidden sm:block">
            ?
          </div>

          {/* Bottom-Left Kawaii Cloud Doodle */}
          <div className="absolute -bottom-4 left-6 hidden sm:block pointer-events-none">
            <KawaiiCloud className="w-20 h-14" isDark={isDark} />
          </div>

          {/* Bottom-Right Kawaii Server Rack Doodle */}
          <div className="absolute -bottom-4 right-8 hidden sm:block pointer-events-none">
            <KawaiiServerRack className="w-12 h-16" isDark={isDark} />
          </div>

          {/* Content */}
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#18332c]/80 dark:text-[#0c0a23]/80 block mb-3">
            YOUR NEXT RANK IS WAITING
          </span>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#18332c] dark:text-[#0c0a23] mb-4">
            Think you know AWS?
          </h2>

          <p className="max-w-md mx-auto text-sm sm:text-base leading-relaxed text-[#18332c]/80 dark:text-[#0c0a23]/80 font-medium mb-8">
            Sign in, take the challenge, and put your cloud knowledge on the board.
          </p>

          <Link
            href={destinationLink}
            className="inline-block rounded-full bg-[#18332c] dark:bg-[#2f2891] dark:hover:bg-[#4338c0] px-8 py-4 text-sm font-bold text-white border-2 border-[#18332c] dark:border-[#7c6cff] shadow-[0_5px_0_#0d2923] dark:shadow-[0_5px_0_#1a1060] hover:-translate-y-1 transition-all"
          >
            Enter the quiz arena
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="border-t border-[#dcd5c4]/60 dark:border-[#352f76] px-6 py-8 transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#576b63] dark:text-[#aca8d8]">
          <span>© 2025 CloudQuest Learning</span>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-[#18332c] dark:hover:text-[#f0eeff] transition-colors">
              Leaderboard
            </Link>
            <Link href="/admin/login" className="hover:text-[#18332c] dark:hover:text-[#f0eeff] transition-colors">
              Admin portal
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl text-center pt-4 mt-4 border-t border-[#dcd5c4]/40 dark:border-[#352f76]">
          <p className="text-[11px] font-medium tracking-wide text-[#7e8f88] dark:text-[#aca8d8]">
            Made with <span className="text-[#e65f45] dark:text-[#ff6fb5]">♡</span> by Soumili &amp; Swarnendu
          </p>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 5. FLOATING THEME TOGGLE BUTTON                           */}
      {/* ======================================================== */}
      <ThemeToggle floating />
    </div>
  );
}
