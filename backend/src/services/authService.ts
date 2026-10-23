import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { Session, ISession } from '../models/Session.js';
import { generateSessionToken, hashToken } from '../utils/jwt.js';
import { ENV } from '../config/env.js';

export class AuthService {
  static async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    role?: 'client' | 'admin' | 'superadmin';
  }): Promise<{ user: IUser; token: string; session: ISession }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      company: data.company,
      role: data.role || 'client',
      permissions: [],
      status: 'active',
    });

    const session = await this.createSession(user._id.toString());
    const token = generateSessionToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      role: user.role,
    });

    return { user, token, session };
  }

  static async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ipAddress?: string }
  ): Promise<{ user: IUser; token: string; session: ISession }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new Error('Your account is currently suspended or pending activation. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const session = await this.createSession(user._id.toString(), meta);
    const token = generateSessionToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      role: user.role,
    });

    return { user, token, session };
  }

  static async createSession(
    userId: string,
    meta?: { userAgent?: string; ipAddress?: string }
  ): Promise<ISession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ENV.SESSION_EXPIRY_DAYS);

    // Initial placeholder hash that gets updated
    const tokenHash = hashToken(`${userId}-${Date.now()}-${Math.random()}`);

    const session = await Session.create({
      userId,
      tokenHash,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      isRevoked: false,
      expiresAt,
      lastActiveAt: new Date(),
    });

    return session;
  }

  static async revokeSession(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, { isRevoked: true });
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await Session.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  }
}
