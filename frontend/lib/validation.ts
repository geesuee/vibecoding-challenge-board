export interface ValidationError {
  field: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ChallengeFormData {
  name: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  image: string;
  tasks?: string[];
}

// XSS 방지를 위한 HTML 태그 제거
export const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').trim();
};

// 특수 문자 및 이모지 필터링
export const sanitizeText = (text: string): string => {
  return text.replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ.,!?-]/g, '').trim();
};

// 챌린지 이름 검증
export const validateChallengeName = (name: string): ValidationError | null => {
  const sanitizedName = sanitizeInput(name);
  
  if (!sanitizedName) {
    return { field: 'name', message: '챌린지 이름을 입력해주세요.', severity: 'error' };
  }
  
  if (sanitizedName.length < 2) {
    return { field: 'name', message: '챌린지 이름은 2자 이상이어야 합니다.', severity: 'error' };
  }
  
  if (sanitizedName.length > 50) {
    return { field: 'name', message: '챌린지 이름은 50자 이하여야 합니다.', severity: 'error' };
  }
  
  // 연속된 공백 체크
  if (/\s{2,}/.test(sanitizedName)) {
    return { field: 'name', message: '연속된 공백은 사용할 수 없습니다.', severity: 'warning' };
  }
  
  // 특수 문자 과다 사용 체크
  const specialCharCount = (sanitizedName.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCharCount > sanitizedName.length * 0.3) {
    return { field: 'name', message: '특수 문자를 과도하게 사용하지 마세요.', severity: 'warning' };
  }
  
  return null;
};

// 챌린지 설명 검증
export const validateChallengeDescription = (description: string): ValidationError | null => {
  const sanitizedDescription = sanitizeInput(description);
  
  if (sanitizedDescription.length > 500) {
    return { field: 'description', message: '챌린지 설명은 500자 이하여야 합니다.', severity: 'error' };
  }
  
  // 연속된 공백 체크
  if (/\s{3,}/.test(sanitizedDescription)) {
    return { field: 'description', message: '연속된 공백은 사용할 수 없습니다.', severity: 'warning' };
  }
  
  // 줄바꿈 개수 체크
  const lineBreakCount = (sanitizedDescription.match(/\n/g) || []).length;
  if (lineBreakCount > 10) {
    return { field: 'description', message: '줄바꿈을 과도하게 사용하지 마세요.', severity: 'warning' };
  }
  
  return null;
};

// 카테고리 검증
export const validateCategory = (category: string): ValidationError | null => {
  const validCategories = ['학습', '건강', '독서', '라이프스타일', '소셜', '기타'];
  
  if (!category) {
    return { field: 'category', message: '카테고리를 선택해주세요.', severity: 'error' };
  }
  
  if (!validCategories.includes(category)) {
    return { field: 'category', message: '유효한 카테고리를 선택해주세요.', severity: 'error' };
  }
  
  return null;
};

