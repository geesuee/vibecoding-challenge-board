const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function insertSampleData() {
  console.log('📝 샘플 데이터 삽입 시작...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 기존 데이터 확인
    const { data: existingChallenges } = await supabase
      .from('challenges')
      .select('*');
    
    if (existingChallenges && existingChallenges.length > 0) {
      console.log('✅ 이미 샘플 데이터가 존재합니다.');
      console.log('현재 챌린지:', existingChallenges.map(c => c.name));
      return;
    }
    
    // 샘플 챌린지 데이터
    const sampleChallenges = [
      {
        name: '매일 운동하기',
        category: '건강',
        description: '하루 30분씩 운동하여 건강한 습관을 만들어보세요.',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        tasks: JSON.stringify([
          { id: 1, name: '스트레칭', completed: false },
          { id: 2, name: '유산소 운동', completed: false },
          { id: 3, name: '근력 운동', completed: false }
        ])
      },
      {
        name: '독서 습관 만들기',
        category: '학습',
        description: '하루 30분씩 책을 읽어 지식을 쌓아보세요.',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        tasks: JSON.stringify([
          { id: 1, name: '독서 계획 세우기', completed: false },
          { id: 2, name: '독서 노트 작성', completed: false },
          { id: 3, name: '독서 토론 참여', completed: false }
        ])
      },
      {
        name: '코딩 연습하기',
        category: '개발',
        description: '매일 코딩 문제를 풀어 프로그래밍 실력을 향상시켜보세요.',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
        tasks: JSON.stringify([
          { id: 1, name: '알고리즘 문제 풀기', completed: false },
          { id: 2, name: '코드 리뷰 참여', completed: false },
          { id: 3, name: '새로운 기술 학습', completed: false }
        ])
      },
      {
        name: '정리정돈 습관 만들기',
        category: '라이프스타일',
        description: '매일 10분씩 정리정돈을 해서 깔끔한 생활환경을 만들어보세요.',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
        tasks: JSON.stringify([
          { id: 1, name: '매일 10분 정리정돈', completed: false },
          { id: 2, name: '주말 대청소', completed: false },
          { id: 3, name: '불필요한 물건 정리', completed: false }
        ])
      },
      {
        name: '친구들과 연락하기',
        category: '소셜',
        description: '주 3회 이상 친구들과 연락을 취해서 관계를 돈독히 하는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
        tasks: JSON.stringify([
          { id: 1, name: '주 3회 이상 친구 연락', completed: false },
          { id: 2, name: '새로운 사람과 대화', completed: false },
          { id: 3, name: '소셜 활동 참여', completed: false }
        ])
      }
    ];
    
    // 챌린지 데이터 삽입
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .insert(sampleChallenges)
      .select();
    
    if (challengesError) {
      console.error('❌ 챌린지 데이터 삽입 실패:', challengesError);
      return;
    }
    
    console.log('✅ 샘플 챌린지 데이터 삽입 완료');
    console.log('삽입된 챌린지:', challengesData.map(c => c.name));
    
    // 샘플 인증 데이터
    const sampleCertifications = [
      {
        challengeId: challengesData[0].id,
        date: '2024-01-15'
      },
      {
        challengeId: challengesData[0].id,
        date: '2024-01-16'
      },
      {
        challengeId: challengesData[0].id,
        date: '2024-01-17'
      },
      {
        challengeId: challengesData[1].id,
        date: '2024-01-15'
      },
      {
        challengeId: challengesData[1].id,
        date: '2024-01-16'
      },
      {
        challengeId: challengesData[2].id,
        date: '2024-01-15'
      }
    ];
    
    // 인증 데이터 삽입
    const { data: certificationsData, error: certificationsError } = await supabase
      .from('certifications')
      .insert(sampleCertifications)
      .select();
    
    if (certificationsError) {
      console.error('❌ 인증 데이터 삽입 실패:', certificationsError);
      return;
    }
    
    console.log('✅ 샘플 인증 데이터 삽입 완료');
    console.log('삽입된 인증 개수:', certificationsData.length);
    
    console.log('🎉 모든 샘플 데이터 삽입 완료!');
    
  } catch (error) {
    console.error('❌ 샘플 데이터 삽입 실패:', error.message);
  }
}

insertSampleData().catch(console.error); 