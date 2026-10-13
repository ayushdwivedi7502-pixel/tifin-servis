import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models/User';
import type { UserRole } from '@tiffin/shared';

export interface AuthPayload {
  sub: string;
  role: UserRole;
}

export interface AuthedRequest extends Request {
  user?: IUser;
  auth?: AuthPayload;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthPayload;
    const user = await User.findById(payload.sub);
    if (!user || user.isDisabled) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    req.auth = payload;
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export function signAccessToken(user: IUser): string {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(user: IUser): string {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires as jwt.SignOptions['expiresIn'],
  });
}
