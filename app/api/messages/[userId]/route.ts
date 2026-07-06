import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const partnerId = Number(params.userId);
  if (!Number.isInteger(partnerId)) {
    return NextResponse.json({ error: 'Некорректный пользователь.' }, { status: 400 });
  }

  await prisma.message.updateMany({
    where: { fromUserId: partnerId, toUserId: userId, isRead: false },
    data: { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: userId, toUserId: partnerId },
        { fromUserId: partnerId, toUserId: userId },
      ],
    },
    include: {
      fromUser: { select: { id: true, name: true, avatar: true } },
      toUser: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}
