import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Сумма должна быть больше 0' }, { status: 400 });
    }

    // Проверяем баланс
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!currentUser || currentUser.balance < amount) {
      return NextResponse.json({ error: 'Недостаточно средств' }, { status: 400 });
    }

    // Списываем деньги и создаём транзакцию
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'withdrawal',
          amount: -amount,
          status: 'completed', // Заглушка: сразу завершена
          reason: `Вывод средств (заглушка) — ${amount} ₽`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `✅ Вывод ${amount} ₽ выполнен (заглушка). Деньги списаны с баланса.`,
      newBalance: result[0].balance,
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json({ error: 'Не удалось выполнить вывод' }, { status: 500 });
  }
}
