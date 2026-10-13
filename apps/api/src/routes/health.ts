import { Router } from 'express';
import { dbReadyState } from '../db';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  const dbConnected = dbReadyState() === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});
