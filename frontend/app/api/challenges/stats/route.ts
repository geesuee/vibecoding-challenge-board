import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 날짜 문자열을 Date 객체로 변환하는 헬퍼 함수
const parseDateString = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
};

// GET /api/challenges/stats - 챌린지 통계 조회
export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        certifications: true
      }
    });

    // 기본 통계
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    
    // 진행률 통계
    const progressStats = challenges.map(challenge => {
      const startDate = parseDateString(challenge.startDate);
      const endDate = parseDateString(challenge.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const certifiedDays = challenge.certifications.length;
      const progress = Math.round((certifiedDays / totalDays) * 100);
      return { challenge, progress };
    });

    const averageProgress = progressStats.length > 0 
      ? Math.round(progressStats.reduce((sum: number, item) => sum + item.progress, 0) / progressStats.length)
      : 0;

    // 카테고리별 통계
    const categoryStats = challenges.reduce((acc: Record<string, number>, challenge) => {
      acc[challenge.category] = (acc[challenge.category] || 0) + 1;
      return acc;
    }, {});

    // 최근 인증 활동 (최근 7일)
    const today = new Date();
    const recentCertifications = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayCertifications = challenges.reduce((count, challenge) => {
        return count + challenge.certifications.filter(cert => 
          parseDateString(cert.date).toISOString().split('T')[0] === dateString
        ).length;
      }, 0);
      
      recentCertifications.push({
        date: dateString,
        count: dayCertifications
      });
    }

    // 연속 인증 통계
    const getStreakStats = () => {
      const allCertifications = challenges.flatMap(challenge => 
        challenge.certifications.map(cert => ({
          challengeId: challenge.id,
          challengeName: challenge.name,
          date: parseDateString(cert.date).toISOString().split('T')[0]
        }))
      );

      // 날짜별로 그룹화
      const certificationsByDate = allCertifications.reduce((acc, cert) => {
        if (!acc[cert.date]) {
          acc[cert.date] = [];
        }
        acc[cert.date].push(cert);
        return acc;
      }, {} as Record<string, typeof allCertifications>);

      // 최근 연속 인증 계산
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      const sortedDates = Object.keys(certificationsByDate).sort();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
        
        if (prevDate) {
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        
        maxStreak = Math.max(maxStreak, tempStreak);
      }
      
      // 현재 연속 인증 계산 (오늘부터 역순으로)
      const todayString = today.toISOString().split('T')[0];
      let checkDate = new Date(today);
      
      while (true) {
        const dateString = checkDate.toISOString().split('T')[0];
        if (certificationsByDate[dateString]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return { currentStreak, maxStreak };
    };

    const { currentStreak, maxStreak } = getStreakStats();

    // 총 인증 수 계산
    const totalCertifications = challenges.reduce((sum, challenge) => 
      sum + challenge.certifications.length, 0
    );

    return NextResponse.json({
      total: totalChallenges,
      active: activeChallenges,
      completed: completedChallenges,
      averageProgress,
      totalCertifications,
      categoryStats,
      recentCertifications,
      streakStats: {
        currentStreak,
        longestStreak: maxStreak
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 