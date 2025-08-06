interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// 전역 캐시 인스턴스
export const memoryCache = new MemoryCache();

// API 응답 캐싱을 위한 래퍼 함수
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> => {
  // 캐시에서 먼저 확인
  const cached = memoryCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // 캐시에 없으면 데이터 가져오기
  try {
    const data = await fetcher();
    memoryCache.set(key, data, ttl);
    return data;
  } catch (error) {
    // 에러 발생 시 캐시에서 삭제
    memoryCache.delete(key);
    throw error;
  }
};

// 챌린지 관련 캐시 키 생성
export const getChallengeCacheKey = (filter?: string) => {
  return `challenges${filter ? `_${filter}` : ''}`;
};

// 캐시 무효화
export const invalidateChallengeCache = () => {
  const keys = ['challenges', 'challenges_all', 'challenges_active', 'challenges_completed'];
  keys.forEach(key => memoryCache.delete(key));
};

// 로컬 스토리지 캐싱
export const localStorageCache = {
  set: <T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  delete: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// 사용자 설정 캐싱
export const userSettingsCache = {
  key: 'user_settings',
  ttl: 7 * 24 * 60 * 60 * 1000, // 7일

  get: () => {
    return localStorageCache.get(userSettingsCache.key);
  },

  set: (settings: any) => {
    localStorageCache.set(userSettingsCache.key, settings, userSettingsCache.ttl);
  },

  update: (updates: Partial<any>) => {
    const current = userSettingsCache.get() || {};
    const updated = { ...current, ...updates };
    userSettingsCache.set(updated);
    return updated;
  }
}; 