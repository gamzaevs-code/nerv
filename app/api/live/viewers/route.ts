import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { streamId, viewers } = await request.json();

    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: { viewers },
    });

    return NextResponse.json({ success: true, viewers: stream.viewers });
  } catch (error) {
    console.error('Live viewers error:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить зрителей' },
      { status: 500 }
    );
  }
}