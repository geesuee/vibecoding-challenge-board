'use client';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* 이미지 스켈레톤 */}
      <div className="h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 bg-gray-200 animate-pulse"></div>
      
      <div className="p-3 sm:p-4 lg:p-5">
        {/* 카테고리 및 상태 스켈레톤 */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        {/* 제목 스켈레톤 */}
        <div className="mb-1 sm:mb-2">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
        
        {/* 설명 스켈레톤 */}
        <div className="mb-2 sm:mb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
        
        {/* 날짜 스켈레톤 */}
        <div className="mb-2 sm:mb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
        
        {/* 진행률 스켈레톤 */}
        <div className="mb-2 sm:mb-3">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5">
            <div className="h-1.5 sm:h-2 lg:h-2.5 bg-gray-300 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 