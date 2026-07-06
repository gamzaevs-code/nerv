import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Некорректный id задания.' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, reputation: true, level: true } },
      player: { select: { id: true, name: true, reputation: true, level: true } },
      votes: true,
      bets: true,
    },
  });

  if (!task) return NextResponse.json({ error: 'Задание не найдено.' }, { status: 404 });
  return NextResponse.json({ task });
}
