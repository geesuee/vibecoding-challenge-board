# API 문서

챌린지 보드 백엔드 API 문서입니다.

## 기본 정보

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **인증**: 현재 미구현 (향후 JWT 토큰 기반 인증 예정)

## 데이터 모델

### Challenge
```typescript
interface Challenge {
  id: string;                    // 챌린지 고유 ID
  name: string;                  // 챌린지 이름
  category: string;              // 카테고리 (학습, 건강, 독서, 라이프스타일, 소셜, 기타)
  description: string;           // 챌린지 설명
  startDate: string;             // 시작 날짜 (YYYY-MM-DD)
  endDate: string;               // 종료 날짜 (YYYY-MM-DD)
  progress: number;              // 진행률 (0-100)
  status: 'active' | 'completed'; // 상태
  image?: string;                // 이미지 URL (선택사항)
  tasks: string[];               // 과제 목록
  certifications: Record<string, boolean>; // 인증 기록 (날짜: 인증여부)
}
```

### CreateChallengeData
```typescript
interface CreateChallengeData {
  name: string;                  // 챌린지 이름 (필수)
  category: string;              // 카테고리 (필수)
  description: string;           // 챌린지 설명 (필수)
  startDate: string;             // 시작 날짜 (필수)
  endDate: string;               // 종료 날짜 (필수)
  image?: string;                // 이미지 URL (선택사항)
  tasks: string[];               // 과제 목록 (필수, 최소 1개)
}
```

## 엔드포인트

### 1. 챌린지 목록 조회

**GET** `/challenges`

모든 챌린지를 조회합니다.

#### 응답
```json
{
  "challenges": [
    {
      "id": "1",
      "name": "매일 운동하기",
      "category": "건강",
      "description": "하루 30분씩 운동하여 건강한 몸 만들기",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "progress": 65,
      "status": "active",
      "image": "https://example.com/image.jpg",
      "tasks": ["스트레칭", "유산소 운동", "근력 운동"],
      "certifications": {
        "2024-01-01": true,
        "2024-01-02": true,
        "2024-01-03": false
      }
    }
  ]
}
```

#### 상태 코드
- `200`: 성공
- `500`: 서버 오류

---

### 2. 특정 챌린지 조회

**GET** `/challenges/:id`

특정 챌린지의 상세 정보를 조회합니다.

#### 경로 매개변수
- `id` (string): 챌린지 ID

#### 응답
```json
{
  "id": "1",
  "name": "매일 운동하기",
  "category": "건강",
  "description": "하루 30분씩 운동하여 건강한 몸 만들기",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "progress": 65,
  "status": "active",
  "image": "https://example.com/image.jpg",
  "tasks": ["스트레칭", "유산소 운동", "근력 운동"],
  "certifications": {
    "2024-01-01": true,
    "2024-01-02": true,
    "2024-01-03": false
  }
}
```

#### 상태 코드
- `200`: 성공
- `404`: 챌린지를 찾을 수 없음
- `500`: 서버 오류

---

### 3. 챌린지 생성

**POST** `/challenges`

새로운 챌린지를 생성합니다.

#### 요청 본문
```json
{
  "name": "매일 운동하기",
  "category": "건강",
  "description": "하루 30분씩 운동하여 건강한 몸 만들기",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "image": "https://example.com/image.jpg",
  "tasks": ["스트레칭", "유산소 운동", "근력 운동"]
}
```

#### 응답
```json
{
  "id": "1",
  "name": "매일 운동하기",
  "category": "건강",
  "description": "하루 30분씩 운동하여 건강한 몸 만들기",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "progress": 0,
  "status": "active",
  "image": "https://example.com/image.jpg",
  "tasks": ["스트레칭", "유산소 운동", "근력 운동"],
  "certifications": {}
}
```

#### 상태 코드
- `201`: 생성 성공
- `400`: 잘못된 요청 데이터
- `500`: 서버 오류

#### 검증 규칙
- `name`: 2-50자, 필수
- `category`: 유효한 카테고리, 필수
- `description`: 10-500자, 필수
- `startDate`: 오늘 이후 날짜, 필수
- `endDate`: startDate 이후 날짜, 필수
- `tasks`: 최소 1개 이상, 필수

---

### 4. 챌린지 수정

**PUT** `/challenges/:id`

기존 챌린지를 수정합니다.

#### 경로 매개변수
- `id` (string): 챌린지 ID

#### 요청 본문
```json
{
  "name": "매일 운동하기 (수정)",
  "description": "하루 30분씩 운동하여 건강한 몸 만들기 - 수정된 설명",
  "tasks": ["스트레칭", "유산소 운동", "근력 운동", "요가"]
}
```

