'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAttemptResult } from '../../../lib/supabase';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ResultCard from '../../../components/ResultCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {
  FiAward,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiBarChart2,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper to format time_taken_ms as mm:ss
const formatTimeTaken = (ms) => {
  if (ms === null || ms === undefined) return '00:00';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function ResultsContent() {
  const params = useParams();
  const attemptId = params?.attemptId;
  const router = useRouter();

  const [resultData, setResultData] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(`quiz_result_${attemptId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!resultData);

  useEffect(() => {
    if (!attemptId) return;

    if (!resultData) {
      const fetchResult = async () => {
        try {
          setLoading(true);
          const data = await getAttemptResult(attemptId);
          setResultData(data);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(data));
          }
        } catch (err) {
          console.error('Failed to load result from server:', err);
          toast.error('Unable to fetch detailed attempt summary');
        } finally {
          setLoading(false);
        }
      };

      fetchResult();
    }
  }, [attemptId, resultData]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading quiz performance summary..." />;
  }

  if (!resultData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#ffb6aa] border-2 border-[#173c34] flex items-center justify-center mx-auto text-[#173c34] shadow-[3px_3px_0_#173c34]">
          <FiBarChart2 className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#173c34]">Result Not Found</h2>
        <p className="text-sm text-[#173c34]/70">
          The requested attempt result could not be found or has expired.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] border-2 border-[#173c34] shadow-[0_4px_0_#a83a29]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = resultData.score || 0;
  const totalQuestions = resultData.total_questions || (resultData.breakdown ? resultData.breakdown.length : 0) || 1;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeTakenFormatted = formatTimeTaken(resultData.time_taken_ms);
  const breakdown = resultData.breakdown || [];
  const sessionId = resultData.session_id || resultData.session?.id || resultData.sessionId;

  // Performance badges
  let performanceTitle = 'Good Effort!';
  let badgeBg = 'bg-[#f7b955]';

  if (percentage >= 90) {
    performanceTitle = 'Outstanding Performance! 🏆';
    badgeBg = 'bg-[#b5e7d2]';
  } else if (percentage >= 80) {
    performanceTitle = 'Excellent Job! 🌟';
    badgeBg = 'bg-[#b5e7d2]';
  } else if (percentage >= 60) {
    performanceTitle = 'Good Effort! 👍';
    badgeBg = 'bg-[#f7b955]';
  } else if (percentage >= 40) {
    performanceTitle = 'Keep Practicing! 📚';
    badgeBg = 'bg-[#ffb6aa]';
  } else {
    performanceTitle = 'Needs Improvement! 💪';
    badgeBg = 'bg-[#ffb6aa]';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Banner / Score Card */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-3 border-[#173c34] shadow-[10px_10px_0_#173c34] space-y-8">
        <div className="text-center space-y-3">
          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#173c34] ${badgeBg} text-[#173c34] shadow-[2px_2px_0_#173c34]`}
          >
            {performanceTitle}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[#173c34] tracking-tight">
            Quiz Completed!
          </h1>
          <p className="text-sm text-[#173c34]/70 max-w-md mx-auto">
            Here is a comprehensive breakdown of your cloud architecture knowledge and score.
          </p>
        </div>

        {/* Main Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Score card */}
          <div className="bg-[#f7b955] text-[#173c34] rounded-2xl p-6 text-center border-2 border-[#173c34] shadow-[4px_4px_0_#173c34] flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-80">
              Total Score
            </span>
            <div className="font-display text-4xl sm:text-5xl font-bold mt-1">
              {score} <span className="text-2xl font-normal opacity-75">/ {totalQuestions}</span>
            </div>
            <span className="text-xs font-bold mt-1">
              {percentage}% accuracy rate
            </span>
          </div>

          {/* Time Taken */}
          <div className="bg-[#eef3f0] border-2 border-[#173c34] text-[#173c34] rounded-2xl p-6 text-center shadow-[4px_4px_0_#173c34] flex flex-col justify-center">
            <div className="w-8 h-8 rounded-full bg-white border border-[#173c34] text-[#173c34] flex items-center justify-center mx-auto mb-1">
              <FiClock className="w-4 h-4 text-[#e65f45]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider opacity-80">
              Time Taken
            </span>
            <div className="font-display text-3xl sm:text-4xl font-bold mt-1">
              {timeTakenFormatted}
            </div>
            <span className="text-xs opacity-75 mt-1">MM:SS elapsed</span>
          </div>

          {/* Correct vs Incorrect */}
          <div className="bg-[#fdfbf7] border-2 border-[#173c34] text-[#173c34] rounded-2xl p-6 text-center shadow-[4px_4px_0_#173c34] flex flex-col justify-center">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-80">
              Breakdown
            </span>
            <div className="flex items-center justify-center space-x-6 mt-3">
              <div className="flex items-center space-x-1.5 text-[#236653]">
                <FiCheckCircle className="w-5 h-5" />
                <span className="font-display text-2xl font-bold">{score}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#e65f45]">
                <FiXCircle className="w-5 h-5" />
                <span className="font-display text-2xl font-bold">{Math.max(0, totalQuestions - score)}</span>
              </div>
            </div>
            <span className="text-xs opacity-75 mt-2">Correct vs Incorrect</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t-2 border-[#173c34]/10 flex flex-col sm:flex-row items-center justify-center gap-3">
          {sessionId && (
            <button
              onClick={() => router.push(`/leaderboard/${sessionId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full text-xs font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all"
            >
              <FiAward className="w-4 h-4" />
              <span>View Leaderboard</span>
            </button>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Question Breakdown Section */}
      {breakdown.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#173c34]/15">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#173c34]">Detailed Answer Key</h2>
              <p className="text-xs text-[#173c34]/70">
                Review your answers alongside the verified correct solutions
              </p>
            </div>
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-[#f7b955] text-[#173c34] border border-[#173c34] shadow-[2px_2px_0_#173c34]">
              {breakdown.length} Questions
            </span>
          </div>

          <div className="space-y-5">
            {breakdown.map((item, index) => {
              const questionObj = item.question || item;
              const isCorrect = Boolean(
                item.is_correct !== undefined
                  ? item.is_correct
                  : item.selected_option === item.correct_option
              );

              return (
                <ResultCard
                  key={item.question_id || index}
                  question={questionObj}
                  selectedOption={item.selected_option}
                  correctOption={item.correct_option}
                  isCorrect={isCorrect}
                  questionNumber={index + 1}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ResultsContent />
    </ProtectedRoute>
  );
}
