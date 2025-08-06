import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 카테고리별 기본 이미지
const DEFAULT_IMAGES = {
  '학습': 'https://readdy.ai/api/search-image?query=modern%20minimalist%20study%20workspace%20with%20books%20laptop%20and%20coffee%20cup%20on%20clean%20desk%20bright%20natural%20lighting%20professional%20education%20concept%20simple%20clean%20background&width=400&height=240&seq=study_default&orientation=landscape',
  '건강': 'https://readdy.ai/api/search-image?query=healthy%20lifestyle%20fitness%20concept%20with%20yoga%20mat%20dumbbells%20water%20bottle%20fresh%20fruits%20clean%20minimalist%20background%20wellness%20motivation&width=400&height=240&seq=health_default&orientation=landscape',
  '독서': 'https://readdy.ai/api/search-image?query=cozy%20reading%20corner%20with%20stack%20of%20books%20open%20novel%20warm%20lighting%20comfortable%20chair%20soft%20background%20literary%20atmosphere%20peaceful&width=400&height=240&seq=reading_default&orientation=landscape',
  '라이프스타일': 'https://readdy.ai/api/search-image?query=minimal%20lifestyle%20aesthetic%20clean%20organized%20space%20plants%20notebook%20coffee%20cup%20natural%20light%20simple%20living%20concept%20modern%20interior&width=400&height=240&seq=lifestyle_default&orientation=landscape',
  '소셜': 'https://readdy.ai/api/search-image?query=social%20networking%20connection%20concept%20modern%20workspace%20with%20multiple%20phones%20tablets%20coffee%20cups%20natural%20lighting%20collaborative%20atmosphere%20clean%20minimalist%20background&width=400&height=240&seq=social_default&orientation=landscape',
  '기타': 'https://readdy.ai/api/search-image?query=creative%20inspiration%20workspace%20with%20notebook%20pencils%20paper%20coffee%20cup%20natural%20lighting%20minimalist%20desk%20setup%20modern%20clean%20background%20productivity%20concept&width=400&height=240&seq=other_default&orientation=landscape'
};

// 날짜 문자열을 Date 객체로 변환하는 헬퍼 함수
const parseDateString = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
};

