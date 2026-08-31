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

export function extractIp(request?: any): string | undefined {
  if (!request || !request.headers) return undefined;
  
  let forwarded;
  let realIp;

  if (typeof request.headers.get === 'function') {
    forwarded = request.headers.get('x-forwarded-for');
    realIp = request.headers.get('x-real-ip');
  } else {
    // NextAuth passes headers as a plain object
    forwarded = request.headers['x-forwarded-for'];
    realIp = request.headers['x-real-ip'];
  }

  if (forwarded) return String(forwarded).split(',')[0].trim();
  return realIp ? String(realIp) : undefined;
}