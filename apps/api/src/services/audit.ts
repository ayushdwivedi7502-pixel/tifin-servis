import { AuditLog } from '../models/AuditLog';
import { Types } from 'mongoose';

export async function logAudit(
  actorId: Types.ObjectId,
  action: string,
  entityType: string,
  entityId?: Types.ObjectId,
  details?: Record<string, unknown>
): Promise<void> {
  await AuditLog.create({ actorId, action, entityType, entityId, details });
}
