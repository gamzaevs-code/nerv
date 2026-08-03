import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Mux from '@mux/mux-node';

export const runtime = 'nodejs';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

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
    const body = await request.json();
    const { uploadId } = body;

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
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

    // Получаем информацию о загруженном файле из Mux
    const upload = await mux.video.uploads.get(uploadId);
    const assetId = upload.asset_id;

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset not ready yet' },
        { status: 400 }
      );
    }

    // Обновляем задание — ставим статус "voting" и сохраняем assetId
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'voting',
        streamAssetId: assetId, // сохраняем ID для плеера
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Видео загружено. Задание отправлено на голосование.',
      assetId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить видео.' },
      { status: 500 }
    );
  }
}