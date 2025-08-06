# Challenge Board

챌린지 관리 웹 애플리케이션입니다.

## 배포 가이드 (Vercel)

### 1. 데이터베이스 설정

1. [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 또는 [Neon](https://neon.tech/)에서 PostgreSQL 데이터베이스를 생성합니다.

2. 데이터베이스 URL을 복사합니다.

### 2. Vercel 배포

1. [Vercel](https://vercel.com)에 로그인합니다.

2. "New Project"를 클릭하고 GitHub 저장소를 연결합니다.

3. 프로젝트 설정에서 다음 환경 변수를 추가합니다:
   - `DATABASE_URL`: PostgreSQL 데이터베이스 URL
   - `NEXT_PUBLIC_API_URL`: 배포된 도메인 URL (예: `https://your-app.vercel.app/api`)

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
cp .env.example .env.local
# .env.local 파일에서 DATABASE_URL을 설정

# 데이터베이스 마이그레이션
npx prisma db push

# 개발 서버 시작
npm run dev
```

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions, Prisma
- **Database**: PostgreSQL
- **Deployment**: Vercel
