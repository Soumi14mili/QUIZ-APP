/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#13382e',
          dark: '#0d2923',
          hover: '#1b483e',
          light: '#eef3f0',
        },
        coral: {
          DEFAULT: '#e6674e',
          dark: '#a83a29',
          light: '#fff0ed',
        },
        golden: {
          DEFAULT: '#f6c453',
          hover: '#e5aa47',
        },
        cream: {
          DEFAULT: '#f5f3ec',
          dark: '#eceeea',
        },
        mint: {
          DEFAULT: '#99e2c6',
          dark: '#236653',
          light: '#e8f5ef',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0 #173c34',
        'brutal': '4px 4px 0 #173c34',
        'brutal-lg': '6px 6px 0 #173c34',
        'brutal-xl': '8px 8px 0 #173c34',
        'brutal-2xl': '12px 12px 0 #173c34',
        'brutal-yellow': '10px 10px 0 #f7b955',
        'brutal-btn': '0 5px 0 #a83a29',
        'brutal-dark': '0 6px 0 #0d2923',
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-fast': 'pulseFast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
