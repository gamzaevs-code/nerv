import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { status: 'voting' },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ count: tasks.length, ids: tasks.map((task) => task.id), latest: tasks[0]?.updatedAt ?? null });
}