// GET /api/challenges - 모든 챌린지 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        certifications: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 진행률 계산
    const challengesWithProgress = challenges.map(challenge => {
      const startDate = parseDateString(challenge.startDate);
      const endDate = parseDateString(challenge.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const certifiedDays = challenge.certifications.length;
      const progress = Math.round((certifiedDays / totalDays) * 100);

      // 날짜를 YYYY-MM-DD 형식으로 변환 (UTC 기준으로 저장된 날짜 처리)
      const formatDateToKST = (date: Date) => {
        // UTC 기준으로 저장된 날짜를 한국 시간대로 변환
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
        return kstDate.toISOString().split('T')[0];
      };

      return {
        ...challenge,
        startDate: formatDateToKST(startDate),
        endDate: formatDateToKST(endDate),
        tasks: (() => {
          try {
            return JSON.parse(challenge.tasks || '[]');
          } catch (error) {
            console.error('Error parsing tasks for challenge:', challenge.id, error);
            return [];
          }
        })(),
        progress,
        certifications: challenge.certifications.reduce((acc: Record<string, boolean>, cert) => {
          acc[formatDateToKST(parseDateString(cert.date))] = true;
          return acc;
        }, {})
      };
    });

    res.json(challengesWithProgress);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// GET /api/challenges/stats - 챌린지 통계 조회
router.get('/stats', async (req: Request, res: Response) => {
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

    res.json({
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
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatDateToKST = (date: Date) => {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date object');
  }
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return kstDate.toISOString().split('T')[0];
};

// 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
const createDateOnly = (dateString: string): string => {
  try {
    // YYYY-MM-DD 형식인지 확인
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
    }
    
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date parsing error:', error);
    throw new Error(`Failed to parse date: ${dateString}`);
  }
};

// POST /api/challenges - 새 챌린지 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, description, startDate, endDate, tasks } = req.body;

    // 기본 이미지 설정
    const image = DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_IMAGES['기타'];

    const challenge = await prisma.challenge.create({
      data: {
        name,
        category,
        description,
        startDate: createDateOnly(startDate),
        endDate: createDateOnly(endDate),
        image,
        tasks: JSON.stringify(Array.isArray(tasks) ? tasks : [])
      }
    });

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// PUT /api/challenges/:id - 챌린지 수정
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, startDate, endDate, tasks, status } = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        name,
        category,
        description,
        startDate: startDate ? createDateOnly(startDate) : undefined,
        endDate: endDate ? createDateOnly(endDate) : undefined,
        tasks: tasks ? JSON.stringify(tasks) : undefined,
        status
      }
    });

    res.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// GET /api/challenges/:id - 특정 챌린지 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        certifications: true
      }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const startDate = parseDateString(challenge.startDate);
    const endDate = parseDateString(challenge.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const certifiedDays = challenge.certifications.length;
    const progress = Math.round((certifiedDays / totalDays) * 100);

    const response = {
      ...challenge,
      startDate: formatDateToKST(startDate),
      endDate: formatDateToKST(endDate),
      tasks: (() => {
        try {
          return JSON.parse(challenge.tasks || '[]');
        } catch (error) {
          console.error('Error parsing tasks for challenge:', challenge.id, error);
          return [];
        }
      })(),
      progress,
      certifications: challenge.certifications.reduce((acc: Record<string, boolean>, cert) => {
        acc[formatDateToKST(parseDateString(cert.date))] = true;
        return acc;
      }, {})
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// POST /api/challenges/:id/certify - 인증 추가
router.post('/:id/certify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    console.log('Certification request:', { id, date, body: req.body });

    // 날짜 검증
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const certificationDate = createDateOnly(date);

    console.log('Processed certification date:', certificationDate);

    // 챌린지 존재 확인
    const challenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // 중복 인증 확인
    const existingCertification = await prisma.certification.findUnique({
      where: {
        challengeId_date: {
          challengeId: id,
          date: certificationDate
        }
      }
    });

    if (existingCertification) {
      return res.status(400).json({ error: 'Certification already exists for this date' });
    }

    const certification = await prisma.certification.create({
      data: {
        challengeId: id,
        date: certificationDate
      }
    });

    console.log('Certification created:', certification);

    res.status(201).json(certification);
  } catch (error) {
    console.error('Error creating certification:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid date')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Failed to parse date')) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

// DELETE /api/challenges/:id/certify - 인증 삭제
router.delete('/:id/certify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    // 날짜 검증
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const certificationDate = createDateOnly(date);

    const certification = await prisma.certification.delete({
      where: {
        challengeId_date: {
          challengeId: id,
          date: certificationDate
        }
      }
    });

    res.json(certification);
  } catch (error) {
    console.error('Error deleting certification:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid date')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Failed to parse date')) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// DELETE /api/challenges/:id - 챌린지 삭제
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('Attempting to delete challenge with ID:', id);

    // 먼저 챌린지가 존재하는지 확인
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!existingChallenge) {
      console.log('Challenge not found:', id);
      return res.status(404).json({ error: 'Challenge not found' });
    }

    console.log('Deleting certifications for challenge:', id);
    await prisma.certification.deleteMany({
      where: { challengeId: id }
    });

    console.log('Deleting challenge:', id);
    await prisma.challenge.delete({
      where: { id }
    });

    console.log('Challenge deleted successfully:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting challenge:', error);
    
    // Prisma 에러 타입에 따른 구체적인 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
      if (error.message.includes('Invalid ID')) {
        return res.status(400).json({ error: 'Invalid challenge ID' });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to delete challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 