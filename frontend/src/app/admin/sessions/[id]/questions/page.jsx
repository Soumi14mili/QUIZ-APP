'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, getSessionQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../../../../lib/supabase';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiHelpCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function QuestionManagerContent() {
  const params = useParams();
  const sessionId = params?.id;
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Question form fields
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  const fetchSessionAndQuestions = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const [{ data: sessionData, error: sErr }, qList] = await Promise.all([
        supabase.from('quiz_sessions').select('*').eq('id', sessionId).single(),
        getSessionQuestions(sessionId),
      ]);

      if (sErr) throw sErr;
      setSession(sessionData);
      setQuestions(qList || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
      toast.error('Failed to load session details and questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndQuestions();
  }, [sessionId]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionText(q.question_text || '');
    setOptionA(q.option_a || '');
    setOptionB(q.option_b || '');
    setOptionC(q.option_c || '');
    setOptionD(q.option_d || '');
    setCorrectOption(q.correct_option || 'A');
    setIsModalOpen(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      toast.success('Question removed');
      setQuestions((prev) => prev.filter((q) => (q.id || q._id) !== questionId));
    } catch (err) {
      console.error('Failed to delete question:', err);
      toast.error('Failed to delete question');
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast.error('Please enter the question text and all 4 options');
      return;
    }

    const payload = {
      question_text: questionText.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      correct_option: correctOption,
    };

    try {
      setFormLoading(true);
      if (editingQuestion) {
        const qId = editingQuestion.id || editingQuestion._id;
        const updated = await updateQuestion(qId, payload);
        setQuestions((prev) =>
          prev.map((q) => ((q.id || q._id) === qId ? { ...q, ...payload, ...updated } : q))
        );
        toast.success('Question updated successfully');
      } else {
        const created = await addQuestion(sessionId, payload);
        setQuestions((prev) => [...prev, created]);
        toast.success('Question added successfully');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save question error:', err);
      const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Failed to save question';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold text-[#173c34] bg-white hover:bg-[#eef3f0] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34] transition-all"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Console</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#173c34]/15">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-display text-2xl sm:text-4xl font-normal text-[#173c34] tracking-tight">
                {session?.title || 'Session Questions'}
              </h1>
              {session?.status && (
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#173c34] ${
                    session.status === 'Live'
                      ? 'bg-[#b5e7d2] text-[#173c34]'
                      : 'bg-[#f7b955] text-[#173c34]'
                  }`}
                >
                  {session.status}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#173c34]/70 mt-1.5">
              {questions.length} total questions configured for this quiz session
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[#e65f45] hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all flex-shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="py-16 bg-white rounded-[2rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] flex items-center justify-center">
          <LoadingSpinner message="Loading question bank..." />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-[2rem] border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f7f4ec] border-2 border-[#173c34] text-[#173c34] flex items-center justify-center mx-auto shadow-[3px_3px_0_#173c34]">
            <FiHelpCircle className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#173c34]">No questions added yet</h3>
          <p className="text-xs sm:text-sm text-[#173c34]/70 max-w-sm mx-auto">
            Build your multiple-choice questions with 4 options and designate the correct answer.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#e65f45] border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const qId = q.id || q._id;
            const options = [
              { key: 'A', text: q.option_a },
              { key: 'B', text: q.option_b },
              { key: 'C', text: q.option_c },
              { key: 'D', text: q.option_d },
            ];

            return (
              <div
                key={qId || idx}
                className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-[#173c34] shadow-[6px_6px_0_#173c34] hover:shadow-[8px_8px_0_#173c34] transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <span className="w-8 h-8 rounded-xl bg-[#f7b955] border-2 border-[#173c34] text-[#173c34] text-xs font-black font-display flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[1px_1px_0_#173c34]">
                      {idx + 1}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-normal text-[#173c34] leading-relaxed">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(q)}
                      className="w-9 h-9 rounded-full border-2 border-[#173c34] bg-white text-[#173c34] hover:bg-[#eef3f0] shadow-[2px_2px_0_#173c34] flex items-center justify-center transition-all"
                      title="Edit question"
                    >
                      <FiEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(qId)}
                      className="w-9 h-9 rounded-full border-2 border-[#e65f45] bg-[#fff0ed] text-[#e65f45] hover:bg-[#ffb6aa] shadow-[2px_2px_0_#e65f45] flex items-center justify-center transition-all"
                      title="Delete question"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Option pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {options.map((opt) => {
                    const isCorrect = q.correct_option === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center p-3 rounded-xl border-2 text-xs sm:text-sm transition-all ${
                          isCorrect
                            ? 'bg-[#e8f5ef] border-[#236653] text-[#173c34] font-semibold shadow-[2px_2px_0_#236653]'
                            : 'bg-[#fdfbf7] border-[#173c34]/20 text-[#173c34]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center mr-2.5 flex-shrink-0 border ${
                            isCorrect ? 'bg-[#236653] text-white border-[#236653]' : 'bg-white text-[#173c34] border-[#173c34]/30'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="flex-1 truncate">{opt.text}</span>
                        {isCorrect && (
                          <span className="ml-2 text-xs font-black text-[#236653] flex items-center space-x-1 flex-shrink-0">
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#173c34]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f7f4ec] rounded-[2.25rem] max-w-xl w-full p-6 sm:p-8 border-3 border-[#173c34] shadow-[12px_12px_0_#173c34] transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#173c34]/15">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#b5e7d2] text-[#173c34] border border-[#173c34] mb-2">
                  Question Builder
                </span>
                <h3 className="font-display text-2xl font-bold text-[#173c34]">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full border-2 border-[#173c34] bg-white text-[#173c34] hover:bg-[#ffb6aa] flex items-center justify-center transition-all shadow-[2px_2px_0_#173c34]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#173c34] mb-2" htmlFor="q-text">
                  Question Text *
                </label>
                <textarea
                  id="q-text"
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the scenario or architecture question prompt here..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#173c34] bg-white text-[#173c34] font-medium placeholder-[#173c34]/40 focus:outline-none focus:shadow-[4px_4px_0_#173c34] transition-all resize-none text-sm"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-[#173c34]">
                  Answer Options & Correct Choice *
                </label>
                <p className="text-xs text-[#173c34]/70 -mt-1.5 mb-2">
                  Fill in all 4 options, and click the letter badge to designate the correct answer.
                </p>

                {[
                  { key: 'A', value: optionA, setter: setOptionA },
                  { key: 'B', value: optionB, setter: setOptionB },
                  { key: 'C', value: optionC, setter: setOptionC },
                  { key: 'D', value: optionD, setter: setOptionD },
                ].map(({ key, value, setter }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <label
                      className={`flex items-center justify-center w-9 h-9 rounded-xl font-display font-bold text-xs cursor-pointer border-2 transition-all ${
                        correctOption === key
                          ? 'bg-[#236653] border-[#236653] text-white shadow-[2px_2px_0_#173c34]'
                          : 'bg-white border-[#173c34] text-[#173c34] hover:bg-[#f7b955]'
                      }`}
                      title={`Mark ${key} as correct answer`}
                    >
                      <input
                        type="radio"
                        name="correct_option"
                        value={key}
                        checked={correctOption === key}
                        onChange={() => setCorrectOption(key)}
                        className="sr-only"
                      />
                      {key}
                    </label>

                    <input
                      type="text"
                      required
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={`Option ${key} text`}
                      className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                        correctOption === key
                          ? 'border-[#236653] bg-[#e8f5ef] text-[#173c34] font-semibold'
                          : 'border-[#173c34] bg-white text-[#173c34]'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-[#173c34]/15 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-full border-2 border-[#173c34] bg-white text-[#173c34] font-bold text-xs hover:bg-[#eef3f0] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#e65f45] text-white font-bold text-xs border-2 border-[#173c34] shadow-[0_4px_0_#a83a29] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>{editingQuestion ? 'Update Question' : 'Save Question'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionManagerPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <QuestionManagerContent />
    </ProtectedRoute>
  );
}
