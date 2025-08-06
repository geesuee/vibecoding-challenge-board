import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 카테고리별 기본 이미지
const DEFAULT_IMAGES = {
  '학습': 'https://readdy.ai/api/search-image?query=modern%20minimalist%20study%20workspace%20with%20books%20laptop%20and%20coffee%20cup%20on%20clean%20desk%20bright%20natural%20lighting%20professional%20education%20concept%20simple%20clean%20background&width=400&height=240&seq=study_default&orientation=landscape',
  '건강': 'https://readdy.ai/api/search-image?query=healthy%20lifestyle%20fitness%20concept%20with%20yoga%20mat%20dumbbells%20water%20bottle%20fresh%20fruits%20clean%20minimalist%20background%20wellness%20motivation&width=400&height=240&seq=health_default&orientation=landscape',
  '독서': 'https://readdy.ai/api/search-image?query=cozy%20reading%20corner%20with%20stack%20of%20books%20open%20novel%20warm%20lighting%20comfortable%20chair%20soft%20background%20literary%20atmosphere%20peaceful&width=400&height=240&seq=reading_default&orientation=landscape',
  '라이프스타일': 'https://readdy.ai/api/search-image?query=minimal%20lifestyle%20aesthetic%20clean%20organized%20space%20plants%20notebook%20coffee%20cup%20natural%20light%20simple%20living%20concept%20modern%20interior&width=400&height=240&seq=lifestyle_default&orientation=landscape',
  '소셜': 'https://readdy.ai/api/search-image?query=social%20networking%20connection%20concept%20modern%20workspace%20with%20multiple%20phones%20tablets%20coffee%20cups%20natural%20lighting%20collaborative%20atmosphere%20clean%20minimalist%20background&width=400&height=240&seq=social_default&orientation=landscape',
  '기타': 'https://readdy.ai/api/search-image?query=creative%20inspiration%20workspace%20with%20notebook%20pencils%20paper%20coffee%20cup%20natural%20lighting%20minimalist%20desk%20setup%20modern%20clean%20background%20productivity%20concept&width=400&height=240&seq=other_default&orientation=landscape'
};

const sampleChallenges = [
  {
    name: '매일 30분 독서하기',
    category: '독서',
    description: '하루 30분씩 책을 읽어서 한 달에 3권의 책을 완독하는 챌린지입니다. 독서 습관을 만들어 지식과 상상력을 키워보세요.',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'active',
    image: DEFAULT_IMAGES['독서'],
    tasks: JSON.stringify([
      '매일 30분 이상 독서하기',
      '독서 노트 작성하기',
      '주 1회 독서 후기 작성하기',
      '월말 독서 목표 달성 확인하기'
    ])
  },
  {
    name: '매일 운동하기',
    category: '건강',
    description: '하루 20분씩 운동을 해서 건강한 몸을 만들어보는 챌린지입니다. 꾸준한 운동으로 체력과 면역력을 향상시켜보세요.',
    startDate: '2025-08-05',
    endDate: '2025-09-04',
    status: 'active',
    image: DEFAULT_IMAGES['건강'],
    tasks: JSON.stringify([
      '매일 20분 이상 운동하기',
      '스트레칭과 워밍업 필수',
      '주 3회 이상 근력 운동',
      '운동 일지 작성하기'
    ])
  },
  {
    name: '코딩 공부하기',
    category: '학습',
    description: '매일 1시간씩 프로그래밍을 공부해서 새로운 기술을 습득하는 챌린지입니다. 실습과 이론을 병행하여 실력을 키워보세요.',
    startDate: '2025-08-01',
    endDate: '2025-08-30',
    status: 'active',
    image: DEFAULT_IMAGES['학습'],
    tasks: JSON.stringify([
      '매일 1시간 코딩 공부하기',
      '주 3회 이상 실습 프로젝트',
      '새로운 기술 스택 학습하기',
      '코딩 일지 작성하기'
    ])
  },
  {
    name: '정리정돈 습관 만들기',
    category: '라이프스타일',
    description: '매일 10분씩 정리정돈을 해서 깔끔한 생활환경을 만들어보는 챌린지입니다. 작은 습관이 큰 변화를 만들어냅니다.',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'active',
    image: DEFAULT_IMAGES['라이프스타일'],
    tasks: JSON.stringify([
      '매일 10분 정리정돈하기',
      '주말 대청소하기',
      '불필요한 물건 정리하기',
      '정리 노하우 기록하기'
    ])
  },
  {
    name: '친구들과 연락하기',
    category: '소셜',
    description: '주 3회 이상 친구들과 연락을 취해서 관계를 돈독히 하는 챌린지입니다. 소통의 기회를 만들어보세요.',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'active',
    image: DEFAULT_IMAGES['소셜'],
    tasks: JSON.stringify([
      '주 3회 이상 친구 연락하기',
      '새로운 사람과 대화하기',
      '소셜 활동 참여하기',
      '관계 개선 노력하기'
    ])
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 기존 데이터 삭제
  await prisma.certification.deleteMany();
  await prisma.challenge.deleteMany();

  console.log('🗑️  Cleared existing data');

  // 샘플 챌린지 생성
  for (const challengeData of sampleChallenges) {
    const challenge = await prisma.challenge.create({
      data: challengeData
    });

    console.log(`✅ Created challenge: ${challenge.name}`);

    // 일부 챌린지에 인증 데이터 추가
    if (challenge.name === '매일 30분 독서하기') {
      // 8월 1일부터 6일까지 인증
      for (let i = 1; i <= 6; i++) {
        await prisma.certification.create({
          data: {
            challengeId: challenge.id,
            date: `2025-08-0${i}`
          }
        });
      }
      console.log(`📚 Added certifications for reading challenge`);
    }

    if (challenge.name === '매일 운동하기') {
      // 8월 5일부터 6일까지 인증
      for (let i = 5; i <= 6; i++) {
        await prisma.certification.create({
          data: {
            challengeId: challenge.id,
            date: `2025-08-0${i}`
          }
        });
      }
      console.log(`💪 Added certifications for exercise challenge`);
    }
  }

  console.log('🎉 Database seeding completed!');
  console.log(`📊 Created ${sampleChallenges.length} challenges with sample data`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 