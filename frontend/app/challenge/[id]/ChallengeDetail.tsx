'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import NotificationToast from '../../../components/NotificationToast';
import { Challenge, challengeApi } from '../../../src/lib/api';
import { useNotifications } from '../../../hooks/useNotifications';
import ChallengeCalendar from '../../../components/ChallengeCalendar';

interface ChallengeDetailProps {
  challengeId: string;
}

export default function ChallengeDetail({ challengeId }: ChallengeDetailProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCertifying, setIsCertifying] = useState(false);
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  // 챌린지 데이터 로드
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true);
        challengeApi.invalidateCache();
        const data = await challengeApi.getById(challengeId);
        setChallenge(data);
        setError(null);
      } catch (err) {
        setError('챌린지를 불러오는데 실패했습니다.');
        console.error('Failed to load challenge:', err);
      } finally {
        setLoading(false);
      }
    };
    loadChallenge();
  }, [challengeId]);

  const getTodayString = () => {
    const today = new Date();
    const koreaTime = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    return koreaTime.toISOString().split('T')[0];
  };

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

  const handleCertification = async () => {
    if (!challenge) return;

    setIsCertifying(true);

    try {
      await challengeApi.certify(challenge.id);
      challengeApi.invalidateCache();
      showSuccess('인증 완료', '오늘의 챌린지 인증이 완료되었습니다!');
      const updatedChallenge = await challengeApi.getById(challengeId);
      setChallenge(updatedChallenge);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('Failed to certify challenge:', err);
      showError('인증 실패', '인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCertifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">챌린지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">챌린지를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const todayStr = getTodayString();
  const isTodayCertified = !!challenge.certifications[todayStr];
  const canCertifyToday = challenge.status === 'active' && !isTodayCertified;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <i className="ri-arrow-left-line mr-2"></i> 챌린지 보드로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${challenge.image})` }}></div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(challenge.category)}`}>
                {challenge.category}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                challenge.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {challenge.status === 'completed' ? '완료' : '진행중'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{challenge.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{challenge.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">시작일</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(challenge.startDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">종료일</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(challenge.endDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">진행률</h3>
                <span className="text-2xl font-bold text-blue-600">{challenge.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${challenge.progress}%` }}></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 현황</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ChallengeCalendar
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  certifications={challenge.certifications}
                  status={challenge.status}
                />

                {canCertifyToday && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleCertification}
                      disabled={isCertifying}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        isCertifying
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCertifying ? (
                        <>
                          <i className="ri-loader-2-line animate-spin mr-2"></i>
                          인증 중...
                        </>
                      ) : (
                        <>
                          <i className="ri-check-line mr-2"></i>
                          오늘 인증하기
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!canCertifyToday && challenge.status === 'active' && (
                  <div className="text-center text-gray-500 mt-4">오늘은 이미 인증되었습니다.</div>
                )}
                {!canCertifyToday && challenge.status === 'completed' && (
                  <div className="text-center text-gray-500 mt-4">완료된 챌린지입니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
