import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiSend,
  FiAlertCircle,
  FiX,
  FiHelpCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const QuizPlay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Attempt & Session State
  const [session, setSession] = useState(location.state?.session || null);
  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [loading, setLoading] = useState(!location.state?.questions);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers map: { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState(() => {
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

  // Cache attempt and session data in sessionStorage
  useEffect(() => {
    if (session && attempt && questions.length > 0) {
      sessionStorage.setItem(
        `quiz_data_${sessionId}`,
        JSON.stringify({ session, attempt, questions })
      );
    }
  }, [session, attempt, questions, sessionId]);

  // Persist answers
  useEffect(() => {
    sessionStorage.setItem(`quiz_answers_${sessionId}`, JSON.stringify(answers));
  }, [answers, sessionId]);

  // If page was loaded directly without location.state, recover from storage or fetch
  useEffect(() => {
    if (!session || !attempt || questions.length === 0) {
      const cached = sessionStorage.getItem(`quiz_data_${sessionId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSession(parsed.session);
          setAttempt(parsed.attempt);
          setQuestions(parsed.questions);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse cached quiz data:', e);
        }
      }

      // If not cached, attempt to query live session details
      const recoverSession = async () => {
        try {
          setLoading(true);
          const res = await api.get('/quiz/sessions');
          const list = Array.isArray(res.data) ? res.data : res.data.sessions || [];
          const found = list.find((s) => (s.id || s._id) === sessionId);
          if (found && found.join_code) {
            const joinRes = await api.post('/quiz/sessions/join', {
              join_code: found.join_code,
            });
            setSession(joinRes.data.session);
            setAttempt(joinRes.data.attempt);
            setQuestions(joinRes.data.questions || []);
          } else {
            toast.error('Session not active or join code missing');
            navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error('Session recovery failed:', err);
          toast.error('Unable to load quiz session');
          navigate('/dashboard', { replace: true });
        } finally {
          setLoading(false);
        }
      };

      recoverSession();
    }
  }, [sessionId, session, attempt, questions.length, navigate]);

  // Warn before leaving page during active quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active quiz in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSelectOption = (optionKey) => {
    const currentQ = questions[currentIndex];
    const qId = currentQ?.id || currentQ?._id;
    if (!qId) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const submitQuiz = useCallback(async () => {
    const attemptId = attempt?.id || attempt?._id;
    if (!attemptId) {
      toast.error('Missing attempt ID. Cannot submit quiz.');
      return;
    }

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // Build payload matching { answers: [{ question_id, selected_option }] }
      const answersPayload = questions.map((q) => {
        const qId = q.id || q._id;
        return {
          question_id: qId,
          selected_option: answers[qId] || null,
        };
      });

      const res = await api.post(`/quiz/attempts/${attemptId}/submit`, {
        answers: answersPayload,
      });

      // Clear storage for this session
      sessionStorage.removeItem(`quiz_answers_${sessionId}`);
      sessionStorage.removeItem(`quiz_data_${sessionId}`);

      toast.success('Quiz submitted successfully!');
      navigate(`/results/${attemptId}`, {
        replace: true,
        state: { result: res.data },
      });
    } catch (err) {
      console.error('Submit quiz error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit quiz';
      toast.error(msg);
      setIsSubmitting(false);
    }
  }, [attempt, questions, answers, sessionId, navigate]);

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
    return <LoadingSpinner fullScreen message="Loading quiz questions..." />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <FiAlertCircle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No questions available</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          This quiz session does not have any questions yet.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700"
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

  // Calculate timer values
  const durationMs = (session?.duration_minutes || 15) * 60 * 1000;
  const startedAt = attempt?.started_at || attempt?.created_at || new Date().toISOString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Quiz Header & Countdown Timer */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              Q
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                {session?.title || 'Live Quiz'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Answered {answeredCount} of {questions.length} questions ({progressPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Timer durationMs={durationMs} startedAt={startedAt} onTimeUp={handleTimeUp} />

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all flex-shrink-0"
            >
              <FiSend className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-2.5">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
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
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-xs font-semibold text-slate-400">
              {currentIndex + 1} / {questions.length}
            </div>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
              >
                <span>Submit Quiz</span>
                <FiSend className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
              >
                <span>Next</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Question Navigator
              </h2>
              <span className="text-xs font-semibold text-indigo-600">
                {answeredCount}/{questions.length} Done
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const qId = q.id || q._id;
                const isAnswered = !!answers[qId];
                const isCurrent = currentIndex === idx;

                let btnStyles = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
                if (isCurrent) {
                  btnStyles = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-600 ring-offset-2';
                } else if (isAnswered) {
                  btnStyles = 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold';
                }

                return (
                  <button
                    key={qId || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-sm border flex items-center justify-center transition-all ${btnStyles}`}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-indigo-600 ring-1 ring-indigo-600 ring-offset-1" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Mobile / sidebar submit button */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span>Submit Quiz Now</span>
            </button>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl transition-all animate-in fade-in zoom-in-95">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Submit Quiz?</h3>
              <p className="text-sm text-slate-600">
                You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
                <span className="font-bold text-slate-900">{questions.length}</span> questions.
              </p>
              {unansweredCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-medium text-left flex items-start space-x-2">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    You have <span className="font-bold">{unansweredCount}</span> unanswered question
                    {unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive zero points.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlay;
