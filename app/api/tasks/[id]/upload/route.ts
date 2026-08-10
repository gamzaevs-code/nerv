import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const MAX_SIZE = 60 * 1024 * 1024; // 60 МБ
const ALLOWED = /^video\//;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const taskId = Number(params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { playerId: true, status: true },
    });
    if (!task) return NextResponse.json({ error: 'Задание не найдено.' }, { status: 404 });
    if (task.playerId !== user.id) return NextResponse.json({ error: 'Вы не игрок этого задания.' }, { status: 403 });
    if (task.status !== 'taken') return NextResponse.json({ error: 'Задание не в статусе "взято".' }, { status: 400 });

    const formData = await request.formData();
    const file = formData.get('video');
    if (!(file instanceof File) || !ALLOWED.test(file.type)) {
      return NextResponse.json({ error: 'Необходимо загрузить видео-файл.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Видео слишком большое (макс. 60 МБ).' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.webm';
    const fileName = `task-${taskId}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    const videoUrl = `/uploads/${fileName}`;

    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'voting', videoUrl },
    });

    return NextResponse.json({ success: true, message: 'Видео загружено. Задание отправлено на голосование.', videoUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Не удалось загрузить видео.' }, { status: 500 });
  }
}