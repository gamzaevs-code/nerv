import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import Mux from '@mux/mux-node';

export const runtime = 'nodejs';

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
    // Создаём загрузку в Mux
    const upload = await mux.video.uploads.create({
      newAssetSettings: {
        playback_policy: 'public',
        video_quality: 'basic',
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    return NextResponse.json({
      url: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    });
  } catch (error) {
    console.error('Mux upload error:', error);
    return NextResponse.json(
      { error: 'Не удалось создать загрузку' },
      { status: 500 }
    );
  }
}