'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
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
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 border-b border-[#d9ded8]/70">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-0.04em] transition hover:opacity-95">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173c34] text-[#f7b955] shadow-[2px_2px_0_#0d2923]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h3v3h-3v-3Zm5 0h2v7h-7v-2h5v-5Zm-5 5h3v2h-3v-2Z" />
          </svg>
        </span>
        <span className="text-xl text-[#173c34]">
          Cloud<span className="text-[#e65f45]">Quest</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 text-sm font-bold md:flex text-[#173c34]">
        <Link className="transition hover:text-[#e65f45]" href="/#how-it-works">
          How it works
        </Link>
        {isAuthenticated && !isAdmin && (
          <Link
            className={`transition hover:text-[#e65f45] ${isActive('/dashboard') ? 'text-[#e65f45]' : ''}`}
            href="/dashboard"
          >
            Dashboard
          </Link>
        )}
        {isAuthenticated && isAdmin && (
          <Link
            className={`transition hover:text-[#e65f45] ${isActive('/admin/dashboard') ? 'text-[#e65f45]' : ''}`}
            href="/admin/dashboard"
          >
            Instructor Portal
          </Link>
        )}
        {!isAdmin && (
          <Link className="transition hover:text-[#e65f45]" href="/admin/login">
            For admins
          </Link>
        )}
      </nav>

      {/* Action / Auth Buttons */}
      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-[#d9ded8] bg-white px-3.5 py-1.5 shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f7b955] text-xs font-black text-[#173c34]">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="text-xs font-bold text-[#173c34]">{user?.full_name}</span>
              <span className="rounded-full bg-[#e8f5ef] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#236653]">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-[#d9ded8] bg-white px-4 py-2 text-xs font-bold text-[#687671] transition hover:border-[#e65f45] hover:text-[#e65f45]"
            >
              <FiLogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#173c34] px-5 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#225247] shadow-[0_4px_0_#0d2923]"
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
