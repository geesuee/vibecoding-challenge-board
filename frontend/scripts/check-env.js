#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 환경 변수 검증 시작...\n');

// 필수 환경 변수 목록
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_CONNECTION', 
  'TRANSACTION_POOLER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// 환경 변수 확인
let allValid = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: NOT_SET`);
    allValid = false;
  } else {
    // 민감한 정보는 마스킹
    const maskedValue = envVar.includes('URL') || envVar.includes('KEY') 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
      : 'SET';
    console.log(`✅ ${envVar}: ${maskedValue}`);
  }
});

// Prisma 스키마 확인
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('\n📋 Prisma 스키마 파일 존재: ✅');
} else {
  console.log('\n❌ Prisma 스키마 파일 없음');
  allValid = false;
}

// package.json 확인
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageJson.dependencies['@prisma/client']) {
    console.log('📦 @prisma/client 의존성 확인: ✅');
  } else {
    console.log('❌ @prisma/client 의존성 없음');
    allValid = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 모든 검증 통과!');
  process.exit(0);
} else {
  console.log('❌ 일부 검증 실패');
  process.exit(1);
} 