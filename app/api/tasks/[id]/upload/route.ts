import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Проверяем, авторизован ли пользователь
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = Number(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // 2. Проверяем, что задание существует
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 3. Проверяем, что пользователь — игрок, который взял задание
    if (task.playerId !== user.id) {
      return NextResponse.json(
        { error: 'You are not the player of this task' },
        { status: 403 }
      );
    }

    // 4. Проверяем, что задание в статусе "taken"
    if (task.status !== 'taken') {
      return NextResponse.json(
        { error: 'Task is not in taken status' },
        { status: 400 }
      );
    }

    // 5. ✅ ЗАГЛУШКА — меняем статус на "voting"
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'voting',
        videoUrl: '/uploads/dummy-video.mp4',
      },
    });

    return NextResponse.json({
      success: true,
      message: '✅ Видео загружено (заглушка)!',
      videoUrl: '/uploads/dummy-video.mp4',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить видео: ' + String(error) },
      { status: 500 }
    );
  }
}