import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수 (한국 시간대 기준)
const createDateOnly = (dateString: string): string => {
  try {
    // YYYY-MM-DD 형식인지 확인
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
    }
    
    // 한국 시간대로 날짜 생성 (UTC+9)
    const [year, month, day] = dateString.split('-').map(Number);
    const koreaDate = new Date(year, month - 1, day, 12, 0, 0, 0); // 정오 시간으로 설정하여 시간대 문제 방지
    
    return koreaDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date parsing error:', error);
    throw new Error(`Failed to parse date: ${dateString}`);
  }
};

// POST /api/challenges/:id/certify - 인증 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date } = body;

    console.log('Certification request:', { id, date, body });

    // 날짜 검증
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const certificationDate = createDateOnly(date);

    console.log('Processed certification date:', certificationDate);

    // 챌린지 존재 확인
    const challenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Certification already exists for this date' }, { status: 400 });
    }

    const certification = await prisma.certification.create({
      data: {
        challengeId: id,
        date: certificationDate
      }
    });

    console.log('Certification created:', certification);

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid date')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Invalid date format')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Failed to parse date')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
  }
}

// DELETE /api/challenges/:id/certify - 인증 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date } = body;

    // 날짜 검증
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
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

    return NextResponse.json(certification);
  } catch (error) {
    console.error('Error deleting certification:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid date')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Invalid date format')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Failed to parse date')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
  }
} 