// 날짜 검증
export const validateDates = (startDate: string, endDate: string): ValidationError | null => {
  if (!startDate) {
    return { field: 'startDate', message: '시작 날짜를 선택해주세요.', severity: 'error' };
  }
  
  if (!endDate) {
    return { field: 'endDate', message: '종료 날짜를 선택해주세요.', severity: 'error' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 날짜 유효성 체크
  if (isNaN(start.getTime())) {
    return { field: 'startDate', message: '유효한 시작 날짜를 입력해주세요.', severity: 'error' };
  }
  
  if (isNaN(end.getTime())) {
    return { field: 'endDate', message: '유효한 종료 날짜를 입력해주세요.', severity: 'error' };
  }

  if (start < today) {
    return { field: 'startDate', message: '시작 날짜는 오늘 이후여야 합니다.', severity: 'error' };
  }
  
  if (end <= start) {
    return { field: 'endDate', message: '종료 날짜는 시작 날짜보다 늦어야 합니다.', severity: 'error' };
  }
  
  // 최대 기간 체크 (1년)
  const maxEndDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (end > maxEndDate) {
    return { field: 'endDate', message: '종료 날짜는 1년 이내여야 합니다.', severity: 'error' };
  }
  
  // 최소 기간 체크 (1일)
  const minEndDate = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  if (end < minEndDate) {
    return { field: 'endDate', message: '최소 1일 이상의 기간이 필요합니다.', severity: 'error' };
  }
  
  return null;
};

// 이미지 URL 검증
export const validateImageUrl = (imageUrl: string): ValidationError | null => {
  if (!imageUrl.trim()) {
    return { field: 'image', message: '이미지 URL을 입력해주세요.', severity: 'error' };
  }
  
  try {
    const url = new URL(imageUrl);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { field: 'image', message: '유효한 이미지 URL을 입력해주세요.', severity: 'error' };
    }
    
    // 허용된 도메인 체크 (선택사항)
    const allowedDomains = [
      'readdy.ai',
      'images.unsplash.com',
      'picsum.photos'
    ];
    
    const domain = url.hostname;
    if (!allowedDomains.some(allowed => domain.includes(allowed))) {
      return { field: 'image', message: '신뢰할 수 있는 이미지 서비스의 URL을 사용해주세요.', severity: 'warning' };
    }
    
    // URL 길이 체크
    if (imageUrl.length > 500) {
      return { field: 'image', message: '이미지 URL이 너무 깁니다.', severity: 'warning' };
    }
    
  } catch {
    return { field: 'image', message: '유효한 이미지 URL을 입력해주세요.', severity: 'error' };
  }
  
  return null;
};

// 과제 검증
export const validateTasks = (tasks: string[]): ValidationError | null => {
  if (!tasks || tasks.length === 0) {
    return { field: 'tasks', message: '최소 1개의 과제를 입력해주세요.', severity: 'error' };
  }
  
  if (tasks.length > 3) {
    return { field: 'tasks', message: '과제는 최대 3개까지 입력할 수 있습니다.', severity: 'error' };
  }
  
  for (let i = 0; i < tasks.length; i++) {
    const task = sanitizeInput(tasks[i]);
    
    if (!task) {
      return { field: `tasks[${i}]`, message: `과제 ${i + 1}을 입력해주세요.`, severity: 'error' };
    }
    
    if (task.length < 2) {
      return { field: `tasks[${i}]`, message: `과제 ${i + 1}은 2자 이상이어야 합니다.`, severity: 'error' };
    }
    
    if (task.length > 100) {
      return { field: `tasks[${i}]`, message: `과제 ${i + 1}은 100자 이하여야 합니다.`, severity: 'error' };
    }
  }
  
  return null;
};

// 전체 폼 검증
export const validateChallengeForm = (data: ChallengeFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  const nameError = validateChallengeName(data.name);
  if (nameError) errors.push(nameError);

  const descriptionError = validateChallengeDescription(data.description);
  if (descriptionError) errors.push(descriptionError);

  const categoryError = validateCategory(data.category);
  if (categoryError) errors.push(categoryError);

  const datesError = validateDates(data.startDate, data.endDate);
  if (datesError) errors.push(datesError);

  const imageError = validateImageUrl(data.image);
  if (imageError) errors.push(imageError);

  if (data.tasks) {
    const tasksError = validateTasks(data.tasks);
    if (tasksError) errors.push(tasksError);
  }

  return errors;
};

// 실시간 검증을 위한 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 에러 메시지 포맷팅
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => error.message).join('\n');
};

// 필드별 에러 찾기
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(err => err.field === field);
  return error ? error.message : null;
};

// 경고 수준의 에러만 필터링
export const getWarnings = (errors: ValidationError[]): ValidationError[] => {
  return errors.filter(error => error.severity === 'warning');
};

// 심각한 에러만 필터링
export const getErrors = (errors: ValidationError[]): ValidationError[] => {
  return errors.filter(error => error.severity === 'error');
};

// 폼 제출 가능 여부 확인
export const isFormValid = (errors: ValidationError[]): boolean => {
  return errors.filter(error => error.severity === 'error').length === 0;
};

// 입력 데이터 정제
export const sanitizeFormData = (data: ChallengeFormData): ChallengeFormData => {
  return {
    name: sanitizeInput(data.name),
    description: sanitizeInput(data.description),
    category: data.category,
    startDate: data.startDate,
    endDate: data.endDate,
    image: data.image.trim(),
    tasks: data.tasks?.map(task => sanitizeInput(task))
  };
}; 