#### 응답
```json
{
  "id": "1",
  "name": "매일 운동하기 (수정)",
  "category": "건강",
  "description": "하루 30분씩 운동하여 건강한 몸 만들기 - 수정된 설명",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "progress": 65,
  "status": "active",
  "image": "https://example.com/image.jpg",
  "tasks": ["스트레칭", "유산소 운동", "근력 운동", "요가"],
  "certifications": {
    "2024-01-01": true,
    "2024-01-02": true,
    "2024-01-03": false
  }
}
```

#### 상태 코드
- `200`: 수정 성공
- `400`: 잘못된 요청 데이터
- `404`: 챌린지를 찾을 수 없음
- `500`: 서버 오류

---

### 5. 챌린지 삭제

**DELETE** `/challenges/:id`

챌린지를 삭제합니다.

#### 경로 매개변수
- `id` (string): 챌린지 ID

#### 응답
```json
{
  "message": "챌린지가 성공적으로 삭제되었습니다."
}
```

#### 상태 코드
- `200`: 삭제 성공
- `404`: 챌린지를 찾을 수 없음
- `500`: 서버 오류

---

### 6. 챌린지 인증

**POST** `/challenges/:id/certify`

특정 날짜의 챌린지 인증을 추가합니다.

#### 경로 매개변수
- `id` (string): 챌린지 ID

#### 요청 본문
```json
{
  "date": "2024-01-01"
}
```

#### 응답
```json
{
  "message": "인증이 성공적으로 추가되었습니다.",
  "certifications": {
    "2024-01-01": true,
    "2024-01-02": true,
    "2024-01-03": false
  },
  "progress": 65
}
```

#### 상태 코드
- `200`: 인증 성공
- `400`: 잘못된 날짜 형식
- `404`: 챌린지를 찾을 수 없음
- `409`: 이미 인증된 날짜
- `500`: 서버 오류

---

### 7. 챌린지 인증 취소

**DELETE** `/challenges/:id/certify`

특정 날짜의 챌린지 인증을 취소합니다.

#### 경로 매개변수
- `id` (string): 챌린지 ID

#### 요청 본문
```json
{
  "date": "2024-01-01"
}
```

#### 응답
```json
{
  "message": "인증이 성공적으로 취소되었습니다.",
  "certifications": {
    "2024-01-01": false,
    "2024-01-02": true,
    "2024-01-03": false
  },
  "progress": 60
}
```

#### 상태 코드
- `200`: 인증 취소 성공
- `400`: 잘못된 날짜 형식
- `404`: 챌린지를 찾을 수 없음
- `500`: 서버 오류

## 에러 응답 형식

모든 에러 응답은 다음과 같은 형식을 따릅니다:

```json
{
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE",
    "details": {
      "field": "추가 정보"
    }
  }
}
```

### 일반적인 에러 코드
- `VALIDATION_ERROR`: 데이터 검증 실패
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `CONFLICT`: 리소스 충돌 (예: 중복 인증)
- `INTERNAL_ERROR`: 서버 내부 오류

## 예제 코드

### JavaScript/TypeScript

```typescript
// 챌린지 목록 조회
const getChallenges = async () => {
  const response = await fetch('http://localhost:3001/api/challenges');
  const data = await response.json();
  return data;
};

// 챌린지 생성
const createChallenge = async (challengeData) => {
  const response = await fetch('http://localhost:3001/api/challenges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(challengeData),
  });
  return response.json();
};

// 챌린지 인증
const certifyChallenge = async (id, date) => {
  const response = await fetch(`http://localhost:3001/api/challenges/${id}/certify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date }),
  });
  return response.json();
};
```

### cURL

```bash
# 챌린지 목록 조회
curl -X GET http://localhost:3001/api/challenges

# 챌린지 생성
curl -X POST http://localhost:3001/api/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "name": "매일 운동하기",
    "category": "건강",
    "description": "하루 30분씩 운동하기",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "tasks": ["스트레칭", "유산소 운동"]
  }'

# 챌린지 인증
curl -X POST http://localhost:3001/api/challenges/1/certify \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-01"}'
```

## 제한사항

- **요청 크기**: 최대 1MB
- **응답 크기**: 최대 10MB
- **요청 속도**: 분당 1000회 (향후 구현 예정)
- **동시 연결**: 최대 100개 (향후 구현 예정)

## 버전 관리

현재 API 버전: `v1`

향후 버전 변경 시 URL에 버전을 포함할 예정:
- `http://localhost:3001/api/v1/challenges`
- `http://localhost:3001/api/v2/challenges`

## 지원

API 관련 문의사항이 있으시면:
- GitHub Issues: [이슈 등록](https://github.com/your-repo/issues)
- 이메일: api-support@example.com 