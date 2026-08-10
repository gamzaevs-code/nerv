import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserIdFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== 'player') {
    return NextResponse.json({ error: 'Только игроки могут брать задания.' }, { status: 403 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  // ✅ АТОМАРНОЕ ВЗЯТИЕ — только если задание "open" и ещё никем не взято
  const updated = await prisma.task.updateMany({
    where: { id, status: 'open', playerId: null },
    data: { status: 'taken', playerId: userId },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: 'Задание уже взято или недоступно.' }, { status: 409 });
  }

  return NextResponse.json({ success: true, taskId: id });
}