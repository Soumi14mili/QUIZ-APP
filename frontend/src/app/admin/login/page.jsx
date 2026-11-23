'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter administrator credentials');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, true);
      toast.success('Admin authentication verified');
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Invalid administrator credentials';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#eef3f0] dark:bg-[#0c0a23] px-5 py-8 text-[#173c34] dark:text-[#f0eeff] transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-0.04em]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173c34] dark:bg-[#5ce1e6] text-[#f7b955] dark:text-[#0c0a23] shadow-[2px_2px_0_#0d2923] dark:shadow-[2px_2px_0_#7c6cff]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h3v3h-3v-3Zm5 0h2v7h-7v-2h5v-5Zm-5 5h3v2h-3v-2Z" />
              </svg>
            </span>
            <span className="text-xl text-[#173c34] dark:text-[#f0eeff]">
              Cloud<span className="text-[#e65f45] dark:text-[#ff6fb5]">Quest</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm font-bold text-[#5f716b] dark:text-[#aca8d8] hover:text-[#173c34] dark:hover:text-[#f0eeff] transition">
            Student login →
          </Link>
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-2">
          {/* Left Hero */}
          <section>
            <span className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e65f45] dark:text-[#ff6fb5]">
              Instructor workspace
            </span>
            <h1 className="font-display mt-5 text-6xl leading-[.95] tracking-[-0.045em] sm:text-7xl text-[#173c34] dark:text-[#f0eeff]">
              Run every quiz<br />
              <em className="text-[#e65f45] dark:text-[#ff6fb5] not-italic">with confidence.</em>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-[#5f716b] dark:text-[#aca8d8]">
              Create question banks, schedule assessments, manage students, and review performance from one protected workspace.
            </p>
          </section>

          {/* Right Card */}
          <section className="rounded-[2rem] bg-[#173c34] dark:bg-[#1a1644] p-7 text-white shadow-[10px_10px_0_#f7b955] dark:shadow-[10px_10px_0_#7c6cff] sm:p-10 border-2 border-[#173c34] dark:border-[#7c6cff] transition-all">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f7b955] dark:bg-[#5ce1e6] text-[#173c34] dark:text-[#0c0a23] shadow-[3px_3px_0_#0d2923] dark:shadow-[3px_3px_0_#1a1060]">
              <FiShield className="h-7 w-7" />
            </div>

            <h2 className="font-display mt-7 text-4xl text-white">Admin access</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#bad0ca] dark:text-[#aca8d8]">
              Administrator accounts are separate from student accounts and use the secured instructor workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block text-xs font-extrabold text-[#b5e7d2] dark:text-[#5ce1e6]">
                Admin email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cloudquest.com"
                  className="mt-2 w-full rounded-xl border border-white/20 dark:border-[#7c6cff]/40 bg-white/10 dark:bg-[#221d57] px-4 py-3.5 text-sm font-medium text-white outline-none transition placeholder:text-white/40 dark:placeholder-[#aca8d8]/50 focus:border-[#f7b955] dark:focus:border-[#5ce1e6] focus:bg-white/15"
                />
              </label>

              <label className="block text-xs font-extrabold text-[#b5e7d2] dark:text-[#5ce1e6]">
                Admin password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/20 dark:border-[#7c6cff]/40 bg-white/10 dark:bg-[#221d57] px-4 py-3.5 text-sm font-medium text-white outline-none transition placeholder:text-white/40 dark:placeholder-[#aca8d8]/50 focus:border-[#f7b955] dark:focus:border-[#5ce1e6] focus:bg-white/15 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/60 hover:text-white"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-between rounded-xl bg-white dark:bg-[#5ce1e6] px-5 py-4 text-sm font-extrabold text-[#173c34] dark:text-[#0c0a23] transition hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_0_#d9ded8] dark:shadow-[0_4px_0_#1a1060] disabled:opacity-60"
              >
                <span>{submitting ? 'Authenticating…' : 'Open admin workspace'}</span>
                <FiArrowRight className="h-5 w-5" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[#87a59d] dark:text-[#aca8d8]">
              New administrator?{' '}
              <Link href="/admin/register" className="font-bold text-[#f7b955] dark:text-[#5ce1e6] underline underline-offset-4">
                Register admin profile
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}