'use client';

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

  let cardBg = 'bg-white';
  let cardBorder = 'border-2 border-[#173c34] shadow-[6px_6px_0_#173c34]';

  if (isCorrect) {
    cardBg = 'bg-[#f4f9f6]';
  } else if (wasAnswered) {
    cardBg = 'bg-[#fff5f2]';
  }

  return (
    <div className={`${cardBg} rounded-[2rem] p-6 sm:p-8 ${cardBorder} transition-all`}>
      {/* Header with question number and status badge */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#173c34]/10">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white text-[#173c34] border border-[#173c34] shadow-[2px_2px_0_#173c34]">
          Question {questionNumber}
        </span>

        {isCorrect ? (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#b5e7d2] text-[#173c34] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]">
            <FiCheck className="w-4 h-4 text-[#173c34]" />
            <span>Correct (+1)</span>
          </span>
        ) : wasAnswered ? (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ffb6aa] text-[#173c34] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]">
            <FiX className="w-4 h-4 text-[#e65f45]" />
            <span>Incorrect</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#f7b955] text-[#173c34] border-2 border-[#173c34] shadow-[2px_2px_0_#173c34]">
            <FiHelpCircle className="w-4 h-4 text-[#173c34]" />
            <span>Unanswered</span>
          </span>
        )}
      </div>

      {/* Question Text */}
      <h3 className="font-display text-lg sm:text-xl text-[#173c34] font-normal leading-relaxed mb-6">
        {question.question_text}
      </h3>

      {/* Options List */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isThisSelected = selectedOption === opt.key;
          const isThisCorrect = correctOption === opt.key;

          let optionStyle = 'border-[#d9ded8] bg-white text-[#173c34]';
          let badgeLabel = null;
          let badgeStyle = '';
          let icon = null;

          if (isThisCorrect && isThisSelected) {
            optionStyle = 'border-2 border-[#236653] bg-[#e8f5ef] text-[#173c34] shadow-[3px_3px_0_#236653] font-semibold';
            badgeLabel = 'Your Answer (Correct)';
            badgeStyle = 'bg-[#236653] text-white';
            icon = <FiCheck className="w-4 h-4 text-[#236653]" />;
          } else if (isThisCorrect && !isThisSelected) {
            optionStyle = 'border-2 border-[#236653] bg-[#e8f5ef] text-[#173c34] shadow-[3px_3px_0_#236653] font-semibold';
            badgeLabel = 'Correct Answer';
            badgeStyle = 'bg-[#236653] text-white';
            icon = <FiCheck className="w-4 h-4 text-[#236653]" />;
          } else if (isThisSelected && !isThisCorrect) {
            optionStyle = 'border-2 border-[#e65f45] bg-[#fff0ed] text-[#173c34] shadow-[3px_3px_0_#e65f45]';
            badgeLabel = 'Your Answer (Incorrect)';
            badgeStyle = 'bg-[#e65f45] text-white';
            icon = <FiX className="w-4 h-4 text-[#e65f45]" />;
          }

          return (
            <div
              key={opt.key}
              className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all ${optionStyle}`}
            >
              <div className="flex items-start space-x-3.5 flex-1 mr-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0 border ${
                    isThisCorrect
                      ? 'border-[#236653] bg-[#b5e7d2] text-[#173c34]'
                      : isThisSelected
                      ? 'border-[#e65f45] bg-[#ffb6aa] text-[#173c34]'
                      : 'border-[#173c34]/20 bg-[#f7f4ec] text-[#173c34]'
                  }`}
                >
                  {opt.key}
                </div>
                <span className="text-sm sm:text-base leading-snug pt-0.5">{opt.text}</span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {badgeLabel && (
                  <span
                    className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeStyle}`}
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
