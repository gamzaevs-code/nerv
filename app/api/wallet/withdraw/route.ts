import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { amount } = await request.json();
  const value = Number(amount);
  if (!Number.isInteger(value) || value <= 0 || value > user.balance) return NextResponse.json({ error: 'Некорректная сумма.' }, { status: 400 });
  const tx = await prisma.$transaction(async (db) => {
    await db.user.update({ where: { id: user.id }, data: { balance: { decrement: value } } });
    return db.transaction.create({ data: { userId: user.id, type: 'withdraw', amount: -value, status: 'pending', reason: 'Заявка на вывод средств (Stripe Connect подключается отдельно)' } });
  });
  return NextResponse.json(tx);
}
