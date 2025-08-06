# Vercel 배포 가이드

## 1. 데이터베이스 설정

### 옵션 1: Vercel Postgres (권장)
1. Vercel 대시보드에서 프로젝트 생성
2. Storage 탭에서 Postgres 데이터베이스 생성
3. 환경 변수에 `DATABASE_URL` 추가

### 옵션 2: PlanetScale
1. [PlanetScale](https://planetscale.com)에서 계정 생성
2. 새 데이터베이스 생성
3. 연결 문자열을 `DATABASE_URL` 환경 변수로 설정

### 옵션 3: Supabase
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. Database > Settings > Connection string에서 연결 문자열 복사
3. `DATABASE_URL` 환경 변수로 설정

## 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```
DATABASE_URL=your_postgres_connection_string
CORS_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

## 3. 배포 방법

### 방법 1: Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 백엔드 디렉토리로 이동
cd backend

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동
1. GitHub에 코드 푸시
2. Vercel 대시보드에서 GitHub 저장소 연결
3. 자동 배포 설정

## 4. 프론트엔드 연동

프론트엔드의 API 호출 URL을 백엔드 배포 URL로 변경:

```typescript
// frontend/src/lib/api.ts 또는 관련 파일에서
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.vercel.app';
```

## 5. 데이터베이스 마이그레이션

배포 후 데이터베이스 마이그레이션을 실행해야 합니다:

```bash
# Vercel Functions에서 실행
npx prisma db push
npx prisma generate
```

## 6. 문제 해결

### 일반적인 문제들:
1. **CORS 오류**: `CORS_ORIGIN` 환경 변수 확인
2. **데이터베이스 연결 오류**: `DATABASE_URL` 형식 확인
3. **빌드 오류**: TypeScript 컴파일 오류 확인

### 로그 확인:
- Vercel 대시보드 > Functions > 로그 확인
- `vercel logs` 명령어로 로그 확인 