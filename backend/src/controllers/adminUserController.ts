import bcrypt from 'bcryptjs';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { serializeUser } from '../utils/serializers.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminUserController {
  static async getAllUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        users: users.map(serializeUser),
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { role, permissions, status } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Prevent non-superadmins from escalating to superadmin
      if (role === 'superadmin' && req.user?.role !== 'superadmin') {
        res.status(403).json({ success: false, error: 'Only superadmins can assign superadmin role' });
        return;
      }

      if (role) user.role = role;
      if (permissions) user.permissions = permissions;
      if (status) user.status = status;

      await user.save();

      await logAuditEvent(req, 'USER_PERMISSIONS_UPDATED', 'User', user._id.toString(), {
        role: user.role,
        permissions: user.permissions,
        status: user.status,
      });

      res.status(200).json({
        success: true,
        user: serializeUser(user),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update user' });
    }
  }

  static async changeUserPassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.',
        });
        return;
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      const isSelf = req.user?._id?.toString() === user._id.toString();

      await logAuditEvent(req, 'USER_PASSWORD_RESET_BY_SUPERADMIN', 'User', user._id.toString(), {
        targetUserEmail: user.email,
        targetUserRole: user.role,
        targetUserName: user.fullName,
        isSelfChange: isSelf,
        changedByEmail: req.user?.email,
      });

      res.status(200).json({
        success: true,
        message: isSelf
          ? 'Your password has been successfully updated.'
          : `Password for ${user.fullName} (${user.email}) has been successfully updated.`,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to change password.',
      });
    }
  }
}
