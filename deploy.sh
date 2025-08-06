#!/bin/bash

echo "🚀 Challenge Board 배포 시작..."

# 백엔드 배포
echo "📦 백엔드 배포 중..."
cd backend

# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# Vercel 배포
vercel --prod --yes

# 배포 URL 가져오기
BACKEND_URL=$(vercel ls | grep challenge-board-backend | awk '{print $2}')

echo "✅ 백엔드 배포 완료: $BACKEND_URL"

# 프론트엔드 배포
echo "📦 프론트엔드 배포 중..."
cd ../frontend

# 환경 변수 설정
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.local

# 의존성 설치
npm install

# Vercel 배포
vercel --prod --yes

echo "✅ 배포 완료!"
echo "백엔드: $BACKEND_URL"
echo "프론트엔드: $(vercel ls | grep challenge-board-frontend | awk '{print $2}')" 