import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();

// CORS 미들웨어 설정
const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true,
});

// CORS 헬퍼 함수
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 처리
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const challenges = await prisma.challenge.findMany();

    // 기본 통계 계산
    const total = challenges.length;
    const active = challenges.filter(c => c.status === 'active').length;
    const completed = challenges.filter(c => c.status === 'completed').length;
    const averageProgress = total > 0 
      ? Math.round(challenges.reduce((sum, c) => sum + c.progress, 0) / total)
      : 0;

    // 카테고리별 통계
    const categoryStats: Record<string, number> = {};
    challenges.forEach(challenge => {
      categoryStats[challenge.category] = (categoryStats[challenge.category] || 0) + 1;
    });

    // 총 인증 수 계산
    const totalCertifications = challenges.reduce((sum, challenge) => {
      const certifications = JSON.parse(challenge.certifications || '{}') as Record<string, boolean>;
      return sum + Object.keys(certifications).filter(date => certifications[date]).length;
    }, 0);

    // 최근 인증 통계 (최근 7일)
    const recentCertifications = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      let count = 0;
      challenges.forEach(challenge => {
        const certifications = JSON.parse(challenge.certifications || '{}') as Record<string, boolean>;
        if (certifications[dateString]) {
          count++;
        }
      });
      
      recentCertifications.push({
        date: dateString,
        count,
      });
    }

    // 연속 인증 통계
    const streakStats = calculateStreakStats(challenges);

    const stats = {
      total,
      active,
      completed,
      averageProgress,
      totalCertifications,
      categoryStats,
      recentCertifications,
      streakStats,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

function calculateStreakStats(challenges: any[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 오늘부터 과거로 거슬러 올라가면서 연속 인증 확인
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    let hasCertification = false;
    challenges.forEach(challenge => {
      const certifications = JSON.parse(challenge.certifications || '{}') as Record<string, boolean>;
      if (certifications[dateString]) {
        hasCertification = true;
      }
    });

    if (hasCertification) {
      tempStreak++;
      if (i === 0) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
  };
} 