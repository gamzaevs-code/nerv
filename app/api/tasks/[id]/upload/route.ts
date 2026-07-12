import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = Number(params.id);
    if (!taskId) {
      return NextResponse.json({ error: 'Invalid task id' }, { status: 400 });
    }

    // Проверяем, что задание существует и пользователь — игрок
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { playerId: true, status: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.playerId !== user.id) {
      return NextResponse.json(
        { error: 'You are not the player of this task' },
        { status: 403 }
      );
    }

    if (task.status !== 'taken') {
      return NextResponse.json(
        { error: 'Task is not in taken status' },
        { status: 400 }
      );
    }

    // 🔥 ЗАГЛУШКА — просто сохраняем "видео загружено"
    // В реальном проекте здесь должна быть загрузка в S3 / Mux / Cloudflare

    // Обновляем задание — ставим статус "voting" (на голосование)
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'voting',
        videoUrl: '/uploads/dummy-video.mp4', // Заглушка
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Видео загружено. Задание отправлено на голосование.',
      videoUrl: '/uploads/dummy-video.mp4',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить видео.' },
      { status: 500 }
    );
  }
}