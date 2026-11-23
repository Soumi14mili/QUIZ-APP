'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiCheckCircle, FiClock, FiAward, FiShield } from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [selectedDemoOption, setSelectedDemoOption] = useState('B');

  const destinationLink = isAuthenticated
    ? (isAdmin ? '/admin/dashboard' : '/dashboard')
    : '/login';

  return (
    <div className="overflow-hidden bg-[#f7f4ec] text-[#172a25]">
      {/* Hero Section */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-32 lg:pt-16">
        <div className="relative z-10">
          <div className="mb-7 inline-flex -rotate-2 items-center gap-2 rounded-full bg-[#f7b955] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.13em] shadow-[3px_3px_0_#173c34]">
            <span className="h-2 w-2 rounded-full bg-[#e65f45]" /> Built for AWS learners
          </div>

          <h1 className="font-display max-w-3xl text-[clamp(4.2rem,8.5vw,7.5rem)] leading-[.85] tracking-[-.065em]">
            Ready. Set.<br />
            <em className="text-[#e65f45] not-italic">Cloud.</em>
          </h1>

          <p className="mt-9 max-w-xl text-lg font-medium leading-relaxed text-[#596b65]">
            The focused quiz arena where students sharpen their skills, race the clock, and rise through the class leaderboard.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={destinationLink}
              className="group flex items-center gap-4 rounded-full bg-[#173c34] py-4 pl-6 pr-4 text-sm font-extrabold text-white shadow-[0_6px_0_#0d2923] transition hover:-translate-y-1 hover:bg-[#225247]"
            >
              <span>{isAuthenticated ? 'Enter dashboard' : 'Start a quiz'}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f7b955] text-[#173c34] transition group-hover:rotate-45">
                <FiArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href={destinationLink}
              className="rounded-full border-2 border-[#173c34] px-6 py-4 text-sm font-extrabold text-[#173c34] transition hover:bg-white hover:shadow-[3px_3px_0_#173c34]"
            >
              View leaderboard
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-5 text-xs font-bold text-[#667770]">
            <div className="flex -space-x-2">
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f7f4ec] text-[10px] text-[#173c34] bg-[#b5e7d2] font-extrabold">
                AM
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f7f4ec] text-[10px] text-[#173c34] bg-[#afc8ff] font-extrabold">
                JL
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f7f4ec] text-[10px] text-[#173c34] bg-[#ffb6aa] font-extrabold">
                SK
              </span>
            </div>
            <span>
              <strong className="block text-sm text-[#173c34]">One shared goal</strong>
              Get AWS exam-ready
            </span>
          </div>
        </div>

        {/* Hero Interactive Card Preview */}
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -left-14 top-14 h-28 w-28 rounded-full border-2 border-[#173c34]/10" />

          {/* Floating Streak Badge */}
          <div className="absolute -right-4 -top-6 z-20 rotate-6 rounded-2xl border-2 border-[#173c34] bg-[#b5e7d2] px-4 py-3 shadow-[4px_4px_0_#173c34]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#173c34]">
              Current streak
            </span>
            <strong className="font-display text-3xl text-[#173c34]">5×</strong>
          </div>

          {/* Question Card Mockup */}
          <div className="relative rotate-1 rounded-[2.25rem] border-2 border-[#173c34] bg-white p-6 shadow-[12px_12px_0_#173c34] sm:p-8">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e8f5ef] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#236653]">
                Cloud concepts · 3/10
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f7b955] font-black text-[#173c34] shadow-[2px_2px_0_#173c34]">
                12
              </span>
            </div>

            <div className="my-6 h-1.5 rounded-full bg-[#eceeea] overflow-hidden">
              <div className="h-full w-[30%] rounded-full bg-[#e65f45]" />
            </div>

            <h2 className="font-display text-[clamp(1.75rem,3.8vw,2.75rem)] leading-[1.08] tracking-[-.04em] text-[#173c34]">
              Which AWS service provides object storage?
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-3">
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
                    className={`rounded-2xl border-2 p-4 text-left text-sm font-extrabold transition ${
                      isSelected
                        ? 'border-[#e65f45] bg-[#fff0ed] text-[#173c34] shadow-[3px_3px_0_#e65f45]'
                        : 'border-[#e1e4df] bg-white text-[#173c34] hover:border-[#173c34]'
                    }`}
                  >
                    <span className="mb-2 block text-[10px] text-[#8a9692]">{opt.key}</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between text-xs font-bold text-[#7b8984]">
              <span>Choose one answer</span>
              <span>00:12</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#173c34] px-5 py-20 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#b5e7d2]">
                One smooth session
              </p>
              <h2 className="font-display mt-3 text-5xl tracking-[-.04em] sm:text-6xl text-white">
                How CloudQuest works
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#b8cec8]">
              No complicated setup. Your instructor prepares the session; you bring your AWS knowledge.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl text-[#173c34] bg-[#b5e7d2] shadow-[3px_3px_0_#0d2923]">
                  <FiShield className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl text-white/15">01</span>
              </div>
              <h3 className="mt-10 text-xl font-extrabold text-white">Sign in securely</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8cec8]">
                Enter with your student account and see every available assessment.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl text-[#173c34] bg-[#f7b955] shadow-[3px_3px_0_#0d2923]">
                  <FiClock className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl text-white/15">02</span>
              </div>
              <h3 className="mt-10 text-xl font-extrabold text-white">Beat the clock</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8cec8]">
                Answer focused AWS questions in a clean, distraction-free session.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl text-[#173c34] bg-[#ffb6aa] shadow-[3px_3px_0_#0d2923]">
                  <FiAward className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl text-white/15">03</span>
              </div>
              <h3 className="mt-10 text-xl font-extrabold text-white">Claim your rank</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b8cec8]">
                Your score and finish time place you on the live class leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-center rounded-[2.5rem] bg-[#f7b955] px-6 py-16 text-center shadow-[8px_8px_0_#173c34] border-2 border-[#173c34]">
          <span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#173c34]">
            Your next rank is waiting
          </span>
          <h2 className="font-display mt-4 text-5xl tracking-[-.04em] text-[#173c34] sm:text-6xl">
            Think you know AWS?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#47564f]">
            Sign in, take the challenge, and put your cloud knowledge on the board.
          </p>
          <Link
            href={destinationLink}
            className="mt-8 rounded-full bg-[#173c34] px-8 py-4 text-sm font-extrabold text-white shadow-[0_5px_0_#0d2923] transition hover:-translate-y-1 hover:bg-[#225247]"
          >
            Enter the quiz arena
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d9ded8] px-5 py-8 sm:px-8 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-xs font-bold text-[#687770] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CloudQuest Learning</span>
          <div className="flex gap-6">
            <Link href={destinationLink} className="hover:text-[#173c34] transition">
              Leaderboard
            </Link>
            <Link href="/admin/login" className="hover:text-[#173c34] transition">
              Admin portal
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl text-center pt-4 mt-4 border-t border-[#d9ded8]/40">
          <p className="text-[11px] font-medium text-[#7e8f88]">
            Made with <span className="text-[#e65f45]">♡</span> by Soumili &amp; Swarnendu
          </p>
        </div>
      </footer>
    </div>
  );
}