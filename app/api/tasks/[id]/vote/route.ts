import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';
import { addExperience, checkAchievements } from '@/lib/gamification';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ❌ ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ EMAIL
  // const current = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  // if (!current?.emailVerified) return NextResponse.json({ error: 'Подтвердите email, чтобы голосовать.' }, { status: 403 });

  const id = Number(params.id);
  const { value } = await request.json();

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  if (value !== 'approve' && value !== 'reject') {
    return NextResponse.json({ error: 'Голос должен быть approve или reject.' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.status !== 'voting') {
    return NextResponse.json({ error: 'Голосование недоступно.' }, { status: 409 });
  }

  try {
    const vote = await prisma.vote.create({ data: { taskId: id, voterId: userId, value } });
    await addExperience(userId, 5);
    await checkAchievements(userId);
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Вы уже голосовали по этому заданию.' }, { status: 409 });
    }
    throw error;
  }
}
