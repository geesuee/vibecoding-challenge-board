import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // 환경 변수 확인 (민감한 정보는 마스킹)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      DIRECT_CONNECTION: process.env.DIRECT_CONNECTION ? 'SET' : 'NOT_SET',
      TRANSACTION_POOLER: process.env.TRANSACTION_POOLER ? 'SET' : 'NOT_SET',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    };

    // 데이터베이스 연결 테스트
    let dbConnection = 'UNKNOWN';
    let dbError = null;
    
    try {
      await prisma.$connect();
      dbConnection = 'SUCCESS';
      
      // 간단한 쿼리 테스트
      const challengeCount = await prisma.challenge.count();
      dbConnection = `SUCCESS (${challengeCount} challenges found)`;
    } catch (error) {
      dbConnection = 'FAILED';
      dbError = error instanceof Error ? error.message : String(error);
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connection: dbConnection,
        error: dbError
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 