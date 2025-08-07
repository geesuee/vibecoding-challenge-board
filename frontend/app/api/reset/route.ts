import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// 카테고리별 기본 이미지
const DEFAULT_IMAGES = {
  '학습': 'https://readdy.ai/api/search-image?query=modern%20minimalist%20study%20workspace%20with%20books%20laptop%20and%20coffee%20cup%20on%20clean%20desk%20bright%20natural%20lighting%20professional%20education%20concept%20simple%20clean%20background&width=400&height=240&seq=study_default&orientation=landscape',
  '건강': 'https://readdy.ai/api/search-image?query=healthy%20lifestyle%20fitness%20concept%20with%20yoga%20mat%20dumbbells%20water%20bottle%20fresh%20fruits%20clean%20minimalist%20background%20wellness%20motivation&width=400&height=240&seq=health_default&orientation=landscape',
  '독서': 'https://readdy.ai/api/search-image?query=cozy%20reading%20corner%20with%20stack%20of%20books%20open%20novel%20warm%20lighting%20comfortable%20chair%20soft%20background%20literary%20atmosphere%20peaceful&width=400&height=240&seq=reading_default&orientation=landscape',
  '라이프스타일': 'https://readdy.ai/api/search-image?query=minimal%20lifestyle%20aesthetic%20clean%20organized%20space%20plants%20notebook%20coffee%20cup%20natural%20light%20simple%20living%20concept%20modern%20interior&width=400&height=240&seq=lifestyle_default&orientation=landscape',
  '소셜': 'https://readdy.ai/api/search-image?query=social%20networking%20connection%20concept%20modern%20workspace%20with%20multiple%20phones%20tablets%20coffee%20cups%20natural%20lighting%20collaborative%20atmosphere%20clean%20minimalist%20background&width=400&height=240&seq=social_default&orientation=landscape',
  '기타': 'https://readdy.ai/api/search-image?query=creative%20inspiration%20workspace%20with%20notebook%20pencils%20paper%20coffee%20cup%20natural%20lighting%20minimalist%20desk%20setup%20modern%20clean%20background%20productivity%20concept&width=400&height=240&seq=other_default&orientation=landscape'
};

export async function POST() {
  try {
    console.log('🗑️ 데이터베이스 초기화 시작...');
    
    // 기존 데이터 삭제
    await prisma.certification.deleteMany();
    await prisma.challenge.deleteMany();
    
    console.log('✅ 기존 데이터 삭제 완료');
    
    // 새로운 샘플 데이터 생성
    const sampleChallenges = [
      {
        name: '매일 독서하기',
        category: '독서',
        description: '하루 30분씩 책을 읽어 지식을 쌓고 마음을 성장시키는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2024-12-31', // 완료된 챌린지 (1개)
        status: 'completed',
        image: DEFAULT_IMAGES['독서'],
        tasks: JSON.stringify([
          { id: 1, name: '독서 계획 세우기', completed: true },
          { id: 2, name: '독서 노트 작성', completed: true },
          { id: 3, name: '매일 독서 시간 확보', completed: true }
        ])
      },
      {
        name: '운동 습관 만들기',
        category: '건강',
        description: '주 3회 이상 운동을 통해 건강한 몸과 마음을 만드는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2025-09-15', // 진행중인 챌린지
        status: 'active',
        image: DEFAULT_IMAGES['건강'],
        tasks: JSON.stringify([
          { id: 1, name: '운동 계획 수립', completed: true },
          { id: 2, name: '운동 장비 준비', completed: true },
          { id: 3, name: '매주 운동 일정 확인', completed: false }
        ])
      },
      {
        name: '영어 공부하기',
        category: '학습',
        description: '매일 영어 단어를 외우고 문법을 공부하여 영어 실력을 향상시키는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2025-10-20', // 진행중인 챌린지
        status: 'active',
        image: DEFAULT_IMAGES['학습'],
        tasks: JSON.stringify([
          { id: 1, name: '영어 학습 계획 세우기', completed: true },
          { id: 2, name: '단어장 준비', completed: true },
          { id: 3, name: '매일 단어 10개 외우기', completed: false }
        ])
      },
      {
        name: '정리 정돈 습관',
        category: '라이프스타일',
        description: '매일 10분씩 정리 정돈을 통해 깔끔한 생활 환경을 만드는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2025-11-30', // 진행중인 챌린지
        status: 'active',
        image: DEFAULT_IMAGES['라이프스타일'],
        tasks: JSON.stringify([
          { id: 1, name: '정리 정돈 계획 수립', completed: true },
          { id: 2, name: '정리 도구 준비', completed: false },
          { id: 3, name: '매일 정리 시간 확보', completed: false }
        ])
      },
      {
        name: '소셜 네트워킹',
        category: '소셜',
        description: '새로운 사람들을 만나고 네트워크를 확장하는 챌린지입니다.',
        startDate: '2024-01-01',
        endDate: '2025-12-31', // 진행중인 챌린지
        status: 'active',
        image: DEFAULT_IMAGES['소셜'],
        tasks: JSON.stringify([
          { id: 1, name: '소셜 이벤트 찾기', completed: false },
          { id: 2, name: '대화 주제 준비', completed: false },
          { id: 3, name: '매월 새로운 사람 만나기', completed: false }
        ])
      }
    ];
    
    // 챌린지 생성
    const createdChallenges = [];
    for (const challengeData of sampleChallenges) {
      const challenge = await prisma.challenge.create({
        data: challengeData
      });
      createdChallenges.push(challenge);
      console.log(`✅ 챌린지 생성: ${challenge.name}`);
    }
    
    // 완료된 챌린지에 인증 데이터 추가 (매일 인증했다고 가정)
    const completedChallenge = createdChallenges.find(c => c.status === 'completed');
    if (completedChallenge) {
      const startDate = new Date(completedChallenge.startDate);
      const endDate = new Date(completedChallenge.endDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        await prisma.certification.create({
          data: {
            challengeId: completedChallenge.id,
            date: d.toISOString().split('T')[0]
          }
        });
      }
      console.log(`✅ 완료된 챌린지 인증 데이터 추가: ${completedChallenge.name}`);
    }
    
    // 진행중인 챌린지들에 일부 인증 데이터 추가
    const activeChallenges = createdChallenges.filter(c => c.status === 'active');
    for (const challenge of activeChallenges) {
      const startDate = new Date(challenge.startDate);
      const today = new Date();
      
      // 시작일부터 오늘까지 랜덤하게 인증
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        // 70% 확률로 인증
        if (Math.random() < 0.7) {
          await prisma.certification.create({
            data: {
              challengeId: challenge.id,
              date: d.toISOString().split('T')[0]
            }
          });
        }
      }
      console.log(`✅ 진행중인 챌린지 인증 데이터 추가: ${challenge.name}`);
    }
    
    console.log('🎉 데이터베이스 초기화 완료!');
    console.log(`📊 총 ${createdChallenges.length}개의 챌린지 생성`);
    console.log(`✅ 완료된 챌린지: 1개`);
    console.log(`🔄 진행중인 챌린지: ${activeChallenges.length}개`);
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터베이스 초기화 완료',
      totalChallenges: createdChallenges.length,
      completedChallenges: 1,
      activeChallenges: activeChallenges.length
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    return NextResponse.json({ 
      success: false, 
      error: '데이터베이스 초기화 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 