import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Некорректный id.' }, { status: 400 });
  const tasks = await prisma.task.findMany({
    where: { playerId: id, status: { in: ['approved', 'completed'] } },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: { id: true, title: true, description: true, reward: true, status: true, updatedAt: true },
  });
  return NextResponse.json({ tasks });
}
