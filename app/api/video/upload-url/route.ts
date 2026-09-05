import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // 1) Авторизация
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Проверка ключей ДО инициализации Mux
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    return NextResponse.json(
      { error: 'Mux не настроен. Видео загружается локально.' },
      { status: 503 }
    );
  }

  try {
    // Ленивый импорт + создание только при наличии ключей
    const Mux = (await import('@mux/mux-node')).default;
    const mux = new Mux({ tokenId, tokenSecret });

    const upload = await mux.video.uploads.create({
      newAssetSettings: { playback_policy: 'public', video_quality: 'basic' },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    return NextResponse.json({
      url: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    });
  } catch (error) {
    console.error('Mux upload error:', error);
    return NextResponse.json({ error: 'Не удалось создать загрузку' }, { status: 500 });
  }
}