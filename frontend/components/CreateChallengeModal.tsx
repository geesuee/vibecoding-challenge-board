
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Challenge } from '../src/lib/api';
import { 
  validateChallengeForm, 
  ValidationError, 
  getFieldError, 
  debounce,
  ChallengeFormData 
} from '../lib/validation';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: Omit<Challenge, 'id' | 'progress' | 'status' | 'certifications'>) => void;
  editingChallenge?: Challenge | null;
}

const CATEGORIES = ['학습', '건강', '독서', '라이프스타일', '소셜', '기타'];
const DURATIONS = ['7일', '14일', '21일', '30일', '60일', '90일', '사용자 입력'];

const DEFAULT_IMAGES = {
  '학습': 'https://readdy.ai/api/search-image?query=modern%20minimalist%20study%20workspace%20with%20books%20laptop%20and%20coffee%20cup%20on%20clean%20desk%20bright%20natural%20lighting%20professional%20education%20concept%20simple%20clean%20background&width=400&height=240&seq=study_default&orientation=landscape',
  '건강': 'https://readdy.ai/api/search-image?query=healthy%20lifestyle%20fitness%20concept%20with%20yoga%20mat%20dumbbells%20water%20bottle%20fresh%20fruits%20clean%20minimalist%20background%20wellness%20motivation&width=400&height=240&seq=health_default&orientation=landscape',
  '독서': 'https://readdy.ai/api/search-image?query=cozy%20reading%20corner%20with%20stack%20of%20books%20open%20novel%20warm%20lighting%20comfortable%20chair%20soft%20background%20literary%20atmosphere%20peaceful&width=400&height=240&seq=reading_default&orientation=landscape',
  '라이프스타일': 'https://readdy.ai/api/search-image?query=minimal%20lifestyle%20aesthetic%20clean%20organized%20space%20plants%20notebook%20coffee%20cup%20natural%20light%20simple%20living%20concept%20modern%20interior&width=400&height=240&seq=lifestyle_default&orientation=landscape',
  '소셜': 'https://readdy.ai/api/search-image?query=social%20networking%20connection%20concept%20modern%20workspace%20with%20multiple%20phones%20tablets%20coffee%20cups%20natural%20lighting%20collaborative%20atmosphere%20clean%20minimalist%20background&width=400&height=240&seq=social_default&orientation=landscape',
  '기타': 'https://readdy.ai/api/search-image?query=creative%20inspiration%20workspace%20with%20notebook%20pencils%20paper%20coffee%20cup%20natural%20lighting%20minimalist%20desk%20setup%20modern%20clean%20background%20productivity%20concept&width=400&height=240&seq=other_default&orientation=landscape'
};

// 카테고리별 이미지 매핑 함수
const getImageForCategory = (category: string): string => {
  // 기본 카테고리에 대한 이미지가 있으면 반환
  if (DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES]) {
    return DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES];
  }

  // 기본 카테고리에 없는 경우 기타 카테고리 이미지 반환
  return DEFAULT_IMAGES['기타'];
};

