import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스에 초기 데이터를 추가합니다...');

  // 기존 데이터 삭제
  await prisma.certification.deleteMany();
  await prisma.challenge.deleteMany();

  // 카테고리별 기본 이미지 URL (프론트엔드에서 선택 가능한 카테고리만)
  const categoryImages = {
    '학습': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    '건강': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    '독서': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    '라이프스타일': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    '소셜': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop',
    '기타': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
  };

  // 날짜를 YYYY-MM-DD 형식의 문자열로 변환하는 함수
  const createDateString = (dateString: string) => {
    return dateString; // 이미 YYYY-MM-DD 형식
  };

  // 현재 날짜 기준으로 날짜 계산
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // 샘플 챌린지 데이터 (5개로 줄임)
  const sampleChallenges = [
    {
      name: '매일 30분 운동하기',
      category: '건강',
      description: '매일 30분씩 운동하여 건강한 습관을 만들어보세요. 걷기, 조깅, 홈트레이닝 등 어떤 운동이든 좋습니다.',
      startDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`),
      endDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`),
      status: 'active',
      image: categoryImages['건강'],
      tasks: JSON.stringify(['스트레칭 5분', '유산소 운동 20분', '근력 운동 5분'])
    },
    {
      name: '매일 독서하기',
      category: '독서',
      description: '매일 30분씩 책을 읽어 지식을 쌓고 독서 습관을 만들어보세요.',
      startDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`),
      endDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`),
      status: 'active',
      image: categoryImages['독서'],
      tasks: JSON.stringify(['독서 30분', '독서 노트 작성', '인상 깊은 문장 메모'])
    },
    {
      name: '매일 알고리즘 문제 풀기',
      category: '학습',
      description: '매일 알고리즘 문제를 풀어 코딩 실력을 향상시켜보세요.',
      startDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`),
      endDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`),
      status: 'active',
      image: categoryImages['학습'],
      tasks: JSON.stringify(['백준 문제 1개', '코드 리뷰', '시간 복잡도 분석'])
    },
    {
      name: '매일 감사 일기 쓰기',
      category: '라이프스타일',
      description: '매일 감사한 일들을 기록하며 긍정적인 마음을 기르세요.',
      startDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`),
      endDate: createDateString(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`),
      status: 'active',
      image: categoryImages['라이프스타일'],
      tasks: JSON.stringify(['감사한 일 3가지', '감사한 사람', '감사한 순간'])
    },
    {
      name: '매일 명상하기',
      category: '라이프스타일',
      description: '매일 10분씩 명상을 통해 마음의 평화를 찾아보세요.',
      startDate: createDateString(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`),
      endDate: createDateString(`${currentYear}-${String(currentMonth).padStart(2, '0')}-31`),
      status: 'completed',
      image: categoryImages['라이프스타일'],
      tasks: JSON.stringify(['호흡 명상 5분', '마음 챙김 명상 3분', '감사 명상 2분'])
    }
  ];

  // 챌린지 생성
  for (const challengeData of sampleChallenges) {
    const challenge = await prisma.challenge.create({
      data: challengeData
    });
    console.log(`✅ 챌린지 생성: ${challenge.name} (${challenge.category}) - 상태: ${challenge.status}`);
  }

  // 인증 데이터 생성
  const challenges = await prisma.challenge.findMany();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // 오늘 날짜 (시간 제거)
  
  for (const challenge of challenges) {
    // 완료된 챌린지만 인증 데이터 생성
    if (challenge.status === 'completed') {
      const dbStartDate = new Date(challenge.startDate);
      const dbEndDate = new Date(challenge.endDate);
      
      console.log(`🔍 챌린지 날짜 확인: ${challenge.name}`);
      console.log(`   DB 시작일: ${dbStartDate.toISOString().split('T')[0]}`);
      console.log(`   DB 종료일: ${dbEndDate.toISOString().split('T')[0]}`);
      
      // 완료된 챌린지의 기간에 대해 80-95% 인증 (현실적인 완료율)
      const currentDate = new Date(dbStartDate);
      let dayCount = 0;
      const totalDays = Math.ceil((dbEndDate.getTime() - dbStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const completionRate = Math.random() * 0.15 + 0.8; // 80-95% 완료율
      const targetDays = Math.floor(totalDays * completionRate);
      
      while (currentDate <= dbEndDate && dayCount < targetDays) {
        // 랜덤하게 인증 데이터 생성 (현실적인 패턴)
        if (Math.random() < completionRate) {
          const currentDateStr = currentDate.toISOString().split('T')[0];
          const todayStr = todayDate.toISOString().split('T')[0];
          
          // 오늘 날짜는 인증 데이터 생성하지 않음
          if (currentDateStr !== todayStr) {
            await prisma.certification.create({
              data: {
                challengeId: challenge.id,
                date: currentDateStr
              }
            });
            dayCount++;
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`✅ 완료된 챌린지 인증 데이터 생성: ${challenge.name} - ${dayCount}/${totalDays}일 완료 (${Math.round(dayCount/totalDays*100)}%)`);
    } else {
      // 진행중인 챌린지는 현재까지의 인증 데이터 생성 (현실적인 진행률)
      const dbStartDate = new Date(challenge.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dbStartDate <= today) {
        const currentDate = new Date(dbStartDate);
        let dayCount = 0;
        const totalDays = Math.ceil((today.getTime() - dbStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const progressRate = Math.random() * 0.3 + 0.4; // 40-70% 진행률
        
        while (currentDate <= today) {
          if (Math.random() < progressRate) {
            const currentDateStr = currentDate.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            
            // 오늘 날짜는 인증 데이터 생성하지 않음
            if (currentDateStr !== todayStr) {
              await prisma.certification.create({
                data: {
                  challengeId: challenge.id,
                  date: currentDateStr
                }
              });
              dayCount++;
            }
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`⏳ 진행중인 챌린지 인증 데이터 생성: ${challenge.name} - ${dayCount}/${totalDays}일 진행 (${Math.round(dayCount/totalDays*100)}%)`);
      } else {
        console.log(`⏳ 아직 시작하지 않은 챌린지: ${challenge.name}`);
      }
    }
  }

  console.log('✅ 초기 데이터 추가가 완료되었습니다!');
  console.log(`📊 총 ${challenges.length}개의 챌린지가 생성되었습니다.`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 추가 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 