import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function requireEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '5000', 10),
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/tiffin_platform'),
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-min-32-characters-long'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-min-32-characters-long'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  otpExpiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES ?? '10', 10),
  devOtpStatic: process.env.DEV_OTP_STATIC ?? '123456',
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? 'mock') as 'mock' | 'razorpay',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  tz: process.env.TZ ?? 'Asia/Kolkata',
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@demo.local',
    adminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
    adminPhone: process.env.SEED_ADMIN_PHONE ?? '9999999999',
  },
};
