# Challenge Board

챌린지 관리 애플리케이션입니다. 사용자가 개인적인 챌린지를 생성하고 진행 상황을 추적할 수 있습니다.

## 🏗️ 아키텍처

- **프론트엔드**: Next.js 15 (App Router)
- **백엔드**: Vercel API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **스타일링**: Tailwind CSS

## 🚀 배포

이 프로젝트는 Vercel에 최적화되어 있습니다:

1. Supabase 프로젝트 생성
2. 환경 변수 설정
3. Vercel에 배포

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Database URLs
DATABASE_URL="postgres://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres"

# API Base URL
NEXT_PUBLIC_API_URL="/api"
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 🔧 주요 기능

- ✅ 챌린지 생성 및 관리
- ✅ 일별 인증 시스템
- ✅ 진행률 추적
- ✅ 통계 대시보드
- ✅ 카테고리별 분류
- ✅ 반응형 디자인

## 📁 프로젝트 구조

```
challenge-board/
├── frontend/
│   ├── app/
│   │   ├── api/           # Vercel API Routes
│   │   ├── challenge/     # 챌린지 상세 페이지
│   │   └── dashboard/     # 대시보드 페이지
│   ├── components/        # React 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   ├── prisma/           # 데이터베이스 스키마
│   └── src/              # 소스 코드
├── vercel.json           # Vercel 배포 설정
└── README.md
```

## 🛠️ 개발 가이드

### API 엔드포인트

- `GET /api/challenges` - 모든 챌린지 조회
- `POST /api/challenges` - 새 챌린지 생성
- `GET /api/challenges/:id` - 특정 챌린지 조회
- `PUT /api/challenges/:id` - 챌린지 수정
- `DELETE /api/challenges/:id` - 챌린지 삭제
- `POST /api/challenges/:id/certify` - 인증 추가
- `DELETE /api/challenges/:id/certify` - 인증 삭제
- `GET /api/challenges/stats` - 통계 조회

### 데이터베이스 스키마

```prisma
model Challenge {
  id            String   @id @default(cuid())
  name          String
  category      String
  description   String
  startDate     String
  endDate       String
  status        String   @default("active")
  image         String?
  tasks         String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  certifications Certification[]
}

model Certification {
  id          String    @id @default(cuid())
  challengeId String
  date        String
  createdAt   DateTime  @default(now())
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  @@unique([challengeId, date])
}
```

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 배포 완료

### 환경 변수 설정 (Vercel)

- `DATABASE_URL`: Supabase 트랜잭션 모드 연결 문자열
- `DIRECT_URL`: Supabase 세션 모드 연결 문자열

## 📝 라이선스

MIT License 