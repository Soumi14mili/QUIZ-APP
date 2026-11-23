import React from 'react';
import { FiCheck, FiX, FiHelpCircle } from 'react-icons/fi';

const ResultCard = ({
  question,
  selectedOption,
  correctOption,
  isCorrect,
  questionNumber,
}) => {
  if (!question) return null;

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  const wasAnswered = selectedOption !== null && selectedOption !== undefined;

  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-8 border shadow-sm transition-all ${
        isCorrect
          ? 'border-emerald-200 bg-emerald-50/20'
          : wasAnswered
          ? 'border-rose-200 bg-rose-50/20'
          : 'border-slate-200'
      }`}
    >
      {/* Header with question number and status badge */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          Question {questionNumber}
        </span>

        {isCorrect ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FiCheck className="w-3.5 h-3.5" />
            <span>Correct (+1)</span>
          </span>
        ) : wasAnswered ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <FiX className="w-3.5 h-3.5" />
            <span>Incorrect</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span>Unanswered</span>
          </span>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed mb-6">
        {question.question_text}
      </h3>

      {/* Options List with status decoration */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isThisSelected = selectedOption === opt.key;
          const isThisCorrect = correctOption === opt.key;

          let optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
          let badgeLabel = null;
          let badgeStyle = '';
          let icon = null;

          if (isThisCorrect && isThisSelected) {
            // Selected and correct
            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30';
            badgeLabel = 'Your Answer (Correct)';
            badgeStyle = 'bg-emerald-600 text-white';
            icon = <FiCheck className="w-4 h-4 text-emerald-600" />;
          } else if (isThisCorrect && !isThisSelected) {
            // Correct answer, not selected by student
            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
            badgeLabel = 'Correct Answer';
            badgeStyle = 'bg-emerald-600 text-white';
            icon = <FiCheck className="w-4 h-4 text-emerald-600" />;
          } else if (isThisSelected && !isThisCorrect) {
            // Selected but incorrect
            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400/20';
            badgeLabel = 'Your Answer (Incorrect)';
            badgeStyle = 'bg-rose-600 text-white';
            icon = <FiX className="w-4 h-4 text-rose-600" />;
          }

          return (
            <div
              key={opt.key}
              className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all ${optionStyle}`}
            >
              <div className="flex items-start space-x-3.5 flex-1 mr-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isThisCorrect
                      ? 'bg-emerald-200 text-emerald-900'
                      : isThisSelected
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opt.key}
                </div>
                <div className="font-medium text-sm sm:text-base leading-snug pt-0.5">
                  {opt.text}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {badgeLabel && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}
                  >
                    {badgeLabel}
                  </span>
                )}
                {icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultCard;
