# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인합니다.
2. "New Project"를 클릭합니다.
3. 프로젝트 이름을 입력하고 데이터베이스 비밀번호를 설정합니다.
4. 프로젝트를 생성합니다.

## 2. 환경 변수 설정

1. Supabase 프로젝트 대시보드에서 "Settings" > "API"로 이동합니다.
2. 다음 정보를 복사합니다:
   - Project URL
   - anon public key

3. `frontend` 디렉토리에서 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Prisma 데이터베이스 설정 (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
DIRECT_CONNECTION=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
TRANSACTION_POOLER=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# API 설정
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 3. 데이터베이스 연결 정보 확인

1. Supabase 대시보드에서 "Settings" > "Database"로 이동합니다.
2. "Connection string" 섹션에서 다음 정보를 확인합니다:
   - Host: `db.[YOUR-PROJECT-REF].supabase.co`
   - Database: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: 프로젝트 생성 시 설정한 비밀번호

## 4. 테이블 생성 및 데이터 삽입

### 방법 1: 자동 스크립트 사용 (권장)

```bash
# Supabase 연결 테스트 및 테이블 생성
npm run supabase:setup

# 또는 Prisma를 사용한 설정
npm run db:setup
```

### 방법 2: 수동 설정

1. **Prisma 클라이언트 생성:**
   ```bash
   npm run db:generate
   ```

2. **데이터베이스 스키마 푸시:**
   ```bash
   npm run db:push
   ```

3. **샘플 데이터 삽입:**
   ```bash
   npm run db:seed
   ```

## 5. 연결 테스트

```bash
# Supabase 연결 테스트
npm run supabase:test
```

## 6. 개발 서버 시작

```bash
npm run dev
```

## 문제 해결

### 환경 변수 오류
- `.env.local` 파일이 올바르게 생성되었는지 확인
- 환경 변수 값이 정확한지 확인

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성 상태인지 확인
- 데이터베이스 비밀번호가 올바른지 확인
- 방화벽 설정 확인

### 테이블 생성 오류
- Supabase RLS(Row Level Security) 설정 확인
- 데이터베이스 권한 확인

## 추가 설정

### RLS(Row Level Security) 설정

Supabase 대시보드에서 각 테이블에 대해 RLS를 활성화하고 적절한 정책을 설정할 수 있습니다:

```sql
-- challenges 테이블에 대한 정책
CREATE POLICY "Enable read access for all users" ON challenges
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON challenges
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- certifications 테이블에 대한 정책
CREATE POLICY "Enable read access for all users" ON certifications
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON certifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### API 키 설정

프로덕션 환경에서는 서비스 롤 키를 사용하는 것을 권장합니다:

1. Supabase 대시보드에서 "Settings" > "API"로 이동
2. "service_role" 키를 복사
3. 환경 변수에 추가:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
``` 