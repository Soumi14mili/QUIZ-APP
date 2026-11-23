'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLiveSessions, joinQuizSession, submitQuizAttempt } from '../../../lib/supabase';
import ProtectedRoute from '../../../components/ProtectedRoute';
import QuestionCard from '../../../components/QuestionCard';
import Timer from '../../../components/Timer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiSend,
  FiAlertCircle,
  FiX,
  FiHelpCircle,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function QuizPlayContent() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const router = useRouter();

  // Attempt & Session State
  const [session, setSession] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers map: { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = sessionStorage.getItem(`quiz_answers_${sessionId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const hasAutoSubmittedRef = useRef(false);

  // Cache answers to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      sessionStorage.setItem(`quiz_answers_${sessionId}`, JSON.stringify(answers));
    }
  }, [answers, sessionId]);

  // Load quiz attempt, session, and questions
  useEffect(() => {
    if (!sessionId) return;

    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`quiz_data_${sessionId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSession(parsed.session);
          setAttempt(parsed.attempt);
          setQuestions(parsed.questions || []);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse cached quiz data:', e);
        }
      }
    }

    // Recover or fetch live session details
    const recoverSession = async () => {
      try {
        setLoading(true);
        const list = await getLiveSessions();
        const found = list.find((s) => (s.id || s._id) === sessionId);
        if (found && found.join_code) {
          const joinRes = await joinQuizSession(found.join_code);
          setSession(joinRes.session);
          setAttempt(joinRes.attempt);
          setQuestions(joinRes.questions || []);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              `quiz_data_${sessionId}`,
              JSON.stringify(joinRes)
            );
          }
        } else {
          toast.error('Session not active or join code missing');
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Failed to recover quiz session:', err);
        toast.error('Unable to load quiz session');
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    recoverSession();
  }, [sessionId, router]);

  // Warn user on accidental browser reload/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitting) {
        e.preventDefault();
        e.returnValue = 'You have an active quiz session in progress. Leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting]);

  const handleSelectOption = (optionKey) => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;
    const qId = activeQuestion.id || activeQuestion._id;

    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const submitQuiz = useCallback(async () => {
    if (!attempt || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      const formattedAnswers = questions.map((q) => {
        const qId = q.id || q._id;
        return {
          question_id: qId,
          selected_option: answers[qId] || null,
        };
      });

      const attemptId = attempt.id || attempt._id;
      const res = await submitQuizAttempt(attemptId, formattedAnswers);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`quiz_answers_${sessionId}`);
        sessionStorage.removeItem(`quiz_data_${sessionId}`);
        if (res) {
          sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(res));
        }
      }

      toast.success('Quiz submitted successfully!');
      router.replace(`/results/${attemptId}`);
    } catch (err) {
      console.error('Submit quiz error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Failed to submit quiz';
      toast.error(msg);
      setIsSubmitting(false);
    }
  }, [attempt, questions, answers, sessionId, router, isSubmitting]);

  const handleTimeUp = useCallback(() => {
    if (!hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      toast('Time is up! Submitting your quiz now...', {
        icon: '⏰',
        duration: 4000,
      });
      submitQuiz();
    }
  }, [submitQuiz]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading quiz arena..." />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <FiAlertCircle className="w-12 h-12 text-[#e65f45] mb-3" />
        <h2 className="font-display text-2xl font-bold text-[#173c34]">No questions available</h2>
        <p className="text-sm text-[#173c34]/70 mt-1 mb-6">
          This quiz session does not have any questions yet.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 rounded-full font-bold text-sm text-white bg-[#e65f45] border-2 border-[#173c34] shadow-[0_4px_0_#a83a29]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentQId = currentQ?.id || currentQ?._id;
  const currentSelectedOption = answers[currentQId] || null;

  const answeredCount = Object.keys(answers).filter((k) => !!answers[k]).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const durationMs = (session?.duration_minutes || 15) * 60 * 1000;
  const startedAt = attempt?.started_at || attempt?.created_at || new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#f7f4ec] flex flex-col">
      {/* Sticky Quiz Header & Countdown Timer */}
      <div className="sticky top-0 z-30 bg-[#f7f4ec]/95 backdrop-blur border-b-2 border-[#173c34] shadow-sm py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#173c34] text-white flex items-center justify-center font-display font-bold text-base border-2 border-[#173c34] shadow-[2px_2px_0_#e65f45]">
              Q
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-bold text-[#173c34] line-clamp-1">
                {session?.title || 'Live Quiz'}
              </h1>
              <p className="text-xs text-[#173c34]/70 hidden sm:block">
                Answered <span className="font-bold text-[#173c34]">{answeredCount}</span> of {questions.length} questions ({progressPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Timer durationMs={durationMs} startedAt={startedAt} onTimeUp={handleTimeUp} />

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="hidden sm:inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all flex-shrink-0"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar with Coral fill */}
        <div className="max-w-7xl mx-auto mt-3">
          <div className="w-full h-2.5 bg-[#eef3f0] border border-[#173c34]/30 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#e65f45] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left/Main Column: Question Card & Controls */}
        <div className="lg:col-span-3 space-y-6">
          <QuestionCard
            question={currentQ}
            selectedOption={currentSelectedOption}
            onSelect={handleSelectOption}
            questionNumber={currentIndex + 1}
          />

          {/* Previous / Next Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-xs font-bold font-mono text-[#173c34]/60">
              {currentIndex + 1} / {questions.length}
            </div>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all"
              >
                <span>Submit Quiz</span>
                <FiSend className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-full text-xs font-bold text-white bg-[#173c34] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_4px_0_#0d2923] transition-all"
              >
                <span>Next</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-6 border-2 border-[#173c34] shadow-[8px_8px_0_#173c34] sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#173c34]/10">
              <h2 className="font-display text-sm font-bold text-[#173c34] uppercase tracking-wider">
                Question Matrix
              </h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#b5e7d2] text-[#173c34] border border-[#173c34]">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const qId = q.id || q._id;
                const isAnswered = !!answers[qId];
                const isCurrent = currentIndex === idx;

                let btnStyles = 'bg-[#fdfbf7] text-[#173c34] border-[#d9ded8] hover:border-[#173c34]';
                if (isCurrent) {
                  btnStyles = 'bg-[#f7b955] text-[#173c34] font-black border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]';
                } else if (isAnswered) {
                  btnStyles = 'bg-[#b5e7d2] text-[#173c34] font-bold border-2 border-[#173c34]';
                } else {
                  btnStyles = 'bg-white text-[#173c34] border border-[#173c34]/20';
                }

                return (
                  <button
                    key={qId || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${btnStyles}`}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-[#173c34]/10 space-y-2 text-xs font-medium text-[#173c34]/70">
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#f7b955] border border-[#173c34]" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#b5e7d2] border border-[#173c34]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-white border border-[#173c34]/30" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Mobile / sidebar submit button */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[#e65f45] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all flex items-center justify-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span>Submit Quiz Now</span>
            </button>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#173c34]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f7f4ec] rounded-[2.25rem] max-w-md w-full p-6 sm:p-8 border-3 border-[#173c34] shadow-[12px_12px_0_#173c34] transition-all animate-in fade-in zoom-in-95">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#f7b955] border-2 border-[#173c34] text-[#173c34] flex items-center justify-center mx-auto shadow-[3px_3px_0_#173c34]">
                <FiCheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#173c34]">Ready to Submit?</h3>
              <p className="text-sm text-[#173c34]/80">
                You have answered <span className="font-bold text-[#173c34]">{answeredCount}</span> of{' '}
                <span className="font-bold text-[#173c34]">{questions.length}</span> questions.
              </p>
              {unansweredCount > 0 && (
                <div className="p-3 bg-[#fff0ed] rounded-2xl border-2 border-[#e65f45] text-[#173c34] text-xs font-semibold text-left flex items-start space-x-2">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#e65f45]" />
                  <span>
                    You have <span className="font-bold text-[#e65f45]">{unansweredCount}</span> unanswered question
                    {unansweredCount > 1 ? 's' : ''}. Unanswered questions receive 0 points.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] transition-all"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] hover:-translate-y-0.5 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend className="w-3.5 h-3.5" />
                    <span>Confirm & Finish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <QuizPlayContent />
    </ProtectedRoute>
  );
}
