'use client';

import { useState } from 'react';

interface AddChallengeCardProps {
  onClick: () => void;
}

export default function AddChallengeCard({ onClick }: AddChallengeCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-all duration-200 gpu-accelerated touch-manipulation flex flex-col items-center justify-center ${
        isPressed 
          ? 'scale-95 shadow-lg bg-blue-50 border-blue-500' 
          : 'hover:shadow-md active:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-50'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label="새로운 챌린지 추가하기"
    >
      <div className="h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 flex items-center justify-center w-full">
        <div className="text-center p-4 sm:p-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-200">
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
            새로운 챌린지
          </h3>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">
            목표를 설정하고<br className="hidden sm:block" />
            새로운 습관을 만들어보세요
          </p>
        </div>
      </div>
    </div>
  );
}