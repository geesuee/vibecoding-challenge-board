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

    switch (method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (id) {
    // 특정 챌린지 조회
    const challenge = await prisma.challenge.findUnique({
      where: { id: String(id) },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    return res.status(200).json(challenge);
  } else {
    // 모든 챌린지 조회
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(challenges);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, category, description, startDate, endDate, image, tasks } = req.body;

  if (!name || !category || !description || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const challenge = await prisma.challenge.create({
    data: {
      name,
      category,
      description,
      startDate,
      endDate,
      image: image || null,
      tasks: tasks || [],
      progress: 0,
      status: 'active',
      certifications: JSON.stringify({}),
    },
  });

  return res.status(201).json(challenge);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Challenge ID is required' });
  }

  const challenge = await prisma.challenge.update({
    where: { id: String(id) },
    data: updateData,
  });

  return res.status(200).json(challenge);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Challenge ID is required' });
  }

  await prisma.challenge.delete({
    where: { id: String(id) },
  });

  return res.status(204).end();
} 