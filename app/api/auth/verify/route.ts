import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Токен не указан.' }, { status: 400 });
  }

  // Ищем пользователя по verificationToken (НЕ passwordResetToken!)
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: 'Неверный или истёкший токен.' }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: 'Email уже подтверждён.' });
  }

  if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    return NextResponse.json({ error: 'Токен истёк. Запросите новое письмо.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return NextResponse.json({ message: 'Email успешно подтверждён!' });
}