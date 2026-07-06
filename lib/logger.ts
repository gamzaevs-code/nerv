import { prisma } from './prisma';
import { getClientIp } from './rate-limit';

export async function logAction(userId: number, action: string, details: unknown = {}, request?: Request) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: JSON.parse(JSON.stringify(details ?? {})),
        ip: request ? getClientIp(request) : null,
        userAgent: request?.headers.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.warn('Activity log failed:', error);
  }
}
