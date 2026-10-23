import { Request } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export async function logAuditEvent(
  req: Request,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const user = (req as any).user;
    await AuditLog.create({
      actorUserId: user?._id,
      actorEmail: user?.email || 'system@internal',
      actorRole: user?.role || 'anonymous',
      action,
      entity,
      entityId,
      details,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
