# Challenge Board

챌린지 관리 웹 애플리케이션입니다. 개인적인 목표와 챌린지를 설정하고, 진행 상황을 추적하며, 성취를 인증할 수 있는 플랫폼입니다.

## 🚀 주요 기능

- **챌린지 생성 및 관리**: 개인 목표를 챌린지로 설정하고 관리
- **진행 상황 추적**: 챌린지별 진행률을 시각적으로 확인
- **인증 시스템**: 챌린지 완료 시 인증 기능
- **캘린더 뷰**: 챌린지 진행 상황을 캘린더로 확인
- **필터링 및 검색**: 활성/완료된 챌린지 필터링
- **실시간 알림**: 작업 완료 시 실시간 알림

## 🏗️ 프로젝트 구조

```
challenge-board/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                 # Next.js 15 App Router
│   ├── components/          # React 컴포넌트
│   ├── hooks/              # 커스텀 React 훅
│   ├── lib/                # 유틸리티 함수
│   ├── api/                # API 라우트
│   └── prisma/             # 데이터베이스 스키마
├── backend/                 # Express.js 백엔드
│   ├── src/                # 소스 코드
│   ├── routes/             # API 라우트
│   └── prisma/             # 데이터베이스 스키마
└── vercel.json             # Vercel 배포 설정
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Database ORM**: Prisma

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Production), SQLite (Development)

### DevOps
- **Deployment**: Vercel
- **Database**: Vercel Postgres / Neon
- **Version Control**: Git

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd challenge-board
```

### 2. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXT_PUBLIC_API_URL="http://localhost:3002/api"
```

### 3. Backend 설정

```bash
cd ../backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3000"
```

### 4. 데이터베이스 설정

```bash
# Frontend 디렉토리에서
cd frontend
npx prisma generate
npx prisma db push

# Backend 디렉토리에서
cd ../backend
npx prisma generate
npx prisma db push
```

### 5. 개발 서버 실행

```bash
# Backend 서버 실행 (포트 3002)
cd backend
npm run dev

# Frontend 서버 실행 (포트 3000)
cd ../frontend
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🚀 배포

### Vercel 배포

1. **데이터베이스 설정**
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 또는 [Neon](https://neon.tech/)에서 PostgreSQL 데이터베이스 생성
   - 데이터베이스 URL 복사

2. **Vercel 프로젝트 생성**
   - [Vercel](https://vercel.com)에 로그인
   - GitHub 저장소 연결
   - 환경 변수 설정:
     - `DATABASE_URL`: PostgreSQL 데이터베이스 URL
     - `NEXT_PUBLIC_API_URL`: 배포된 도메인 URL

3. **배포**
   - "Deploy" 클릭
   - 배포 후 Vercel 대시보드에서 데이터베이스 마이그레이션 실행:
     ```bash
     npx prisma db push
     ```

## 📚 API 문서

### 챌린지 API

- `GET /api/challenges` - 모든 챌린지 조회
- `POST /api/challenges` - 새 챌린지 생성
- `GET /api/challenges/:id` - 특정 챌린지 조회
- `PUT /api/challenges/:id` - 챌린지 수정
- `DELETE /api/challenges/:id` - 챌린지 삭제
- `POST /api/challenges/:id/certify` - 챌린지 인증
- `GET /api/challenges/stats` - 챌린지 통계

## 🗄️ 데이터베이스 스키마

### Challenge 모델
```prisma
model Challenge {
  id            String   @id @default(cuid())
  name          String
  category      String
  description   String
  startDate     String
  endDate       String
  progress      Int      @default(0)
  status        String   @default("active")
  image         String?
  tasks         String   // JSON string
  certifications String  // JSON string
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Certification 모델
```prisma
model Certification {
  id          String    @id @default(cuid())
  challengeId String
  date        String
  createdAt   DateTime  @default(now())
  
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  
  @@unique([challengeId, date])
}
```

## 🧪 개발 가이드라인

### 개발 원칙
1. **SOLID 원칙** 준수
2. **Clean Architecture** 패턴 적용
3. **TDD (Test-Driven Development)** 방식으로 개발
4. 파일과 함수는 최대한 작은 단위로 분리

### 개발 프로세스
1. **테스트 코드 작성** → **코딩** → **테스트 실행** → **에러 수정** 반복
2. 태스크 완료 시 전체 테스트 실행 및 에러 수정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요. 