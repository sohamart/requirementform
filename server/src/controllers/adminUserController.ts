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
}
