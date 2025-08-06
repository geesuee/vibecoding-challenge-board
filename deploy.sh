#!/bin/bash

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Challenge Board 배포 시작..."

# 현재 디렉토리 확인
if [ ! -d "frontend" ]; then
    echo "❌ frontend 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# 프론트엔드 디렉토리로 이동
cd frontend

echo "📦 의존성 설치 중..."
npm install

echo "🔧 Prisma 클라이언트 생성 중..."
npm run db:generate

echo "🧪 빌드 테스트 중..."
npm run build

echo "🚀 Vercel 배포 중..."
vercel --prod --yes

echo "✅ 배포 완료!"
echo "🌐 배포 URL: $(vercel ls | grep challenge-board | awk '{print $2}')"

echo ""
echo "📋 다음 단계:"
echo "1. Vercel 대시보드에서 환경 변수 설정 확인"
echo "2. Supabase 연결 테스트"
echo "3. 애플리케이션 동작 확인" 