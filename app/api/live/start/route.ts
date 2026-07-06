import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { sendPushToRole } from '@/lib/push';

export const runtime = 'nodejs';

type StartLiveBody = { title?: string; description?: string; playbackUrl?: string };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'player' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Прямой эфир доступен только игрокам.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as StartLiveBody;
  const title = body.title?.trim() || `Эфир ${user.name}`;
  const description = body.description?.trim() || null;
  const streamKey = crypto.randomBytes(18).toString('hex');

  await prisma.liveStream.updateMany({
    where: { userId: user.id, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  });

  const stream = await prisma.liveStream.create({
    data: {
      userId: user.id,
      title,
      description,
      streamKey,
      playbackUrl: body.playbackUrl?.trim() || null,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  const message = `Игрок ${user.name} начал прямой эфир: ${title}`;
  const players = await prisma.user.findMany({ where: { isBanned: false, id: { not: user.id } }, select: { id: true } });
  await Promise.all([
    ...players.map((target) => notifyUser(target.id, 'live_started', message, `/live/${stream.id}`)),
    sendPushToRole('viewer', { title: 'Прямой эфир', body: message, url: `/live/${stream.id}` }),
    sendPushToRole('player', { title: 'Прямой эфир', body: message, url: `/live/${stream.id}` }),
  ]);

  return NextResponse.json({ stream }, { status: 201 });
}
