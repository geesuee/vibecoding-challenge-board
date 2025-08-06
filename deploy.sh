#!/bin/bash

echo "🚀 Challenge Board 배포 시작..."

# 프론트엔드 배포
echo "📦 프론트엔드 배포 중..."
cd frontend

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npm run db:generate

# Vercel 배포
vercel --prod --yes

echo "✅ 배포 완료!"
echo "프론트엔드: $(vercel ls | grep challenge-board | awk '{print $2}')" 