import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

// 진행률 계산 함수
const calculateProgress = (startDate: string, endDate: string, certifications: any[]): number => {
  try {
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    
    // 총 일수 계산 (시작일과 종료일 포함)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 인증된 일수 계산
    const certifiedDays = certifications.length;
    
    // 진행률 계산 (0-100 범위로 제한)
    const progress = Math.round((certifiedDays / totalDays) * 100);
    
    console.log('Progress calculation:', {
      startDate,
      endDate,
      totalDays,
      certifiedDays,
      progress
    });
    
    return Math.min(Math.max(progress, 0), 100);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

// GET /api/challenges - 모든 챌린지 조회
export async function GET() {
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
      const progress = calculateProgress(challenge.startDate, challenge.endDate, challenge.certifications);

      return {
        ...challenge,
        startDate: formatDateToKST(parseDateString(challenge.startDate)),
        endDate: formatDateToKST(parseDateString(challenge.endDate)),
        tasks: (() => {
          try {
            return JSON.parse(challenge.tasks || '[]');
          } catch (error) {
            console.error('Error parsing tasks for challenge:', challenge.id, error);
            return [];
          }
        })(),
        progress,
        certifications: challenge.certifications && challenge.certifications.length > 0 
          ? challenge.certifications.reduce((acc: Record<string, boolean>, cert: any) => {
              acc[formatDateToKST(parseDateString(cert.date))] = true;
              return acc;
            }, {})
          : {}
      };
    });

    return NextResponse.json(challengesWithProgress);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

// POST /api/challenges - 새 챌린지 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description, startDate, endDate, tasks } = body;

    // 기본 이미지 설정
    const image = DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_IMAGES['기타'];

    const challenge = await prisma.challenge.create({
      data: {
        name: String(name),
        category: String(category),
        description: String(description),
        startDate: createDateOnly(startDate),
        endDate: createDateOnly(endDate),
        image,
        tasks: JSON.stringify(Array.isArray(tasks) ? tasks : [])
      }
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
} 