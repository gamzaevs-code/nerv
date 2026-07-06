import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';
import { notifyUser, notifyViewers } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/push';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.playerId !== userId || task.status !== 'taken') {
    return NextResponse.json({ error: 'Задание нельзя загрузить.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('video');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Видео файл обязателен.' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}-${id}-${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const videoUrl = `/uploads/${fileName}`;
  const votingEndsAt = new Date(Date.now() + 30_000);

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      videoUrl,
      votingEndsAt,
      status: 'voting',
    },
  });

  await notifyUser(task.creatorId, 'video_uploaded', `Игрок загрузил видео по заданию «${task.title}»`, `/voting`);
  await notifyViewers('voting_started', `Новое задание на голосовании: «${task.title}»`, `/voting`);
  await sendPushToUser(task.creatorId, { title: 'Видео загружено', body: task.title, url: '/voting' });

  return NextResponse.json(updatedTask);
}
