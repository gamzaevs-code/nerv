import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

export const runtime = 'nodejs';

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ ok: true, message: 'Безопасный restore требует ручного подтверждения и маппинга схемы. Импорт файла принят как будущая production-задача.' });
}
