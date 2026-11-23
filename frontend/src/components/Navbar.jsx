'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiAward, FiGrid, FiMenu, FiX, FiCheckSquare } from 'react-icons/fi';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/login'}
            className="flex items-center space-x-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <FiCheckSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuizMaster
              </span>
              {isAdmin && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 -mt-1">
                  Admin Portal
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-2">
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard#quizzes"
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <FiAward className="w-4 h-4" />
                      <span>Leaderboards</span>
                    </Link>
                  </>
                )}
              </nav>

              <div className="h-6 w-px bg-slate-200" />

              {/* User profile & Logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 text-sm font-semibold">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">
                      {user?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{user?.role || 'student'}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 px-2">
                <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{user?.full_name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user?.role} • {user?.email}</div>
                </div>
              </div>

              {isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive('/admin/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard#quizzes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FiAward className="w-4 h-4" />
                    <span>Leaderboards</span>
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
