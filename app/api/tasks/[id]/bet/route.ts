import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ✅ ТОЛЬКО ЗРИТЕЛИ И АДМИНЫ МОГУТ ДЕЛАТЬ ПРОГНОЗЫ
  if (user.role !== 'viewer' && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Только зрители и администраторы могут делать прогнозы.' },
      { status: 403 }
    );
  }

  const { amount, chosenOutcome } = await request.json();
  const value = Number(amount);
  if (!['approve', 'reject'].includes(chosenOutcome) || !Number.isInteger(value) || value <= 0 || value > user.balance) return NextResponse.json({ error: 'Некорректный прогноз.' }, { status: 400 });
  const bet = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: value } } });
    await tx.transaction.create({ data: { userId: user.id, type: 'bet', amount: -value, status: 'completed', reason: `Прогноз на задание ${params.id}` } });
    return tx.bet.create({ data: { taskId: Number(params.id), userId: user.id, amount: value, chosenOutcome } });
  });
  return NextResponse.json(bet, { status: 201 });
}