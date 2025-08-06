'use client';

import { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  className = '',
  variant = 'error',
  showDetails = false
}: ErrorMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const styles = variantStyles[variant];

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleToggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.icon}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {variant === 'error' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
            {variant === 'warning' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            )}
            {variant === 'info' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm sm:text-base font-medium ${styles.container.split(' ')[2]}`}>
            {variant === 'error' && '오류가 발생했습니다'}
            {variant === 'warning' && '주의가 필요합니다'}
            {variant === 'info' && '알림'}
          </h3>
          
          <div className="mt-2">
            <p className={`text-sm sm:text-base ${styles.container.split(' ')[2]}`}>
              {message}
            </p>
            
            {showDetails && (
              <div className="mt-3">
                <button
                  onClick={handleToggleDetails}
                  className={`text-sm font-medium underline focus-ring ${styles.container.split(' ')[2]}`}
                  aria-expanded={isExpanded}
                  aria-controls="error-details"
                >
                  {isExpanded ? '상세 정보 숨기기' : '상세 정보 보기'}
                </button>
                
                {isExpanded && (
                  <div 
                    id="error-details"
                    className="mt-2 p-3 bg-white bg-opacity-50 rounded border text-xs sm:text-sm"
                  >
                    <p className="font-mono break-all">
                      {message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            {onRetry && (
              <button
                onClick={handleRetry}
                className={`btn-mobile px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-ring ${styles.button}`}
              >
                다시 시도
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="btn-mobile px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus-ring"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 