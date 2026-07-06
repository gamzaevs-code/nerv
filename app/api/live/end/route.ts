import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type EndLiveBody = { id?: number; streamKey?: string };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as EndLiveBody;
  const id = Number(body.id || 0);
  const stream = await prisma.liveStream.findFirst({
    where: {
      isActive: true,
      ...(id > 0 ? { id } : body.streamKey ? { streamKey: body.streamKey } : { userId: user.id }),
    },
  });

  if (!stream) return NextResponse.json({ error: 'Активный эфир не найден.' }, { status: 404 });
  if (stream.userId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Нет прав на завершение эфира.' }, { status: 403 });
  }

  const updated = await prisma.liveStream.update({
    where: { id: stream.id },
    data: { isActive: false, endedAt: new Date(), viewers: 0 },
  });

  return NextResponse.json({ stream: updated });
}
