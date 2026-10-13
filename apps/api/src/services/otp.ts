import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OtpSession } from '../models/OtpSession';
import { config } from '../config';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  throw new Error('Invalid phone number');
}

export async function createOtp(
  phone: string,
  purpose: 'login' | 'register' | 'reset'
): Promise<{ normalized: string; otp: string }> {
  const normalized = normalizePhone(phone);
  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + config.otpExpiresMinutes * 60 * 1000);
  await OtpSession.deleteMany({ phone: normalized, purpose });
  await OtpSession.create({ phone: normalized, otpHash, expiresAt, purpose });
  console.log(`[OTP SENT] phone=${normalized} purpose=${purpose} otp=${otp}`);
  return { normalized, otp };
}

export async function verifyOtp(
  phone: string,
  otp: string,
  purpose: 'login' | 'register' | 'reset'
): Promise<boolean> {
  const normalized = normalizePhone(phone);
  // Check against static dev OTP if defined
  if (config.devOtpStatic && otp === config.devOtpStatic) {
    return true;
  }
  const session = await OtpSession.findOne({ phone: normalized, purpose }).sort({ createdAt: -1 });
  if (!session || session.expiresAt < new Date()) return false;
  const ok = await bcrypt.compare(otp, session.otpHash);
  if (ok) await OtpSession.deleteMany({ phone: normalized, purpose });
  return ok;
}

export { normalizePhone };
