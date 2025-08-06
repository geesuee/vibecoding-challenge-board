# Challenge Board

챌린지 관리 애플리케이션입니다. 사용자가 개인적인 챌린지를 생성하고 진행 상황을 추적할 수 있습니다.

## 🏗️ 아키텍처

- **프론트엔드**: Next.js 15 (App Router)
- **백엔드**: Vercel API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **스타일링**: Tailwind CSS

## �� 배포

이 프로젝트는 Vercel과 Supabase를 사용하여 배포됩니다:

### 빠른 배포

```bash
# 1. Supabase 프로젝트 생성 후 환경 변수 설정
# 2. 배포 실행
./deploy.sh
```

### 수동 배포

1. **Supabase 설정**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - Database > Settings에서 연결 정보 확인

2. **환경 변수 설정**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **데이터베이스 마이그레이션**
   ```bash
   cd frontend
   npx prisma db push
   npx prisma db seed
   ```

4. **배포**
   ```bash
   cd frontend
   vercel --prod
   ```

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정

`frontend/env.example`을 참조하여 `.env.local` 파일을 생성하세요:

```env
# Supabase Database URLs
DATABASE_URL="postgres://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
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
│   │   └── supabase.ts   # Supabase 클라이언트
│   ├── prisma/           # 데이터베이스 스키마
│   └── src/              # 소스 코드
├── vercel.json           # Vercel 배포 설정
├── deploy.sh             # 배포 스크립트
├── DEPLOYMENT.md         # 배포 가이드
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

## 🚀 배포 스크립트

### 자동 배포
```bash
./deploy.sh
```

### 수동 배포
```bash
cd frontend
npm run deploy
```

## 📝 라이선스

MIT License 