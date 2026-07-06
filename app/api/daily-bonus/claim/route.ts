import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function sameDay(a?: Date | null) { const d = new Date(); return !!a && a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth() && a.getDate() === d.getDate(); }

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const full = await prisma.user.findUnique({ where: { id: user.id } });
  if (sameDay(full?.lastDailyBonusAt)) return NextResponse.json({ error: 'Бонус уже получен сегодня.' }, { status: 409 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { balance: { increment: 50 }, lastDailyBonusAt: new Date(), loginStreak: { increment: 1 } } }),
    prisma.transaction.create({ data: { userId: user.id, type: 'daily_bonus', amount: 50, status: 'completed', reason: 'Ежедневный бонус' } }),
  ]);
  return NextResponse.json({ ok: true, amount: 50 });
}
