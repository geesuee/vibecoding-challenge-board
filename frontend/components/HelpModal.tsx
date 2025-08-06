'use client';

import { useEffect } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">도움말</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors focus-ring"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-10">
            {/* 챌린지 만들기 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                챌린지 만들기
              </h3>
              <div className="text-gray-700 space-y-2 ml-7">
                <p>1. 메인 페이지에서 "새로운 챌린지 추가" 카드를 클릭합니다.</p>
                <p>2. 챌린지명, 설명, 카테고리를 입력합니다.</p>
                <p>3. 시작일과 종료일을 설정하거나 진행 기간을 선택합니다.</p>
                <p>4. 주요 과제를 1~3개까지 추가합니다.</p>
                <p>5. "챌린지 생성" 버튼을 클릭하여 완료합니다.</p>
              </div>
            </div>

            {/* 챌린지 인증하기 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                챌린지 인증하기
              </h3>
              <div className="text-gray-700 space-y-2 ml-7">
                <p>1. 챌린지 카드를 클릭하여 상세 모달을 엽니다.</p>
                <p>2. "상세 정보" 버튼을 클릭하여 챌린지 상세 페이지로 이동합니다.</p>
                <p>3. 상세 페이지에서 "오늘 인증하기" 버튼을 클릭합니다.</p>
                <p>4. 인증 메시지를 작성하고 "인증 완료" 버튼을 클릭합니다.</p>
                <p>5. 캘린더에서 인증된 날짜를 확인할 수 있습니다.</p>
              </div>
            </div>

            {/* 챌린지 수정하기 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                챌린지 수정하기
              </h3>
              <div className="text-gray-700 space-y-2 ml-7">
                <p>1. 챌린지 카드를 클릭하여 상세 모달을 엽니다.</p>
                <p>2. "수정하기" 버튼을 클릭합니다.</p>
                <p>3. 수정하고 싶은 정보를 변경합니다.</p>
                <p>4. "수정 완료" 버튼을 클릭하여 저장합니다.</p>
              </div>
            </div>

            {/* 챌린지 중단하기 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                챌린지 중단하기
              </h3>
              <div className="text-gray-700 space-y-2 ml-7">
                <p>1. 챌린지 카드를 클릭하여 상세 모달을 엽니다.</p>
                <p>2. "중단하기" 버튼을 클릭합니다.</p>
                <p>3. 확인 메시지에서 "중단"을 선택합니다.</p>
                <p>4. 챌린지가 완전히 삭제되며 복구할 수 없습니다.</p>
              </div>
            </div>

            {/* 추가 팁 */}
            <div className="bg-blue-50 p-5 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">💡 팁</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• 챌린지는 진행중, 완료 상태로 필터링할 수 있습니다.</li>
                <li>• 진행률은 인증한 날짜 수를 기반으로 계산됩니다.</li>
                <li>• 캘린더에서 인증 현황을 한눈에 확인할 수 있습니다.</li>
                <li>• 챌린지 중단은 되돌릴 수 없으니 신중하게 결정하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 