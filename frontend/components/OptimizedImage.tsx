'use client';

import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  loading = 'lazy',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer를 사용한 지연 로딩
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // 50px 전에 미리 로딩
          threshold: 0.1
        }
      );

      observerRef.current.observe(imgRef.current);
    } else {
      setIsInView(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  // 이미지 로딩 상태 관리
  useEffect(() => {
    if (!isInView) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      if (fallbackSrc && fallbackSrc !== imageSrc) {
        setImageSrc(fallbackSrc);
      }
    };

    img.src = imageSrc || fallbackSrc || '';

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, isInView, fallbackSrc]);

  // 에러 발생 시 fallback 이미지로 재시도
  const handleError = () => {
    if (!hasError && fallbackSrc && fallbackSrc !== imageSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // 이미지 URL 변경 시 상태 리셋
  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setIsLoading(true);
    setHasError(false);
  }, [src, fallbackSrc]);

  // 스켈레톤 로딩 스타일
  const skeletonClass = isLoading ? 'animate-pulse bg-gray-200' : '';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 스켈레톤 로딩 */}
      {isLoading && (
        <div className={`absolute inset-0 ${skeletonClass} z-10`}>
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        </div>
      )}
      
      {/* 실제 이미지 */}
      <img
        ref={imgRef}
        src={isInView && imageSrc ? imageSrc : fallbackSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        loading={loading}
        sizes={sizes}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        decoding="async"
        {...(priority && { fetchPriority: 'high' })}
      />
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
} 