import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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

// GET /api/challenges/:id - 특정 챌린지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        certifications: true
      }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // 종료일이 지났으면 상태를 'completed'로 업데이트
    const today = new Date();
    const endDate = parseDateString(challenge.endDate);
    let updatedStatus = challenge.status;
    
    if (endDate < today && challenge.status === 'active') {
      // 상태를 'completed'로 업데이트
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { status: 'completed' }
      });
      updatedStatus = 'completed';
      console.log(`✅ 챌린지 상태 업데이트: ${challenge.name} -> completed`);
    }

    const startDate = parseDateString(challenge.startDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const certifiedDays = challenge.certifications.length;
    const progress = Math.round((certifiedDays / totalDays) * 100);

    const response = {
      ...challenge,
      status: updatedStatus,
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
      certifications: challenge.certifications && challenge.certifications.length > 0 
        ? challenge.certifications.reduce((acc: Record<string, boolean>, cert) => {
            acc[formatDateToKST(parseDateString(cert.date))] = true;
            return acc;
          }, {})
        : {}
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
  }
}

// PUT /api/challenges/:id - 챌린지 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, description, startDate, endDate, tasks, status } = body;

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

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}

// DELETE /api/challenges/:id - 챌린지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Attempting to delete challenge with ID:', id);

    // 먼저 챌린지가 존재하는지 확인
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!existingChallenge) {
      console.log('Challenge not found:', id);
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
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
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    
    // Prisma 에러 타입에 따른 구체적인 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
      }
      if (error.message.includes('Invalid ID')) {
        return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 