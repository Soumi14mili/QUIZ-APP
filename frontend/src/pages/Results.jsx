import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FiAward,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiBarChart2,
  FiCheck,
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

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [resultData, setResultData] = useState(() => {
    if (location.state?.result) {
      sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(location.state.result));
      return location.state.result;
    }
    try {
      const cached = sessionStorage.getItem(`quiz_result_${attemptId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!resultData);

  useEffect(() => {
    if (!resultData) {
      const fetchResult = async () => {
        try {
          setLoading(true);
          // Try fetching attempt details if endpoint exists
          const res = await api.get(`/quiz/attempts/${attemptId}`);
          const data = res.data.attempt || res.data;
          setResultData(data);
          sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(data));
        } catch (err) {
          console.error('Failed to load result from server:', err);
          // If direct endpoint isn't available, notify user
          toast.error('Unable to fetch detailed attempt summary');
        } finally {
          setLoading(false);
        }
      };

      fetchResult();
    }
  }, [attemptId, resultData]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your quiz results..." />;
  }

  if (!resultData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FiBarChart2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Result Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested attempt result could not be found or has expired.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
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

  // Performance message
  let performanceTitle = 'Good Effort!';
  let performanceColor = 'text-indigo-600';
  let badgeBg = 'bg-indigo-50 border-indigo-200';

  if (percentage >= 90) {
    performanceTitle = 'Outstanding Performance! 🏆';
    performanceColor = 'text-emerald-600';
    badgeBg = 'bg-emerald-50 border-emerald-200';
  } else if (percentage >= 80) {
    performanceTitle = 'Excellent Job! 🌟';
    performanceColor = 'text-indigo-600';
    badgeBg = 'bg-indigo-50 border-indigo-200';
  } else if (percentage >= 60) {
    performanceTitle = 'Good Effort! 👍';
    performanceColor = 'text-blue-600';
    badgeBg = 'bg-blue-50 border-blue-200';
  } else if (percentage >= 40) {
    performanceTitle = 'Keep Practicing! 📚';
    performanceColor = 'text-amber-600';
    badgeBg = 'bg-amber-50 border-amber-200';
  } else {
    performanceTitle = 'Needs Improvement! 💪';
    performanceColor = 'text-rose-600';
    badgeBg = 'bg-rose-50 border-rose-200';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Banner / Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100 space-y-8">
        <div className="text-center space-y-3">
          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeBg} ${performanceColor}`}
          >
            {performanceTitle}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quiz Completed!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Here is a comprehensive breakdown of your responses and overall performance.
          </p>
        </div>

        {/* Main Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Score card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-indigo-100 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Total Score
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold mt-1">
              {score} <span className="text-2xl font-normal opacity-80">/ {totalQuestions}</span>
            </div>
            <span className="text-xs font-semibold text-indigo-200 mt-1">
              {percentage}% accuracy rate
            </span>
          </div>

          {/* Time Taken */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-1">
              <FiClock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Time Taken
            </span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1 font-mono">
              {timeTakenFormatted}
            </div>
            <span className="text-xs text-slate-400 mt-1">MM:SS elapsed</span>
          </div>

          {/* Correct vs Incorrect */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Answer Breakdown
            </span>
            <div className="flex items-center justify-center space-x-6 mt-3">
              <div className="flex items-center space-x-1.5 text-emerald-600">
                <FiCheckCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-rose-500">
                <FiXCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">{Math.max(0, totalQuestions - score)}</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-2">Correct vs Incorrect</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          {sessionId && (
            <button
              onClick={() => navigate(`/leaderboard/${sessionId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <FiAward className="w-4 h-4" />
              <span>View Leaderboard</span>
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Question Breakdown Section */}
      {breakdown.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Detailed Answer Key</h2>
              <p className="text-xs text-slate-500">
                Review which answers you chose and verify the correct solutions
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {breakdown.length} Questions
            </span>
          </div>

          <div className="space-y-4">
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
};

export default Results;
