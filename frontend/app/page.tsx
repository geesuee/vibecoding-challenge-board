
'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChallengeCard from '../components/ChallengeCard';
import AddChallengeCard from '../components/AddChallengeCard';
import ChallengeModal from '../components/ChallengeModal';
import CreateChallengeModal from '../components/CreateChallengeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import NotificationToast from '../components/NotificationToast';
import { Challenge, challengeApi } from '../src/lib/api';
import { useNotifications } from '../hooks/useNotifications';

export default function Home() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await challengeApi.getAll();
      setChallenges(data);
    } catch (err) {
      setError('챌린지를 불러오는데 실패했습니다.');
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  // 챌린지 목록 로드
  useEffect(() => {
    loadChallenges();
  }, []);

  const filteredChallenges = challenges.filter(challenge => {
    if (activeFilter === 'all') return true;
    return challenge.status === activeFilter;
  });

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleCreateChallenge = async (challengeData: Omit<Challenge, 'id' | 'progress' | 'status' | 'certifications'>) => {
    try {
      const newChallenge = await challengeApi.create(challengeData);
      setChallenges([newChallenge, ...challenges]);
      showSuccess('챌린지 생성 완료', '새로운 챌린지가 성공적으로 생성되었습니다!');
    } catch (err) {
      showError('챌린지 생성 실패', '챌린지 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to create challenge:', err);
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleUpdateChallenge = async (challengeData: Omit<Challenge, 'id' | 'progress' | 'status' | 'certifications'>) => {
    if (!editingChallenge) return;

    try {
      const updatedChallenge = await challengeApi.update(editingChallenge.id, challengeData);
      setChallenges(challenges.map(c => c.id === editingChallenge.id ? updatedChallenge : c));
      setEditingChallenge(null);
      showSuccess('챌린지 수정 완료', '챌린지가 성공적으로 수정되었습니다!');
    } catch (err) {
      showError('챌린지 수정 실패', '챌린지 수정에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to update challenge:', err);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await challengeApi.delete(challengeId);
      setChallenges(challenges.filter(c => c.id !== challengeId));
      showSuccess('챌린지 삭제 완료', '챌린지가 성공적으로 삭제되었습니다.');
    } catch (err) {
      showError('챌린지 삭제 실패', '챌린지 삭제에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to delete challenge:', err);
    }
  };

  const getFilterCount = (filter: 'all' | 'active' | 'completed') => {
    if (filter === 'all') return challenges.length;
    return challenges.filter(c => c.status === filter).length;
  };

  const getEmptyStateConfig = () => {
    if (activeFilter === 'active') {
      return {
        title: '진행중인 챌린지가 없습니다',
        description: '새로운 챌린지를 시작해보세요!',
        action: (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-mobile inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus-ring transition-colors duration-200"
          >
            챌린지 시작하기
          </button>
        )
      };
    } else if (activeFilter === 'completed') {
      return {
        title: '완료된 챌린지가 없습니다',
        description: '첫 번째 챌린지를 완료해보세요!',
        action: (
          <button
            onClick={() => setActiveFilter('active')}
            className="btn-mobile inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus-ring transition-colors duration-200"
          >
            진행중인 챌린지 보기
          </button>
        )
      };
    }
    return null;
  };

  // 스켈레톤 카드 렌더링
  const renderSkeletonCards = () => {
    const skeletonCount = 6; // 기본 6개의 스켈레톤 카드
    return Array.from({ length: skeletonCount }, (_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            나의 챌린지
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            목표를 달성하고 새로운 습관을 만들어보세요
          </p>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={loadChallenges}
            className="mb-4 sm:mb-6"
            showDetails={true}
          />
        )}

        {/* 필터 버튼 - 로딩 중에도 표시 */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveFilter('all')}
              disabled={loading}
              className={`btn-mobile px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
              }`}
              aria-label="전체 챌린지 보기"
              aria-pressed={activeFilter === 'all'}
            >
              <span className="text-sm sm:text-base">전체</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'all' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {loading ? '...' : getFilterCount('all')}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              disabled={loading}
              className={`btn-mobile px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                activeFilter === 'active'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
              }`}
              aria-label="진행중인 챌린지 보기"
              aria-pressed={activeFilter === 'active'}
            >
              <span className="text-sm sm:text-base">진행중</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'active' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {loading ? '...' : getFilterCount('active')}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              disabled={loading}
              className={`btn-mobile px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                activeFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
              }`}
              aria-label="완료된 챌린지 보기"
              aria-pressed={activeFilter === 'completed'}
            >
              <span className="text-sm sm:text-base">완료</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'completed' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {loading ? '...' : getFilterCount('completed')}
              </span>
            </button>
          </div>
        </div>

        {/* 챌린지 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {loading ? (
            <>
              {renderSkeletonCards()}
              <AddChallengeCard onClick={() => setIsCreateModalOpen(true)} />
            </>
          ) : (
            <>
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClick={handleChallengeClick}
                />
              ))}
              <AddChallengeCard onClick={() => setIsCreateModalOpen(true)} />
            </>
          )}
        </div>

        {/* 빈 상태 메시지 */}
        {!loading && filteredChallenges.length === 0 && activeFilter !== 'all' && (
          <EmptyState
            title={getEmptyStateConfig()?.title || ''}
            description={getEmptyStateConfig()?.description || ''}
            icon={
              <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            action={getEmptyStateConfig()?.action}
          />
        )}
      </main>

      <ChallengeModal
        challenge={selectedChallenge}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedChallenge(null);
        }}
        onEdit={handleEditChallenge}
        onDelete={handleDeleteChallenge}
      />

      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingChallenge(null);
        }}
        onSave={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}
        editingChallenge={editingChallenge}
      />

      {/* 알림 토스트 */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}
