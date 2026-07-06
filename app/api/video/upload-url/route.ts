import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    provider: process.env.VIDEO_PROVIDER || 'local',
    uploadUrl: null,
    message: 'Cloudflare Stream/Mux подключается через VIDEO_PROVIDER, CLOUDFLARE_STREAM_TOKEN или MUX_TOKEN. Сейчас используется локальная загрузка.',
  });
}
