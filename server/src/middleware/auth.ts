import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, hashToken } from '../utils/jwt.js';
import { Session, ISession } from '../models/Session.js';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  sessionRecord?: ISession;
}

export async function authenticateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookieToken = req.cookies?.auth_token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return next();
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.sessionId || !payload.userId) {
      return next();
    }

    // Check session in database for revocation & expiration
    const session = await Session.findById(payload.sessionId);
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user || user.status !== 'active') {
      return next();
    }

    // Update session active timestamp
    session.lastActiveAt = new Date();
    await session.save();

    req.user = user;
    req.sessionRecord = session;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.',
    });
    return;
  }

  next();
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Superadministrator privileges required.',
    });
    return;
  }

  next();
}
