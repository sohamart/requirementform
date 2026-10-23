import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export class AuditLogController {
  static async getAllAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
      res.status(200).json({
        success: true,
        logs: logs.map((l) => ({
          id: l._id.toString(),
          actorEmail: l.actorEmail,
          actorRole: l.actorRole,
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt.toISOString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }
}
