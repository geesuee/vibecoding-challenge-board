'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Challenge } from '../src/lib/api';
import ChallengeCalendar from './ChallengeCalendar';

interface ChallengeModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challengeId: string) => void;
}

export default function ChallengeModal({ challenge, isOpen, onClose, onEdit, onDelete }: ChallengeModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localChallenge, setLocalChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    if (isOpen && challenge) {
      setLocalChallenge(challenge);
      // 디버깅을 위한 로그 추가
      console.log('ChallengeModal challenge data:', {
        id: challenge.id,
        name: challenge.name,
        tasks: challenge.tasks,
        tasksType: typeof challenge.tasks,
        tasksLength: Array.isArray(challenge.tasks) ? challenge.tasks.length : 'not array',
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        progress: challenge.progress,
        certifications: challenge.certifications
      });
    }
  }, [isOpen, challenge]);

  if (!isOpen || !challenge || !localChallenge) return null;

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

  const confirmDelete = () => {
    onDelete(localChallenge.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  // tasks 배열을 안전하게 처리
  const safeTasks = Array.isArray(localChallenge.tasks) ? localChallenge.tasks : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{localChallenge.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="h-48 bg-cover bg-center rounded-lg mb-4" style={{ backgroundImage: `url(${localChallenge.image})` }}></div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(localChallenge.category)}`}>{localChallenge.category}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${localChallenge.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{localChallenge.status === 'completed' ? '완료' : '진행중'}</span>
          </div>

          <p className="text-gray-600 mb-4">{localChallenge.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium text-gray-700">시작일</span>
              <p className="text-gray-900">{new Date(localChallenge.startDate).toLocaleDateString('ko-KR')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">종료일</span>
              <p className="text-gray-900">{new Date(localChallenge.endDate).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">진행률</span>
              <span className="text-sm font-medium text-blue-600">{typeof localChallenge.progress === 'number' ? `${localChallenge.progress}%` : '0%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${typeof localChallenge.progress === 'number' ? Math.min(localChallenge.progress, 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">주요 과제</h3>
            <ul className="space-y-1">
              {safeTasks.length > 0 ? (
                safeTasks.map((task, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <i className="ri-check-line text-green-500 mr-2"></i>{task}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">등록된 과제가 없습니다.</li>
              )}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">인증 현황</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ChallengeCalendar
                startDate={localChallenge.startDate}
                endDate={localChallenge.endDate}
                certifications={localChallenge.certifications}
                status={localChallenge.status}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/challenge/${localChallenge.id}`} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">상세 정보</Link>
            <button onClick={() => onEdit(localChallenge)} className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">수정하기</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors">중단하기</button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">챌린지 중단</h3>
            <p className="text-gray-600 mb-4">정말로 이 챌린지를 중단하시겠습니까? 모든 데이터가 삭제됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors">중단하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}