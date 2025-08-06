import { withCache, invalidateChallengeCache, getChallengeCacheKey } from '../../lib/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api');

export interface Challenge {
  id: string;
  name: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'active' | 'completed';
  image?: string;
  tasks: string[];
  certifications: Record<string, boolean>;
}

export interface ChallengeStats {
  total: number;
  active: number;
  completed: number;
  averageProgress: number;
  totalCertifications: number;
  categoryStats: Record<string, number>;
  recentCertifications: Array<{
    date: string;
    count: number;
  }>;
  streakStats: {
    currentStreak: number;
    longestStreak: number;
  };
}

export interface CreateChallengeData {
  name: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  tasks: string[];
}

// API 호출 헬퍼 함수
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // 에러 응답의 JSON을 파싱하려고 시도
      let errorMessage = `API call failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    // 204 No Content 상태 코드인 경우 JSON 파싱을 시도하지 않음
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// 챌린지 API 함수들
export const challengeApi = {
  // 모든 챌린지 조회 (캐싱 적용)
  getAll: (): Promise<Challenge[]> => {
    return withCache(
      getChallengeCacheKey(),
      () => apiCall<Challenge[]>('/challenges'),
      2 * 60 * 1000 // 2분 캐시
    );
  },

  // 특정 챌린지 조회 (캐싱 적용)
  getById: (id: string): Promise<Challenge> => {
    return withCache(
      `challenge_${id}`,
      () => apiCall<Challenge>(`/challenges/${id}`),
      5 * 60 * 1000 // 5분 캐시
    );
  },

  // 새 챌린지 생성 (캐시 무효화)
  create: async (data: CreateChallengeData): Promise<Challenge> => {
    const result = await apiCall<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // 캐시 무효화
    invalidateChallengeCache();
    return result;
  },

  // 챌린지 수정 (캐시 무효화)
  update: async (id: string, data: Partial<CreateChallengeData> & { status?: string }): Promise<Challenge> => {
    const result = await apiCall<Challenge>(`/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // 캐시 무효화
    invalidateChallengeCache();
    return result;
  },

  // 챌린지 삭제 (캐시 무효화)
  delete: async (id: string): Promise<void> => {
    await apiCall<void>(`/challenges/${id}`, {
      method: 'DELETE',
    });
    
    // 캐시 무효화
    invalidateChallengeCache();
  },

  // 챌린지 인증 (캐시 무효화)
  certify: async (id: string, date?: string): Promise<any> => {
    // date가 없으면 오늘 날짜 사용
    const today = new Date();
    const koreaTime = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    const todayString = koreaTime.toISOString().split('T')[0];
    
    const body = { date: date || todayString };
    const result = await apiCall(`/challenges/${id}/certify`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    // 캐시 무효화
    invalidateChallengeCache();
    return result;
  },

  // 챌린지 인증 취소 (캐시 무효화)
  uncertify: async (id: string, date: string): Promise<{ message: string }> => {
    const result = await apiCall<{ message: string }>(`/challenges/${id}/certify`, {
      method: 'DELETE',
      body: JSON.stringify({ date }),
    });
    
    // 캐시 무효화
    invalidateChallengeCache();
    return result;
  },

  // 캐시 무효화 헬퍼
  invalidateCache: () => {
    invalidateChallengeCache();
  },

  // 통계 조회
  getStats: (): Promise<ChallengeStats> => {
    return withCache(
      'challenge_stats',
      () => apiCall<ChallengeStats>('/challenges/stats'),
      5 * 60 * 1000 // 5분 캐시
    );
  }
}; 