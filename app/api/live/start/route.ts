import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Mux from '@mux/mux-node';

export const runtime = 'nodejs';

// Инициализация Mux
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description } = body;

    // Создаём Mux Live Stream
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: 'public',
      new_asset_settings: {
        playback_policy: 'public',
      },
      reconnect_window: 60,
    });

    // Сохраняем в БД
    const stream = await prisma.liveStream.create({
      data: {
        userId: user.id,
        title: title || 'Прямой эфир',
        description: description || '',
        streamKey: liveStream.stream_key,
        playbackUrl: liveStream.playback_ids?.[0]?.id || '',
        isActive: true,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      stream: {
        id: stream.id,
        title: stream.title,
        streamKey: liveStream.stream_key,
        playbackId: stream.playbackUrl,
        // Для OBS
        rtmpsUrl: `rtmps://live.mux.com/app/${liveStream.stream_key}`,
      },
    });
  } catch (error) {
    console.error('Mux Live start error:', error);
    return NextResponse.json(
      { error: 'Не удалось запустить стрим' },
      { status: 500 }
    );
  }
}
