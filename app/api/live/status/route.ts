import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id') || 0);
  const userId = Number(searchParams.get('userId') || 0);

  const where = id > 0 ? { id } : userId > 0 ? { userId, isActive: true } : { isActive: true };
  const streams = await prisma.liveStream.findMany({
    where,
    include: { user: { select: { id: true, name: true, level: true, reputation: true, avatar: true } } },
    orderBy: { startedAt: 'desc' },
    take: id > 0 || userId > 0 ? 1 : 50,
  });

  return NextResponse.json({ streams, stream: streams[0] || null });
}
