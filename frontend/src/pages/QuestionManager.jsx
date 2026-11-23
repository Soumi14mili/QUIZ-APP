import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
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

const QuestionManager = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

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
    try {
      setLoading(true);
      const [sessionRes, questionsRes] = await Promise.all([
        api.get(`/admin/sessions/${sessionId}`),
        api.get(`/admin/sessions/${sessionId}/questions`),
      ]);

      setSession(sessionRes.data.session || sessionRes.data);
      const qList = Array.isArray(questionsRes.data)
        ? questionsRes.data
        : questionsRes.data.questions || [];
      setQuestions(qList);
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
      await api.delete(`/admin/questions/${questionId}`);
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
        const res = await api.put(`/admin/questions/${qId}`, payload);
        const updated = res.data.question || res.data;
        setQuestions((prev) =>
          prev.map((q) => ((q.id || q._id) === qId ? { ...q, ...payload, ...updated } : q))
        );
        toast.success('Question updated successfully');
      } else {
        const res = await api.post(`/admin/sessions/${sessionId}/questions`, payload);
        const created = res.data.question || res.data;
        setQuestions((prev) => [...prev, created]);
        toast.success('Question added successfully');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save question error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save question';
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
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {session?.title || 'Session Questions'}
              </h1>
              {session?.status && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    session.status === 'Live'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {session.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {questions.length} total questions configured for this quiz session
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex-shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 flex items-center justify-center">
          <LoadingSpinner message="Loading questions..." />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <FiHelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No questions yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Add multiple choice questions with 4 options and mark the correct answer.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit question"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(qId)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete question"
                    >
                      <FiTrash2 className="w-4 h-4" />
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
                        className={`flex items-center p-3 rounded-xl border text-sm transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-400/30'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center mr-2.5 flex-shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="flex-1 truncate">{opt.text}</span>
                        {isCorrect && (
                          <span className="ml-2 text-xs font-bold text-emerald-700 flex items-center space-x-1 flex-shrink-0">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="q-text">
                  Question Text *
                </label>
                <textarea
                  id="q-text"
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question prompt here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Answer Options & Correct Choice *
                </label>
                <p className="text-xs text-slate-500 -mt-2 mb-2">
                  Fill in all 4 options, and select the radio button next to the correct answer.
                </p>

                {[
                  { key: 'A', value: optionA, setter: setOptionA },
                  { key: 'B', value: optionB, setter: setOptionB },
                  { key: 'C', value: optionC, setter: setOptionC },
                  { key: 'D', value: optionD, setter: setOptionD },
                ].map(({ key, value, setter }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <label
                      className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs cursor-pointer border-2 transition-all ${
                        correctOption === key
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
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
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm transition-colors ${
                        correctOption === key
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 font-medium'
                          : 'border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5"
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
};

export default QuestionManager;
