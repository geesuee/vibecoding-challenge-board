import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();

// CORS 미들웨어 설정
const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true,
});

// CORS 헬퍼 함수
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 처리
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    switch (method) {
      case 'POST':
        await handleCertify(req, res, String(id));
        break;
      case 'DELETE':
        await handleUncertify(req, res, String(id));
        break;
      default:
        res.setHeader('Allow', ['POST', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleCertify(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { date } = req.body;
  
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  // 인증 데이터 업데이트
  const certifications = JSON.parse(challenge.certifications || '{}') as Record<string, boolean>;
  certifications[date] = true;

  // 진행률 계산
  const totalDays = Math.ceil(
    (new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const certifiedDays = Object.keys(certifications).filter(date => certifications[date]).length;
  const progress = Math.min(100, Math.round((certifiedDays / totalDays) * 100));

  const updatedChallenge = await prisma.challenge.update({
    where: { id },
    data: {
      certifications,
      progress,
      status: progress >= 100 ? 'completed' : 'active',
    },
  });

  return res.status(200).json(updatedChallenge);
}

async function handleUncertify(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { date } = req.body;
  
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  // 인증 데이터 업데이트
  const certifications = JSON.parse(challenge.certifications || '{}') as Record<string, boolean>;
  delete certifications[date];

  // 진행률 계산
  const totalDays = Math.ceil(
    (new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const certifiedDays = Object.keys(certifications).filter(date => certifications[date]).length;
  const progress = Math.min(100, Math.round((certifiedDays / totalDays) * 100));

  const updatedChallenge = await prisma.challenge.update({
    where: { id },
    data: {
      certifications: JSON.stringify(certifications),
      progress,
      status: progress >= 100 ? 'completed' : 'active',
    },
  });

  return res.status(200).json({ message: 'Certification removed successfully', challenge: updatedChallenge });
} 