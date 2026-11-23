'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  KawaiiCloud,
  KawaiiServerRack,
  KawaiiS3Cup,
  QuestionMarkDoodle,
  SquigglyWave,
  Starburst,
} from '../../components/Caricatures';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { login, register } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, false);
      toast.success('Welcome back to CloudQuest!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      await register(regFullName.trim(), regEmail.trim(), regPassword);
      toast.success('Account created successfully! Welcome to CloudQuest.');
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Failed to create student account';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1.35fr] bg-[#fcf8ed] dark:bg-[#080b16] transition-colors duration-300">
      
      {/* ======================================================== */}
      {/* 1. LEFT BRANDING COLUMN (Deep Royal Indigo in Figma)     */}
      {/* ======================================================== */}
      <section className="relative hidden overflow-hidden bg-[#2f2891] dark:bg-[#1a1654] p-12 lg:p-16 text-white lg:flex lg:flex-col justify-between transition-colors duration-300 bg-dot-pattern-dark">
        {/* Top-Right Decorative Rotating Starburst */}
        <div className="absolute top-10 right-10 opacity-70">
          <Starburst className="w-10 h-10 text-[#5ce1e6]" />
        </div>

        {/* Top Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight z-10 hover:opacity-95 transition">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#5ce1e6] text-[#173c34] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
            </svg>
          </span>
          <span className="text-2xl font-bold font-sans text-white">
            Cloud<span className="text-[#5ce1e6]">Quest</span>
          </span>
        </Link>

        {/* Middle Hero Content with Floating Server Rack Mascot */}
        <div className="my-auto max-w-lg space-y-6 z-10 relative">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm text-white">
            <span className="w-2 h-2 rounded-full bg-[#5ce1e6] animate-pulse" />
            <span className="text-[11px] font-black uppercase font-mono tracking-wider">
              AWS Knowledge Arena
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-display text-5xl sm:text-6xl font-black leading-[1.02] tracking-tight text-white">
            Learn it.<br />
            Prove it.<br />
            <em className="text-[#5ce1e6] not-italic italic font-normal">Lead it.</em>
          </h1>

          {/* Subtext */}
          <p className="max-w-md text-lg text-indigo-100/90 leading-relaxed font-medium">
            Timed challenges, instant results, and one live class leaderboard.
          </p>

          {/* Floating EC2 Server Rack Mascot in Left Column */}
          <div className="pt-2">
            <KawaiiServerRack className="w-24 h-28" isDark={isDark} />
          </div>
        </div>

        {/* Bottom Feature Pills Grid */}
        <div className="grid grid-cols-3 gap-3.5 z-10 pt-6">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 transition hover:bg-white/15">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#5ce1e6]">01</span>
            <strong className="mt-1.5 block text-xs font-bold text-white leading-tight">10 questions</strong>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 transition hover:bg-white/15">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#5ce1e6]">02</span>
            <strong className="mt-1.5 block text-xs font-bold text-white leading-tight">20 minutes</strong>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 transition hover:bg-white/15">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#5ce1e6]">03</span>
            <strong className="mt-1.5 block text-xs font-bold text-white leading-tight">Live ranking</strong>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. RIGHT AUTH COLUMN with FLOATING CARICATURES           */}
      {/* ======================================================== */}
      <section className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-dot-pattern transition-colors duration-300">
        
        {/* Floating Background Mascot Caricatures */}
        {/* Top-Left: Floating Question Mark Doodle */}
        <div className="absolute left-8 top-12 hidden md:block pointer-events-none select-none z-0">
          <QuestionMarkDoodle className="w-12 h-16 text-[#5ce1e6]" />
        </div>

        {/* Top-Right: Smiling Floating Cloud Mascot */}
        <div className="absolute right-6 top-16 hidden sm:block pointer-events-none select-none z-0">
          <KawaiiCloud className="w-28 h-20" isDark={isDark} />
        </div>

        {/* Bottom-Left: Floating Smiling S3 Cup Mascot */}
        <div className="absolute bottom-8 left-6 hidden md:block pointer-events-none select-none z-0">
          <KawaiiS3Cup className="w-20 h-24" isDark={isDark} />
        </div>

        {/* Bottom-Right: Floating Squiggly Wave Doodle */}
        <div className="absolute bottom-10 right-8 hidden md:block pointer-events-none select-none z-0">
          <SquigglyWave className="w-28 h-8 text-[#ff6b8b]" />
        </div>

        {/* Top Header Row with Back link & Theme Switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto z-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[#576b63] dark:text-[#aca8d8] hover:text-[#18332c] dark:hover:text-[#f0eeff] transition"
          >
            ← Back to home
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Center Main Neo-Pop Auth Card */}
        <div className="my-auto py-8 w-full max-w-md mx-auto z-10">
          <div className="rounded-[2.25rem] border-3 border-[#173c34] dark:border-[#232b47] bg-white dark:bg-[#121629] p-7 sm:p-9 shadow-[6px_6px_0px_#173c34] dark:shadow-[6px_6px_0px_#7c6cff] transition-all">
            
            {/* Segmented Control Tab Switcher */}
            <div className="mb-7 flex p-1.5 rounded-2xl bg-[#f4eee0] dark:bg-[#1b223c] border-2 border-[#173c34] dark:border-[#2e3962] gap-1.5 transition-all">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-center text-sm font-extrabold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-[#173c34] dark:bg-[#2e3962] text-white shadow-[2px_2px_0px_#173c34] dark:shadow-none'
                    : 'text-[#173c34] dark:text-[#8b97b8] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-center text-sm font-extrabold transition-all ${
                  activeTab === 'register'
                    ? 'bg-[#173c34] dark:bg-[#2e3962] text-white shadow-[2px_2px_0px_#173c34] dark:shadow-none'
                    : 'text-[#173c34] dark:text-[#8b97b8] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Create account
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <div>
                <h2 className="font-display text-3xl font-black tracking-tight text-[#173c34] dark:text-white">
                  Welcome back.
                </h2>
                <p className="mt-1 text-sm text-[#526b64] dark:text-[#8b97b8]">
                  Pick up your streak where you left off.
                </p>

                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu"
                      className="w-full px-4 py-3 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => toast('Please contact your administrator to reset credentials.')}
                        className="text-xs font-bold text-[#ff6b8b] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-11 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#72807c] dark:text-[#8b97b8] hover:text-[#173c34] dark:hover:text-white"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-3 py-3.5 px-6 rounded-xl font-black text-sm text-[#173c34] dark:text-white bg-[#ff6b8b] dark:bg-[#ff5480] border-2.5 border-[#173c34] dark:border-[#ff6b8b] shadow-[4px_4px_0px_#173c34] dark:shadow-[4px_4px_0px_#1a1060] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Authenticating…' : 'Sign in to quiz'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CREATE ACCOUNT */}
            {activeTab === 'register' && (
              <div>
                <h2 className="font-display text-3xl font-black tracking-tight text-[#173c34] dark:text-white">
                  Join your class.
                </h2>
                <p className="mt-1 text-sm text-[#526b64] dark:text-[#8b97b8]">
                  Create your student profile to start competing.
                </p>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-1.5">
                        Full name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full px-3.5 py-3 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-1.5">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder="ST-2048"
                        className="w-full px-3.5 py-3 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-1.5">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@school.edu"
                      className="w-full px-4 py-3 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] dark:text-[#aca8d8] mb-1.5">
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 pr-11 rounded-xl border-2.5 border-[#173c34] dark:border-[#2f3a60] bg-white dark:bg-[#1c223c] text-sm font-medium text-[#173c34] dark:text-[#f1f3f9] placeholder-[#173c34]/40 dark:placeholder-[#8b97b8]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] dark:focus:ring-[#ff5480] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#72807c] dark:text-[#8b97b8] hover:text-[#173c34] dark:hover:text-white"
                      >
                        {showRegPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-3 py-3.5 px-6 rounded-xl font-black text-sm text-[#173c34] dark:text-white bg-[#ff6b8b] dark:bg-[#ff5480] border-2.5 border-[#173c34] dark:border-[#ff6b8b] shadow-[4px_4px_0px_#173c34] dark:shadow-[4px_4px_0px_#1a1060] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Creating account…' : 'Create student account'}
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Admin Link */}
            <p className="mt-6 text-center text-xs text-[#81908b] dark:text-[#8b97b8]">
              Administrator?{' '}
              <Link href="/admin/login" className="font-black text-[#173c34] dark:text-[#5ce1e6] underline underline-offset-4">
                Use the admin portal
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="w-full text-center text-xs text-[#81908b] dark:text-[#8b97b8] z-10">
          <span>© 2025 CloudQuest · Built for AWS Learners</span>
        </div>

        {/* Floating Theme Toggle */}
        <ThemeToggle floating />
      </section>
    </main>
  );
}
