'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAdmin } from '../../../lib/supabase';
import { FiShield, FiEye, FiEyeOff, FiArrowRight, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !secretKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const res = await signUpAdmin(email.trim(), password, fullName.trim(), secretKey.trim());
      if (res?.session) {
        toast.success('Admin account created successfully!');
        router.push('/admin/dashboard');
      } else {
        toast.success('Admin account created! Check email to confirm registration before logging in.', {
          duration: 6000,
        });
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Admin registration error:', err);
      const msg = err.message || 'Failed to create administrator account';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#eef3f0] px-5 py-8 text-[#173c34]">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-0.04em]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173c34] text-[#f7b955] shadow-[2px_2px_0_#0d2923]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h3v3h-3v-3Zm5 0h2v7h-7v-2h5v-5Zm-5 5h3v2h-3v-2Z" />
              </svg>
            </span>
            <span className="text-xl">
              Cloud<span className="text-[#e65f45]">Quest</span>
            </span>
          </Link>
          <Link href="/admin/login" className="text-sm font-bold text-[#5f716b] hover:text-[#173c34] transition">
            Admin Sign In →
          </Link>
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-2">
          {/* Left Hero */}
          <section>
            <span className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e65f45]">
              Privileged setup
            </span>
            <h1 className="font-display mt-5 text-6xl leading-[.95] tracking-[-0.045em] sm:text-7xl text-[#173c34]">
              Create instructor<br />
              <em className="text-[#e65f45] not-italic">account.</em>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-[#5f716b]">
              Register an administrator profile to create quizzes, manage questions, and oversee student rankings. Requires your institution's Admin Secret Key.
            </p>
          </section>

          {/* Right Card */}
          <section className="rounded-[2rem] bg-[#173c34] p-7 text-white shadow-[10px_10px_0_#f7b955] sm:p-10 border-2 border-[#173c34]">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f7b955] text-[#173c34] shadow-[3px_3px_0_#0d2923]">
              <FiShield className="h-7 w-7" />
            </div>

            <h2 className="font-display mt-7 text-3xl sm:text-4xl text-white">Register Admin</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#bad0ca]">
              Enter your credentials and the Admin Secret Key.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-3.5">
              <label className="block text-xs font-extrabold text-[#b5e7d2]">
                Full name
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prof. Jane Doe"
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#f7b955] focus:bg-white/15"
                />
              </label>

              <label className="block text-xs font-extrabold text-[#b5e7d2]">
                Admin email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instructor@cloudquest.com"
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#f7b955] focus:bg-white/15"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-extrabold text-[#b5e7d2]">
                  Password
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#f7b955] focus:bg-white/15 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </label>

                <label className="block text-xs font-extrabold text-[#b5e7d2]">
                  Confirm password
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#f7b955] focus:bg-white/15"
                  />
                </label>
              </div>

              <label className="block text-xs font-extrabold text-[#f7b955]">
                <span className="flex items-center gap-1.5">
                  <FiKey className="w-3.5 h-3.5" />
                  <span>Admin Secret Key</span>
                </span>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="mt-1.5 w-full rounded-xl border border-[#f7b955]/50 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#f7b955] focus:ring-1 focus:ring-[#f7b955]"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#173c34] transition hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_0_#d9ded8] disabled:opacity-60"
              >
                <span>{submitting ? 'Registering…' : 'Create Admin Account'}</span>
                <FiArrowRight className="h-5 w-5" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[#87a59d]">
              Already an administrator?{' '}
              <Link href="/admin/login" className="font-bold text-[#f7b955] underline underline-offset-4">
                Sign in to admin workspace
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

