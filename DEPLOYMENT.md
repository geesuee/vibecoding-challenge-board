# Challenge Board 배포 가이드

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 생성 후 Database > Settings에서 연결 정보를 확인합니다.

### 1.2 환경 변수 설정
Supabase 프로젝트에서 다음 정보를 가져와서 Vercel 환경 변수로 설정합니다:

```bash
# Vercel CLI로 환경 변수 설정
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 1.3 데이터베이스 마이그레이션
```bash
cd frontend
npx prisma db push
npx prisma db seed
```

## 2. Vercel 배포

### 2.1 Vercel CLI 설치
```bash
npm i -g vercel
```

### 2.2 로그인
```bash
vercel login
```

### 2.3 배포 실행
```bash
# 자동 배포 스크립트 사용
./deploy.sh

# 또는 수동 배포
cd frontend
vercel --prod
```

## 3. 환경 변수 설정

### 3.1 Supabase 환경 변수
- `DATABASE_URL`: Supabase PostgreSQL 연결 문자열
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키

### 3.2 Vercel 대시보드에서 설정
1. Vercel 프로젝트 대시보드 접속
2. Settings > Environment Variables
3. 위의 환경 변수들을 추가

## 4. 배포 확인

### 4.1 배포 상태 확인
```bash
vercel ls
```

### 4.2 로그 확인
```bash
vercel logs
```

## 5. 문제 해결

### 5.1 데이터베이스 연결 오류
- DATABASE_URL이 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 5.2 빌드 오류
- `npm run build` 로컬에서 테스트
- 환경 변수가 올바르게 설정되었는지 확인

### 5.3 Prisma 오류
```bash
cd frontend
npx prisma generate
npx prisma db push
``` 