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
    const body = await request.json();
    const { title, description } = body;

    // ✅ ЗАГЛУШКА — создаём стрим в БД без Mux
    const stream = await prisma.liveStream.create({
      data: {
        userId: user.id,
        title: title || 'Прямой эфир',
        description: description || '',
        streamKey: `stream_${Date.now()}_${user.id}`,
        playbackUrl: 'dummy-playback-id',
        isActive: true,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      stream: {
        id: stream.id,
        title: stream.title,
        streamKey: stream.streamKey,
        playbackId: stream.playbackUrl,
        rtmpsUrl: `rtmps://live.mux.com/app/${stream.streamKey}`,
      },
    });
  } catch (error) {
    console.error('Live start error:', error);
    return NextResponse.json(
      { error: 'Не удалось запустить стрим' },
      { status: 500 }
    );
  }
}