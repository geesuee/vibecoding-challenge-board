import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import challengeRoutes from '../src/routes/challenges';

const app = express();
const prisma = new PrismaClient();

// 미들웨어
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 라우트
app.use('/api/challenges', challengeRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({ message: 'Challenge Board API', status: 'OK' });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app; 