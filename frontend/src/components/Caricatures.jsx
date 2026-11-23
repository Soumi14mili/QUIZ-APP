'use client';

import React from 'react';

// ==========================================
// Kawaii Hand-Drawn SVG Characters & Doodles
// With smooth floating & bobbing animations
// ==========================================

export function KawaiiCloud({
  className = 'w-24 h-16',
  isDark = false,
  variant = 'classic', // 'classic' | 'professor'
  animate = true,
}) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const sparkleColor = isDark ? '#5CE1E6' : '#F6C453';
  const capColor = isDark ? '#2F2891' : '#18332C';
  const tasselColor = isDark ? '#FF6FB5' : '#E6674E';

  return (
    <div className={`relative inline-block ${animate ? 'animate-float-slow' : ''} ${className}`}>
      <svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm overflow-visible">
        {/* Professor Cap (If variant === 'professor') */}
        {variant === 'professor' && (
          <g className="animate-float-bob">
            {/* Cap Diamond */}
            <path
              d="M38 12 L60 2 L82 12 L60 22 Z"
              fill={capColor}
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Cap Base */}
            <path
              d="M50 18 Q60 24 70 18 V22 Q60 28 50 22 Z"
              fill={capColor}
              stroke={strokeColor}
              strokeWidth="1.8"
            />
            {/* Tassel */}
            <path d="M60 12 Q75 14 78 24" stroke={tasselColor} strokeWidth="2" strokeLinecap="round" />
            <circle cx="78" cy="24" r="2" fill={tasselColor} />
          </g>
        )}

        {/* Cloud Body */}
        <path
          d="M32 64H92C104 64 113 55 113 43C113 32 105 23 94 22C92 10 80 2 66 2C54 2 44 9 40 19C37 18 34 17 31 17C17 17 6 28 6 42C6 54 17 64 32 64Z"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Professor Glasses */}
        {variant === 'professor' ? (
          <g stroke={strokeColor} strokeWidth="2" fill="none">
            <circle cx="48" cy="38" r="7" />
            <circle cx="72" cy="38" r="7" />
            <line x1="55" y1="38" x2="65" y2="38" strokeWidth="2.5" />
            {/* Happy Eyes inside glasses */}
            <path d="M45 37C45 37 48 34 51 37" strokeLinecap="round" strokeWidth="2" />
            <path d="M69 37C69 37 72 34 75 37" strokeLinecap="round" strokeWidth="2" />
          </g>
        ) : (
          /* Classic Happy Curved Eyes */
          <>
            <path d="M44 38C44 38 48 33 52 38" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M68 38C68 38 72 33 76 38" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Little Smile */}
        <path d="M57 44C57 44 60 48 63 44" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Pink Blush Cheeks */}
        <ellipse cx="36" cy="42" rx="4.5" ry="2.5" fill="#FFA59E" />
        <ellipse cx="84" cy="42" rx="4.5" ry="2.5" fill="#FFA59E" />
      </svg>

      {/* Little Star Sparkles floating with the cloud */}
      <span
        className="absolute -top-1 -right-2 text-sm animate-twinkle pointer-events-none select-none"
        style={{ color: sparkleColor }}
      >
        ✦
      </span>
      <span
        className="absolute top-2 -right-4 text-xs animate-twinkle pointer-events-none select-none"
        style={{ color: sparkleColor, animationDelay: '0.8s' }}
      >
        ★
      </span>
    </div>
  );
}

export function KawaiiServerRack({
  className = 'w-14 h-18',
  isDark = false,
  animate = true,
}) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const bottomTierColor = isDark ? '#5CE1E6' : '#F6C453';

  return (
    <div className={`relative inline-block ${animate ? 'animate-float-bob' : ''} ${className}`}>
      <svg viewBox="0 0 70 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Top Tier (Mint / Lavender) */}
        <rect
          x="6"
          y="6"
          width="56"
          height="18"
          rx="7"
          fill={isDark ? '#B9B0FF' : '#99E2C6'}
          stroke={strokeColor}
          strokeWidth="2.5"
        />
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
        <rect
          x="6"
          y="48"
          width="56"
          height="18"
          rx="7"
          fill={bottomTierColor}
          stroke={strokeColor}
          strokeWidth="2.5"
        />
        <line x1="14" y1="57" x2="36" y2="57" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="46" cy="57" r="1.5" fill={strokeColor} />
        <circle cx="53" cy="57" r="1.5" fill={strokeColor} />

        {/* Cute Stick Feet */}
        <line x1="20" y1="67" x2="16" y2="76" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="48" y1="67" x2="52" y2="76" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function KawaiiS3Cup({
  className = 'w-16 h-20',
  isDark = false,
  animate = true,
}) {
  const strokeColor = isDark ? '#7C6CFF' : '#18332C';
  const textColor = isDark ? '#7C6CFF' : '#18332C';

  return (
    <div className={`relative inline-block ${animate ? 'animate-float-reverse' : ''} ${className}`}>
      <svg viewBox="0 0 75 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        {/* Steam floating doodle */}
        <path
          d="M32 10 Q35 4 33 0"
          stroke={isDark ? '#FF6FB5' : '#E6674E'}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d="M42 9 Q45 3 43 -1"
          stroke={isDark ? '#5CE1E6' : '#99E2C6'}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />

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
        <text
          x="37"
          y="66"
          textAnchor="middle"
          fill={textColor}
          fontFamily="sans-serif"
          fontSize="11"
          fontWeight="800"
        >
          S3
        </text>
      </svg>
    </div>
  );
}

export function StarSparkle({
  className = 'w-6 h-6 text-[#99E2C6]',
  animate = true,
}) {
  return (
    <div className={`inline-block ${animate ? 'animate-twinkle' : ''}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
      </svg>
    </div>
  );
}

export function SquiggleOrange({ isDark = false, className = '' }) {
  const strokeColor = isDark ? '#FF6FB5' : '#E6674E';
  return (
    <svg width="90" height="14" viewBox="0 0 90 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2 7C8 2 14 12 20 7C26 2 32 12 38 7C44 2 50 12 56 7C62 2 68 12 74 7C80 2 86 12 88 7"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SquiggleDark({ isDark = false, className = '' }) {
  const strokeColor = isDark ? '#5CE1E6' : '#1E5246';
  return (
    <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2 8C10 2 18 14 26 8C34 2 42 14 50 8C58 2 66 14 74 8C82 2 90 14 98 8C106 2 114 14 118 8"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function QuestionMarkDoodle({
  className = 'w-14 h-20 text-[#5ce1e6]',
  animate = true,
}) {
  return (
    <div className={`inline-block ${animate ? 'animate-float-reverse' : ''} ${className}`}>
      <svg viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        <path
          d="M12 26c0-10 8-18 18-18s18 8 18 18c0 14-16 16-16 26v4"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="76" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function SquigglyWave({
  className = 'w-32 h-10 text-[#5ce1e6]',
  animate = true,
}) {
  return (
    <div className={`inline-block ${animate ? 'animate-float-sway' : ''} ${className}`}>
      <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M10 20 Q 30 5, 50 20 T 90 20 T 130 20 T 150 20"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function Starburst({
  className = 'w-8 h-8 text-[#5ce1e6]',
}) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={`animate-spin-slow ${className}`}>
      <circle cx="20" cy="20" r="3" />
      <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8.7" y1="8.7" x2="31.3" y2="31.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8.7" y1="31.3" x2="31.3" y2="8.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
