import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  sessionId: string;
  role: string;
}

export function generateSessionToken(payload: TokenPayload, expiresInDays: number = ENV.SESSION_EXPIRY_DAYS): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: `${expiresInDays}d`,
  });
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
