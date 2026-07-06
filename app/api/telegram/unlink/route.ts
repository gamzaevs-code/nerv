import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { chatId } = await request.json();
  await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: String(chatId || '').trim(), telegramLinked: true } });
  return NextResponse.json({ ok: true });
}
