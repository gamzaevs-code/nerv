import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, reward, videoUrl } = body;

    if (!title || !reward) {
      return NextResponse.json(
        { error: 'Название и награда обязательны.' },
        { status: 400 }
      );
    }

    // ✅ ПРОВЕРКА EMAIL — ВОЗВРАЩАЕМ
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });
    if (!currentUser?.emailVerified) {
      return NextResponse.json(
        { error: 'Подтвердите email, чтобы создавать задания.' },
        { status: 403 }
      );
    }

    // ✅ ПРОВЕРКА БАЛАНСА
    const creator = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });
    if (!creator || creator.balance < reward) {
      return NextResponse.json(
        { error: 'Недостаточно средств для создания задания.' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        reward: Number(reward),
        creatorId: user.id,
        status: 'open',
        videoUrl: videoUrl || null,
      },
    });

    await logAction(user.id, 'task_created', { taskId: task.id }, request);

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Не удалось создать задание.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const tasks = await prisma.task.findMany({
      where: status ? { status } : {},
      include: {
        creator: { select: { name: true, id: true } },
        player: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Не удалось получить задания.' },
      { status: 500 }
    );
  }
}