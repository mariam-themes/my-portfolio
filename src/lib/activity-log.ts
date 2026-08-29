import connectToDatabase from '@/lib/mongodb';
import { ActivityLog } from '@/models/ActivityLog';

export interface LogActivityParams {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectToDatabase();
    await ActivityLog.create({
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ip: params.ip,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Activity log failed:', error);
  }
}

export function extractIp(request?: Request): string | undefined {
  if (!request) return undefined;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || undefined;
}