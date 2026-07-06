import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(notifications);
}
