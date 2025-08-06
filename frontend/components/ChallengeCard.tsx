
'use client';

import { useState } from 'react';
import { Challenge } from '../src/lib/api';
import OptimizedImage from './OptimizedImage';

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: (challenge: Challenge) => void;
}

export default function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      '학습': 'bg-blue-100 text-blue-800',
      '건강': 'bg-green-100 text-green-800',
      '독서': 'bg-purple-100 text-purple-800',
      '라이프스타일': 'bg-yellow-100 text-yellow-800',
      '소셜': 'bg-pink-100 text-pink-800',
      '기타': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors['기타'];
  };

  const isCompleted = challenge.status === 'completed';

  const handleClick = () => {
    onClick(challenge);
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
      className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 gpu-accelerated touch-manipulation ${
        isCompleted 
          ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
          : 'border-gray-200 hover:border-blue-200'
      } ${
        isPressed 
          ? 'scale-95 shadow-lg' 
          : 'hover:shadow-md active:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`${challenge.name} 챌린지 상세보기 - ${challenge.progress}% 진행률`}
      aria-describedby={`challenge-${challenge.id}-description`}
    >
      <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48">
        <OptimizedImage
          src={challenge.image || ''}
          alt={`${challenge.name} 챌린지 이미지`}
          className={`h-full w-full object-cover ${isCompleted ? 'opacity-80' : ''}`}
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full ${getCategoryColor(challenge.category)}`}>
            {challenge.category}
          </span>
          <span className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full ${
            isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isCompleted ? '완료' : '진행중'}
          </span>
        </div>
        
        <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2 leading-tight ${
          isCompleted ? 'text-green-800' : 'text-gray-900'
        }`}>
          {challenge.name}
        </h3>
        
        <p 
          id={`challenge-${challenge.id}-description`}
          className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed"
        >
          {challenge.description}
        </p>
        
        <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
          <span className="sr-only">기간: </span>
          {new Date(challenge.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ {new Date(challenge.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <div className="mb-2 sm:mb-3">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-700">진행률</span>
            <span className={`text-xs sm:text-sm lg:text-base font-medium ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}>
              {challenge.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5">
            <div 
              className={`h-1.5 sm:h-2 lg:h-2.5 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${challenge.progress}%` }}
              aria-label={`진행률 ${challenge.progress}%`}
              role="progressbar"
              aria-valuenow={challenge.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