export default function CreateChallengeModal({ isOpen, onClose, onSave, editingChallenge }: CreateChallengeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '학습',
    description: '',
    startDate: '',
    endDate: '',
    duration: '사용자 입력',
    image: DEFAULT_IMAGES['학습'],
    tasks: ['']
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // 실시간 검증을 위한 디바운스된 검증 함수
  const debouncedValidate = useCallback(
    debounce((data: ChallengeFormData) => {
      const validationErrors = validateChallengeForm(data);
      setErrors(validationErrors);
    }, 300),
    []
  );

  // 폼 데이터가 변경될 때마다 실시간 검증
  useEffect(() => {
    if (touched.size > 0) {
      const formDataForValidation: ChallengeFormData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        image: formData.image
      };
      debouncedValidate(formDataForValidation);
    }
  }, [formData, touched, debouncedValidate]);

  // editingChallenge가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (editingChallenge) {
      const duration = getDurationFromDates(editingChallenge.startDate, editingChallenge.endDate);
      
      setFormData({
        name: editingChallenge.name,
        category: CATEGORIES.includes(editingChallenge.category) ? editingChallenge.category : '기타',
        description: editingChallenge.description,
        startDate: editingChallenge.startDate,
        endDate: editingChallenge.endDate,
        duration: duration,
        image: editingChallenge.image || getImageForCategory(editingChallenge.category),
        tasks: editingChallenge.tasks.length > 0 ? editingChallenge.tasks : ['']
      });
    } else {
      setFormData({
        name: '',
        category: '학습',
        description: '',
        startDate: '',
        endDate: '',
        duration: '사용자 입력',
        image: DEFAULT_IMAGES['학습'],
        tasks: ['']
      });
    }
    setErrors([]);
    setTouched(new Set());
  }, [editingChallenge]);

  // 필드 터치 처리
  const handleFieldTouch = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  // 필드별 에러 메시지 가져오기
  const getFieldErrorMessage = (field: string): string | null => {
    if (!touched.has(field)) return null;
    return getFieldError(errors, field);
  };

  // 필드 스타일 클래스
  const getFieldStyle = (field: string): string => {
    const hasError = getFieldErrorMessage(field);
    const baseStyle = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors";
    
    if (hasError) {
      return `${baseStyle} border-red-300 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseStyle} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
  };

  if (!isOpen) return null;

  const calculateEndDate = (start: string, duration: string) => {
    if (!start || duration === '사용자 입력') return '';

    const startDate = new Date(start);
    const days = parseInt(duration.replace('일', ''));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days - 1);

    return endDate.toISOString().split('T')[0];
  };

  const calculateStartDate = (end: string, duration: string) => {
    if (!end || duration === '사용자 입력') return '';

    const endDate = new Date(end);
    const days = parseInt(duration.replace('일', ''));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days + 1);

    return startDate.toISOString().split('T')[0];
  };

  const getDurationFromDates = (start: string, end: string) => {
    if (!start || !end) return '사용자 입력';

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const durationStr = `${diffDays}일`;
    return DURATIONS.includes(durationStr) ? durationStr : '사용자 입력';
  };

  const handleStartDateChange = (value: string) => {
    const newFormData = { ...formData, startDate: value };
    if (formData.endDate && value) {
      newFormData.duration = getDurationFromDates(value, formData.endDate);
    } else if (formData.duration !== '사용자 입력') {
      newFormData.endDate = calculateEndDate(value, formData.duration);
    }
    setFormData(newFormData);
    handleFieldTouch('startDate');
  };

  const handleEndDateChange = (value: string) => {
    const newFormData = { ...formData, endDate: value };
    if (formData.startDate && value) {
      newFormData.duration = getDurationFromDates(formData.startDate, value);
    } else if (formData.duration !== '사용자 입력') {
      newFormData.startDate = calculateStartDate(value, formData.duration);
    }
    setFormData(newFormData);
    handleFieldTouch('endDate');
  };

  const handleDurationChange = (value: string) => {
    const newFormData = { ...formData, duration: value };
    if (value !== '사용자 입력') {
      if (formData.startDate) {
        newFormData.endDate = calculateEndDate(formData.startDate, value);
      } else if (formData.endDate) {
        newFormData.startDate = calculateStartDate(formData.endDate, value);
      }
    }
    setFormData(newFormData);
  };

  const handleCategoryChange = (value: string) => {
    const newFormData = { ...formData, category: value };
    newFormData.image = getImageForCategory(value);
    
    setFormData(newFormData);
    handleFieldTouch('category');
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData({ ...formData, tasks: newTasks });
  };

  const addTask = () => {
    setFormData({ ...formData, tasks: [...formData.tasks, ''] });
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length > 1) {
      const newTasks = formData.tasks.filter((_, i) => i !== index);
      setFormData({ ...formData, tasks: newTasks });
    }
  };

  const isFormValid = () => {
    const validTasks = formData.tasks.filter(task => task.trim());
    
    const formDataForValidation: ChallengeFormData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      image: formData.image
    };
    
    const validationErrors = validateChallengeForm(formDataForValidation);
    return validationErrors.length === 0 && validTasks.length >= 1 && formData.category.trim() !== '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드를 터치된 상태로 설정
    setTouched(new Set(['name', 'description', 'category', 'startDate', 'endDate', 'image']));

    if (!isFormValid()) {
      // 즉시 검증 실행
      const formDataForValidation: ChallengeFormData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        image: formData.image
      };
      const validationErrors = validateChallengeForm(formDataForValidation);
      setErrors(validationErrors);
      return;
    }

    const validTasks = formData.tasks.filter(task => task.trim());

    onSave({
      name: formData.name,
      category: formData.category,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      image: formData.image,
      tasks: validTasks
    });

    onClose();
    setFormData({
      name: '',
      category: '학습',
      description: '',
      startDate: '',
      endDate: '',
      duration: '사용자 입력',
      image: DEFAULT_IMAGES['학습'],
      tasks: ['']
    });
    setErrors([]);
    setTouched(new Set());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingChallenge ? '챌린지 수정' : '새로운 챌린지 생성'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                챌린지명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  handleFieldTouch('name');
                }}
                onBlur={() => handleFieldTouch('name')}
                className={getFieldStyle('name')}
                placeholder="챌린지 이름을 입력하세요"
                required
              />
              {getFieldErrorMessage('name') && (
                <p className="text-red-500 text-xs mt-1">{getFieldErrorMessage('name')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  handleFieldTouch('description');
                }}
                onBlur={() => handleFieldTouch('description')}
                rows={3}
                maxLength={500}
                className={`${getFieldStyle('description')} resize-none`}
                placeholder="챌린지에 대한 설명을 입력하세요"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formData.description.length}/500</span>
                {getFieldErrorMessage('description') && (
                  <span className="text-red-500">{getFieldErrorMessage('description')}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      formData.category === category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* 사용자 입력 카테고리 필드 */}

              
              {getFieldErrorMessage('category') && (
                <p className="text-red-500 text-xs mt-1">{getFieldErrorMessage('category')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  onBlur={() => handleFieldTouch('startDate')}
                  className={getFieldStyle('startDate')}
                  required
                />
                {getFieldErrorMessage('startDate') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldErrorMessage('startDate')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  onBlur={() => handleFieldTouch('endDate')}
                  className={getFieldStyle('endDate')}
                  required
                />
                {getFieldErrorMessage('endDate') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldErrorMessage('endDate')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {DURATIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
              <div className="space-y-3">
                {/* 이미지 미리보기 */}
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="챌린지 이미지 미리보기"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGES['기타'];
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {formData.category} 카테고리 이미지
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  카테고리를 선택하면 자동으로 해당 카테고리의 기본 이미지가 적용됩니다.
                </p>
              </div>
              {getFieldErrorMessage('image') && (
                <p className="text-red-500 text-xs mt-1">{getFieldErrorMessage('image')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                과제 목록 <span className="text-red-500">*</span>
              </label>
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="챌린지 세부 과제를 입력하세요"
                  />
                  {formData.tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTask}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + 과제 추가
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFormValid()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {editingChallenge ? '수정' : '생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
