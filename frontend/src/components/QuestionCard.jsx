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
    <div className="bg-white rounded-[2rem] p-6 sm:p-9 border-2 border-[#173c34] shadow-[8px_8px_0_#173c34] transition-all">
      {/* Header with question pill */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#173c34]/10">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-[#f7b955] text-[#173c34] border border-[#173c34] shadow-[2px_2px_0_#173c34]">
          Question {questionNumber}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#eef3f0] text-[#173c34] border border-[#173c34]/15">
          Single Choice
        </span>
      </div>

      {/* Question Text in Fraunces */}
      <h3 className="font-display text-xl sm:text-2xl text-[#173c34] font-normal leading-relaxed mb-8">
        {question.question_text}
      </h3>

      {/* Options List */}
      <div className="space-y-3.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={`w-full group flex items-center text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 ${
                isSelected
                  ? 'border-[#e65f45] bg-[#fff0ed] text-[#173c34] shadow-[4px_4px_0_#e65f45] -translate-y-0.5'
                  : 'border-[#d9ded8] bg-[#fdfbf7] hover:border-[#173c34] hover:bg-white text-[#173c34] hover:shadow-[3px_3px_0_#173c34]'
              }`}
            >
              {/* Option Key Badge */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-xl border-2 flex items-center justify-center font-display font-bold text-sm mr-4 transition-all ${
                  isSelected
                    ? 'border-[#e65f45] bg-[#e65f45] text-white shadow-sm'
                    : 'border-[#173c34] bg-white text-[#173c34] group-hover:bg-[#f7b955]'
                }`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <div className="flex-1 font-medium text-sm sm:text-base leading-snug">
                {opt.text}
              </div>

              {/* Radio Indicator */}
              <div className="ml-3 flex-shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-[#e65f45] bg-white' : 'border-[#173c34]/30'
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#e65f45]" />}
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
