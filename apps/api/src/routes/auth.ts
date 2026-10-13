import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { validateBody } from '../middleware/validate';
import { requireAuth, signAccessToken, signRefreshToken, AuthedRequest } from '../middleware/auth';
import { createOtp, verifyOtp, normalizePhone } from '../services/otp';

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  password: z.string().min(8),
  otp: z.string().length(6),
});

authRouter.post('/otp/request', validateBody(z.object({
  phone: z.string().min(10),
  purpose: z.enum(['login', 'register', 'reset']),
})), async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;
    const normalized = normalizePhone(phone);
    if (purpose === 'register') {
      const existing = await User.findOne({ phone: normalized });
      if (existing) return res.status(409).json({ error: 'This mobile number is already registered. Please login.' });
    }
    if (purpose === 'login') {
      const existing = await User.findOne({ phone: normalized });
      if (!existing) return res.status(404).json({ error: 'No account found with this mobile number. Please register first.' });
    }
    const { otp } = await createOtp(phone, purpose);
    res.json({
      message: `OTP sent successfully to +91 ${normalized}`,
      otp,
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { fullName, phone, email, password, otp } = req.body;
    const normalized = normalizePhone(phone);
    const ok = await verifyOtp(normalized, otp, 'register');
    if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      phone: normalized,
      email,
      passwordHash,
      role: 'customer',
    });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.status(201).json({
      user: { id: user._id, fullName: user.fullName, phone: user.phone, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const normalized = normalizePhone(req.body.phone);
    const user = await User.findOne({ phone: normalized });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.isDisabled) return res.status(403).json({ error: 'Account disabled' });
    res.json({
      user: { id: user._id, fullName: user.fullName, phone: user.phone, email: user.email, role: user.role },
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login/otp', validateBody(z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
})), async (req, res, next) => {
  try {
    const normalized = normalizePhone(req.body.phone);
    const ok = await verifyOtp(normalized, req.body.otp, 'login');
    if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const user = await User.findOne({ phone: normalized });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.isDisabled) return res.status(403).json({ error: 'Account disabled' });
    res.json({
      user: { id: user._id, fullName: user.fullName, phone: user.phone, email: user.email, role: user.role },
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const u = req.user!;
  res.json({
    id: u._id,
    fullName: u.fullName,
    phone: u.phone,
    email: u.email,
    role: u.role,
    collegeOrHostel: u.collegeOrHostel,
  });
});

authRouter.patch('/me', requireAuth, validateBody(z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  collegeOrHostel: z.string().optional(),
})), async (req: AuthedRequest, res, next) => {
  try {
    const u = req.user!;
    Object.assign(u, req.body);
    await u.save();
    res.json({ id: u._id, fullName: u.fullName, phone: u.phone, email: u.email, role: u.role });
  } catch (e) {
    next(e);
  }
});
