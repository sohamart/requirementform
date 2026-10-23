import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { SystemPermission } from '@shared/constants/index.js';

export function requirePermission(permission: SystemPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    // Superadmin has all permissions by default
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied: Administrator privileges required.',
      });
      return;
    }

    const hasPermission = req.user.permissions?.includes(permission);
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: `Access denied: Missing required permission '${permission}'.`,
      });
      return;
    }

    next();
  };
}
