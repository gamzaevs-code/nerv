import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Некорректный id.' }, { status: 400 });

  const player = await prisma.user.findFirst({
    where: { id, role: 'player', isBanned: false },
    select: { id: true, name: true, level: true, reputation: true, balance: true, avatar: true, bio: true, location: true, completedTasksCount: true, failedTasksCount: true, presence: true },
  });
  if (!player) return NextResponse.json({ error: 'Игрок не найден.' }, { status: 404 });

  return NextResponse.json({ player });
}
