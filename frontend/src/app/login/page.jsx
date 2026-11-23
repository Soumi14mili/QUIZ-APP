'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, false);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-80px)] bg-[#f7f4ec] lg:grid-cols-[.9fr_1.1fr]">
      {/* Left Column (Figma Branding Banner) */}
      <section className="relative hidden overflow-hidden bg-[#173c34] p-12 text-white lg:flex lg:flex-col justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-0.04em]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7b955] text-[#101f1b] shadow-[2px_2px_0_#0d2923]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h3v3h-3v-3Zm5 0h2v7h-7v-2h5v-5Zm-5 5h3v2h-3v-2Z" />
            </svg>
          </span>
          <span className="text-xl">
            Cloud<span className="text-[#f7b955]">Quest</span>
          </span>
        </Link>

        <div className="my-auto max-w-lg">
          <span className="mb-6 inline-flex rounded-full border border-white/20 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#b5e7d2]">
            AWS Knowledge Arena
          </span>
          <h2 className="font-display text-6xl leading-[.98] tracking-[-0.04em]">
            Learn it.<br />
            Prove it.<br />
            <em className="text-[#f7b955] not-italic">Lead it.</em>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-relaxed text-[#c3d6d0]">
            Timed challenges, instant results, and one live class leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8db2a8]">01</span>
            <strong className="mt-2 block text-xs">Timed questions</strong>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8db2a8]">02</span>
            <strong className="mt-2 block text-xs">Live scoring</strong>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8db2a8]">03</span>
            <strong className="mt-2 block text-xs">Class ranking</strong>
          </div>
        </div>
      </section>

      {/* Right Column (Form) */}
      <section className="flex flex-col p-5 sm:p-8">
        <div className="flex justify-between items-center lg:justify-end">
          <span className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-[#173c34]">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#173c34] text-[#f7b955]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h3v3h-3v-3Zm5 0h2v7h-7v-2h5v-5Zm-5 5h3v2h-3v-2Z" />
                </svg>
              </span>
              <span className="text-lg">Cloud<span className="text-[#e65f45]">Quest</span></span>
            </Link>
          </span>
          <Link href="/" className="text-sm font-bold text-[#5e6f69] hover:text-[#173c34] transition">
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md rounded-[2rem] border border-[#dfe3df] bg-white p-7 shadow-[0_24px_80px_rgba(23,60,52,.12)] sm:p-9">
            {/* Tab switch */}
            <div className="mb-8 flex rounded-xl bg-[#f1f4f1] p-1">
              <span className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-extrabold capitalize bg-white text-[#173c34] shadow-sm cursor-default">
                Sign in
              </span>
              <Link
                href="/register"
                className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-extrabold capitalize text-[#72807c] hover:text-[#173c34] transition"
              >
                Create account
              </Link>
            </div>

            <h1 className="font-display text-4xl tracking-[-0.04em] text-[#173c34]">
              Welcome back.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#687671]">
              Enter your credentials to access your quiz dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block text-xs font-extrabold text-[#334d46]">
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="mt-2 w-full rounded-xl border border-[#d8dedb] bg-[#fbfcfa] px-4 py-3 text-sm font-medium outline-none transition placeholder:text-[#a1aaa7] focus:border-[#173c34] focus:ring-3 focus:ring-[#b5e7d2]/50 text-[#173c34]"
                />
              </label>

              <label className="block text-xs font-extrabold text-[#334d46]">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-[#d8dedb] bg-[#fbfcfa] px-4 py-3 text-sm font-medium outline-none transition placeholder:text-[#a1aaa7] focus:border-[#173c34] focus:ring-3 focus:ring-[#b5e7d2]/50 text-[#173c34] pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#72807c] hover:text-[#173c34]"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 rounded-xl bg-[#e65f45] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_5px_0_#a83a29] transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Please wait…' : 'Continue to dashboard'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#81908b]">
              Administrator?{' '}
              <Link href="/admin/login" className="font-bold text-[#173c34] underline underline-offset-4">
                Use the admin portal
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}