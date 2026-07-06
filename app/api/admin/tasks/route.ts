import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tasks = await prisma.task.findMany({
    include: { creator: { select: { name: true } }, player: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json(tasks);
}
