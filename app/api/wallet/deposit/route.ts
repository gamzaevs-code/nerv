import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Сумма должна быть больше 0' }, { status: 400 });
    }

    // Пополняем баланс
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: amount } },
    });

    // Создаём транзакцию
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        reason: `Пополнение баланса на ${amount} ₽`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Баланс пополнен на ${amount} ₽`,
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Не удалось пополнить баланс.' },
      { status: 500 }
    );
  }
}