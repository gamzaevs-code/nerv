import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type ViewersBody = { id?: number; viewers?: number; delta?: number };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json().catch(() => ({}))) as ViewersBody;
  const id = Number(body.id || 0);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Некорректный id эфира.' }, { status: 400 });

  const stream = await prisma.liveStream.findUnique({ where: { id } });
  if (!stream) return NextResponse.json({ error: 'Эфир не найден.' }, { status: 404 });

  let viewers = Math.max(0, Number.isInteger(body.viewers) ? Number(body.viewers) : stream.viewers + Number(body.delta || 1));
  if (!stream.isActive) viewers = 0;

  if (user) {
    await prisma.liveStreamViewer.upsert({
      where: { streamId_viewerId: { streamId: id, viewerId: user.id } },
      update: { joinedAt: new Date() },
      create: { streamId: id, viewerId: user.id },
    }).catch(() => null);
  }

  const updated = await prisma.liveStream.update({ where: { id }, data: { viewers } });
  return NextResponse.json({ viewers: updated.viewers });
}
