'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide Navbar completely on the full-screen quiz play page
  if (pathname?.startsWith('/quiz/')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    if (isAdmin) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 transition-colors duration-300">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight transition hover:opacity-95">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#18332c] dark:bg-[#5ce1e6] text-white dark:text-[#1a1644] shadow-[2px_2px_0_#0d2923] dark:shadow-[2px_2px_0_#7c6cff] transition-all">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
        </span>
        <span className="text-xl font-bold font-sans text-[#18332c] dark:text-[#f0eeff]">
          Cloud<span className="text-[#e6674e] dark:text-[#ff6fb5]">Quest</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 text-sm font-semibold md:flex text-[#576b63] dark:text-[#aca8d8]">
        <Link className="transition hover:text-[#18332c] dark:hover:text-[#f0eeff]" href="/#how-it-works">
          How it works
        </Link>
        <Link className="transition hover:text-[#18332c] dark:hover:text-[#f0eeff]" href="/#leaderboard">
          Leaderboard
        </Link>
        {isAuthenticated && !isAdmin && (
          <Link
            className={`transition hover:text-[#e6674e] dark:hover:text-[#ff6fb5] ${isActive('/dashboard') ? 'text-[#e6674e] dark:text-[#ff6fb5]' : ''}`}
            href="/dashboard"
          >
            Dashboard
          </Link>
        )}
        {isAuthenticated && isAdmin && (
          <Link
            className={`transition hover:text-[#e6674e] dark:hover:text-[#ff6fb5] ${isActive('/admin/dashboard') ? 'text-[#e6674e] dark:text-[#ff6fb5]' : ''}`}
            href="/admin/dashboard"
          >
            Instructor Portal
          </Link>
        )}
        {!isAdmin && (
          <Link className="transition hover:text-[#18332c] dark:hover:text-[#f0eeff]" href="/admin/login">
            For admins
          </Link>
        )}
      </nav>

      {/* Action / Auth Buttons + Theme Toggle */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border-2 border-[#18332c] dark:border-[#7c6cff] bg-white dark:bg-[#1a1644] px-3.5 py-1.5 shadow-[2px_2px_0_#18332c] dark:shadow-[2px_2px_0_#7c6cff]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f6c453] dark:bg-[#5ce1e6] text-xs font-black text-[#18332c]">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="text-xs font-bold text-[#18332c] dark:text-[#f0eeff]">{user?.full_name}</span>
              <span className="rounded-full bg-[#e8f5ef] dark:bg-[#29246b] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#236653] dark:text-[#b9b0ff]">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border-2 border-[#18332c] dark:border-[#7c6cff] bg-white dark:bg-[#1a1644] px-4 py-2 text-xs font-bold text-[#576b63] dark:text-[#aca8d8] transition hover:bg-[#fff0ed] hover:text-[#e6674e] dark:hover:text-[#ff6fb5]"
            >
              <FiLogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#18332c] dark:bg-[#2f2891] px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#244b41] dark:hover:bg-[#4338c0] shadow-[0_4px_0_#0d2923] dark:shadow-[0_4px_0_#1a1060]"
            >
              Student login
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-[#d9ded8] bg-white p-2 text-[#173c34] hover:bg-[#f7f4ec] transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 z-50 rounded-2xl border-2 border-[#173c34] bg-white p-5 shadow-[6px_6px_0_#173c34] md:hidden">
          <div className="flex flex-col gap-3 font-bold text-sm text-[#173c34]">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#e65f45]"
            >
              How it works
            </Link>
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:text-[#e65f45]"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:text-[#e65f45]"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="pt-3 border-t border-[#d9ded8] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#687671]">{user?.full_name} ({user?.role})</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#e65f45]"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-[#173c34] py-3 text-center text-sm font-extrabold text-white"
                >
                  Student login
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#d9ded8] py-2.5 text-center text-sm font-bold text-[#173c34]"
                >
                  Admin portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
