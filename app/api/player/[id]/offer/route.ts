import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

type Body = { title?: string; description?: string; reward?: number; deadlineAt?: string };

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const targetId = Number(params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) return NextResponse.json({ error: 'Некорректный id игрока.' }, { status: 400 });
  if (targetId === user.id) return NextResponse.json({ error: 'Нельзя предложить задание себе.' }, { status: 400 });

  const body = (await request.json()) as Body;
  const title = body.title?.trim();
  const reward = Number(body.reward || 0);
  if (!title || !Number.isInteger(reward) || reward <= 0) return NextResponse.json({ error: 'Название и положительная награда обязательны.' }, { status: 400 });

  const target = await prisma.user.findFirst({ where: { id: targetId, role: 'player', isBanned: false } });
  if (!target) return NextResponse.json({ error: 'Игрок не найден.' }, { status: 404 });

  const task = await prisma.task.create({
    data: {
      title,
      description: body.description?.trim() || null,
      reward,
      status: 'offered',
      creatorId: user.id,
      offeredBy: user.id,
      offeredTo: target.id,
      offeredAt: new Date(),
      deadlineAt: body.deadlineAt ? new Date(body.deadlineAt) : null,
    },
  });

  const message = `${user.name} предложил вам задание «${task.title}».`;
  await Promise.all([
    notifyUser(target.id, 'task_offer', message, '/profile'),
    sendPushToUser(target.id, { title: 'Новое предложение задания', body: message, url: '/profile' }),
  ]);

  return NextResponse.json({ task }, { status: 201 });
}
