import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json(
        { error: 'ID стрима обязателен' },
        { status: 400 }
      );
    }

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Стрим не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('Live status error:', error);
    return NextResponse.json(
      { error: 'Не удалось получить статус стрима' },
      { status: 500 }
    );
  }
}