import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { plansRouter } from './routes/plans';
import { settingsRouter } from './routes/settings';
import { addressesRouter } from './routes/addresses';
import { subscriptionsRouter } from './routes/subscriptions';
import { paymentsRouter } from './routes/payments';
import { ordersRouter } from './routes/orders';
import { holidaysRouter } from './routes/holidays';
import { supportRouter } from './routes/support';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/plans', plansRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/subscriptions', subscriptionsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/holidays', holidaysRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/admin', adminRouter);

  app.use(errorHandler);
  return app;
}
