import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { serializeUser } from '../utils/serializers.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/audit.js';
import { ENV } from '../config/env.js';

export class AuthController {
  private static setAuthCookie(res: Response, token: string): void {
    const isProduction = ENV.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: ENV.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token, session } = await AuthService.register(req.body);
      AuthController.setAuthCookie(res, token);

      await logAuditEvent(req, 'USER_REGISTERED', 'User', user._id.toString(), {
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        user: serializeUser(user),
        token, // Included for API clients / bearer token fallback
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Registration failed.',
      });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token, session } = await AuthService.login(email, password, {
        userAgent: req.get('user-agent'),
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      AuthController.setAuthCookie(res, token);

      await logAuditEvent(req, 'USER_LOGGED_IN', 'User', user._id.toString(), {
        email: user.email,
        sessionId: session._id.toString(),
      });

      res.status(200).json({
        success: true,
        user: serializeUser(user),
        token,
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: err.message || 'Invalid credentials.',
      });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.sessionRecord) {
        await AuthService.revokeSession(req.sessionRecord._id.toString());
        await logAuditEvent(req, 'USER_LOGGED_OUT', 'Session', req.sessionRecord._id.toString());
      }

      const isProduction = ENV.NODE_ENV === 'production';
      res.clearCookie('auth_token', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });
      res.status(200).json({
        success: true,
        message: 'Successfully logged out.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async logoutEverywhere(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user) {
        await AuthService.revokeAllUserSessions(req.user._id.toString());
        await logAuditEvent(req, 'USER_LOGGED_OUT_EVERYWHERE', 'User', req.user._id.toString());
      }

      const isProduction = ENV.NODE_ENV === 'production';
      res.clearCookie('auth_token', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });
      res.status(200).json({
        success: true,
        message: 'All active sessions have been revoked.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      success: true,
      user: serializeUser(req.user),
    });
  }

  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
        return;
      }

      const { User } = await import('../models/User.js');
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // If user is not superadmin or provided currentPassword, verify it
      if (req.user.role !== 'superadmin' || currentPassword) {
        if (!currentPassword) {
          res.status(400).json({ success: false, error: 'Current password is required.' });
          return;
        }
        const bcrypt = (await import('bcryptjs')).default;
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
          res.status(400).json({ success: false, error: 'Current password does not match.' });
          return;
        }
      }

      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      await logAuditEvent(req, 'USER_SELF_PASSWORD_CHANGED', 'User', user._id.toString(), {
        email: user.email,
        fullName: user.fullName,
      });

      res.status(200).json({
        success: true,
        message: 'Your password has been changed successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to change password' });
    }
  }
}
