import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const previous = await prisma.userPresence.findUnique({ where: { userId: user.id } });
  const presence = await prisma.userPresence.upsert({
    where: { userId: user.id },
    update: { isOnline: true, lastSeen: new Date() },
    create: { userId: user.id, isOnline: true },
  });

  const wasOffline = !previous?.isOnline || (previous.lastSeen.getTime() < Date.now() - 5 * 60 * 1000);
  if (wasOffline && user.role === 'player') {
    const subscribers = await prisma.userPresenceSubscription.findMany({
      where: { enabled: true, userId: { not: user.id } },
      select: { userId: true },
    });
    const message = `Игрок ${user.name} зашёл в игру!`;
    await Promise.all(subscribers.map((sub) => Promise.all([
      notifyUser(sub.userId, 'player_online', message, `/player/${user.id}`),
      sendPushToUser(sub.userId, { title: 'Игрок онлайн', body: message, url: `/player/${user.id}` }),
    ])));
  }

  return NextResponse.json({ presence });
  export const runtime = 'nodejs';
}

