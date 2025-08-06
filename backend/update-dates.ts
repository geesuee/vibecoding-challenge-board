import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateChallengeDates() {
  console.log('📅 챌린지 날짜를 현재 날짜에 맞게 업데이트합니다...');

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 3); // 3일 전부터 시작
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 28); // 28일 후 종료 (총 31일)

  // 모든 챌린지의 날짜를 업데이트
  const updatedChallenges = await prisma.challenge.updateMany({
    data: {
      startDate: startDate,
      endDate: endDate,
      status: 'active' // 다시 활성 상태로 변경
    }
  });

  console.log(`✅ ${updatedChallenges.count}개의 챌린지 날짜가 업데이트되었습니다.`);
  console.log(`📅 시작일: ${startDate.toISOString().split('T')[0]}`);
  console.log(`📅 종료일: ${endDate.toISOString().split('T')[0]}`);
}

updateChallengeDates()
  .catch((e) => {
    console.error('❌ 날짜 업데이트 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 