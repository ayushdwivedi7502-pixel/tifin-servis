import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 500;
  res.status(status).json({
    error: config.nodeEnv === 'production' && status === 500 ? 'Internal server error' : message,
  });
}
