# Challenge Board

챌린지 관리 웹 애플리케이션입니다. 목표를 설정하고 일일 인증을 통해 습관을 만들어가는 플랫폼입니다.

## 주요 기능

- ✅ **챌린지 생성 및 관리**: 다양한 카테고리의 챌린지를 생성하고 관리
- 📅 **캘린더 기반 인증**: 월별 캘린더에서 일일 인증 현황을 시각적으로 확인
- 📊 **진행률 추적**: 챌린지별 진행률을 실시간으로 확인
- 🎯 **상태 관리**: 진행중/완료 상태를 자동으로 관리
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 최적화된 경험

## 배포 가이드 (Vercel)

### 1. 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 PostgreSQL 데이터베이스를 생성합니다.
2. 데이터베이스 연결 정보를 복사합니다.

### 2. Vercel 배포

1. [Vercel](https://vercel.com)에 로그인합니다.
2. "New Project"를 클릭하고 GitHub 저장소를 연결합니다.
3. 프로젝트 설정에서 다음 환경 변수를 추가합니다:
   - `DATABASE_URL`: Supabase PostgreSQL 데이터베이스 URL
   - `DIRECT_CONNECTION`: Supabase 직접 연결 URL
   - `TRANSACTION_POOLER`: Supabase 연결 풀 URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
   - `NEXT_PUBLIC_API_URL`: `/api` (상대 경로)

4. "Deploy"를 클릭합니다.

### 3. 데이터베이스 마이그레이션

배포 후 Vercel 대시보드에서 Functions 탭으로 이동하여 다음 명령을 실행합니다:

```bash
npx prisma db push
```

### 4. 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env.local
# .env.local 파일에서 Supabase 설정을 추가

# 개발 서버 시작
npm run dev
```

### 5. 데이터베이스 초기화

로컬에서 데이터베이스를 초기화하려면:

```bash
curl -X POST http://localhost:3000/api/reset
```

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions, Prisma
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## 프로젝트 구조

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   └── challenge/         # 챌린지 상세 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── hooks/                 # 커스텀 React 훅
└── prisma/               # 데이터베이스 스키마
```

## 라이센스

MIT License
