import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.status !== 'open') {
    return NextResponse.json({ error: 'Задание недоступно.' }, { status: 409 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: 'taken', playerId: userId },
  });
  return NextResponse.json(updatedTask);
}
