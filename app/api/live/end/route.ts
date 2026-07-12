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
    const { id } = await request.json();

    const stream = await prisma.liveStream.update({
      where: { id },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, stream });
  } catch (error) {
    console.error('Live end error:', error);
    return NextResponse.json(
      { error: 'Не удалось завершить стрим' },
      { status: 500 }
    );
  }
}