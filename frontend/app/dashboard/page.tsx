'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Challenge, ChallengeStats, challengeApi } from '../../src/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [challengesData, statsData] = await Promise.all([
        challengeApi.getAll(),
        challengeApi.getStats()
      ]);
      setChallenges(challengesData);
      setStats(statsData);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 통계 데이터 (백엔드에서 받은 데이터 우선 사용, 없으면 계산)
  const displayStats = stats || {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    averageProgress: challenges.length > 0 
      ? Math.round(challenges.reduce((sum, c) => sum + c.progress, 0) / challenges.length)
      : 0,
    totalCertifications: challenges.reduce((sum, c) => 
      sum + Object.keys(c.certifications).length, 0
    )
  };

  // 카테고리별 통계
  const categoryStats = stats?.categoryStats || challenges.reduce((acc, challenge) => {
    acc[challenge.category] = (acc[challenge.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value
  }));

  // 진행률별 분포
  const progressDistribution = [
    { range: '0-20%', count: challenges.filter(c => c.progress <= 20).length },
    { range: '21-40%', count: challenges.filter(c => c.progress > 20 && c.progress <= 40).length },
    { range: '41-60%', count: challenges.filter(c => c.progress > 40 && c.progress <= 60).length },
    { range: '61-80%', count: challenges.filter(c => c.progress > 60 && c.progress <= 80).length },
    { range: '81-100%', count: challenges.filter(c => c.progress > 80).length }
  ];

  // 최근 인증 활동 (최근 7일)
  const getRecentCertifications = () => {
    if (stats?.recentCertifications) {
      return stats.recentCertifications.map(item => ({
        date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        certifications: item.count
      }));
    }
    
    // Fallback 계산
    const today = new Date();
    const recentData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const certifications = challenges.reduce((sum, challenge) => {
        return sum + (challenge.certifications[dateStr] ? 1 : 0);
      }, 0);
      
      recentData.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        certifications
      });
    }
    
    return recentData;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-600 mt-2">챌린지 진행 상황과 통계를 한눈에 확인하세요</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              챌린지 보드로 돌아가기
            </Link>
          </div>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={loadData}
            className="mb-6"
          />
        )}

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 챌린지</p>
                <p className="text-2xl font-bold text-gray-900">{displayStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행중</p>
                <p className="text-2xl font-bold text-gray-900">{displayStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료</p>
                <p className="text-2xl font-bold text-gray-900">{displayStats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 진행률</p>
                <p className="text-2xl font-bold text-gray-900">{displayStats.averageProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 인증</p>
                <p className="text-2xl font-bold text-gray-900">{displayStats.totalCertifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 최근 인증 활동 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 인증 활동</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getRecentCertifications()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="certifications" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 카테고리별 분포 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 진행률 분포 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">진행률 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 연속 인증 기록 */}
        {stats?.streakStats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">연속 인증 기록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.streakStats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">현재 연속 인증</div>
                <div className="text-xs text-gray-500 mt-1">일</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.streakStats.longestStreak}
                </div>
                <div className="text-sm text-gray-600">최고 연속 인증</div>
                <div className="text-xs text-gray-500 mt-1">일</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {stats.streakStats.currentStreak > 0 
                  ? `현재 ${stats.streakStats.currentStreak}일 연속으로 인증하고 있습니다! 🔥`
                  : '오늘 인증을 시작해보세요! 💪'
                }
              </p>
            </div>
          </div>
        )}

        {/* 최고 성과 챌린지 */}
        {challenges.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최고 성과 챌린지</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 6)
                .map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{challenge.name}</h4>
                      <span className="text-sm font-semibold text-blue-600">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{challenge.category}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 