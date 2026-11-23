'use client';

import React from 'react';

const QuestionCard = ({ question, selectedOption, onSelect, questionNumber }) => {
  if (!question) return null;

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm transition-all">
      {/* Header with question number */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Question {questionNumber}
        </span>
        <span className="text-xs text-slate-400 font-medium">Single Choice</span>
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed mb-6">
        {question.question_text}
      </h3>

      {/* Options List */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={`w-full group flex items-start text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
              }`}
            >
              {/* Radio circle with Key label */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3.5 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {opt.key}
              </div>

              {/* Option text */}
              <div className="flex-1 pt-1 font-medium text-sm sm:text-base leading-snug">
                {opt.text}
              </div>

              {/* Radio indicator */}
              <div className="ml-3 flex-shrink-0 pt-1.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
